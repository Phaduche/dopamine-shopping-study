// ============================================================
// 전역 연구 상태 (조건 / 장바구니 / 주문 / 설문 / 시계)
// ============================================================
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { load, save } from '../lib/storage.js'
import { getCondition, normalizeCondition, DEFAULT_CONDITION } from '../lib/conditions.js'
import * as logger from '../lib/logger.js'

const StudyCtx = createContext(null)

function stateKey(pid) {
  return `state.${pid || 'anon'}`
}

const initial = {
  pid: null,
  cond: DEFAULT_CONDITION,
  sim: 0,
  cart: [], // [{ id, qty }]
  preferred: null, // C조건 '가장 선호 상품' id
  order: null, // { orderedAt, items:[{id,qty}], total }
  responses: {}, // { T0: {answers, submittedAt, latencyMs}, ... }
  ready: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, ready: true }
    case 'SET_SESSION':
      return { ...state, pid: action.pid, cond: action.cond, sim: action.sim }
    case 'ADD_CART': {
      const found = state.cart.find((c) => c.id === action.id)
      const cart = found
        ? state.cart.map((c) => (c.id === action.id ? { ...c, qty: c.qty + (action.qty || 1) } : c))
        : [...state.cart, { id: action.id, qty: action.qty || 1 }]
      return { ...state, cart }
    }
    case 'SET_QTY': {
      const cart = state.cart
        .map((c) => (c.id === action.id ? { ...c, qty: Math.max(0, action.qty) } : c))
        .filter((c) => c.qty > 0)
      return { ...state, cart }
    }
    case 'REMOVE_CART':
      return { ...state, cart: state.cart.filter((c) => c.id !== action.id) }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    case 'SET_PREFERRED':
      return { ...state, preferred: action.id }
    case 'PLACE_ORDER':
      return { ...state, order: action.order, cart: [] }
    case 'RESET_ORDER':
      return { ...state, order: null }
    case 'SAVE_SURVEY':
      return { ...state, responses: { ...state.responses, [action.timepoint]: action.data } }
    case 'RESET_ALL':
      return { ...initial, pid: state.pid, cond: state.cond, sim: state.sim, ready: true }
    default:
      return state
  }
}

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [params, setParams] = useSearchParams()
  const hydratedPid = useRef(null)

  // URL 파라미터로 세션 배정 (?cond=&pid=&sim=)
  useEffect(() => {
    const rawCond = normalizeCondition(params.get('cond')) || DEFAULT_CONDITION
    const pid = params.get('pid') || load('lastPid', null) || `anon-${Date.now().toString(36)}`
    const sim = Number(params.get('sim')) || 0

    // 세션 메타 기록 + 앱 실행 로그
    logger.initSession({ pid, cond: rawCond, sim })
    logger.logEvent('app_open', { sim })
    save('lastPid', pid)

    // 저장된 상태 복원
    const persisted = load(stateKey(pid), null)
    hydratedPid.current = pid
    dispatch({
      type: 'HYDRATE',
      payload: {
        pid,
        cond: rawCond,
        sim,
        cart: persisted?.cart || [],
        preferred: persisted?.preferred || null,
        order: persisted?.order || null,
        responses: persisted?.responses || {},
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 상태 변경 시 영속화
  useEffect(() => {
    if (!state.ready || !state.pid) return
    save(stateKey(state.pid), {
      cart: state.cart,
      preferred: state.preferred,
      order: state.order,
      responses: state.responses,
    })
  }, [state])

  const condition = getCondition(state.cond)

  const api = useMemo(() => {
    return {
      state,
      condition,
      // 장바구니
      addToCart: (id, qty = 1) => {
        logger.logEvent('cart_add', { pid: state.pid, productId: id, qty })
        dispatch({ type: 'ADD_CART', id, qty })
      },
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      removeFromCart: (id) => {
        logger.logEvent('cart_remove', { productId: id })
        dispatch({ type: 'REMOVE_CART', id })
      },
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      // C조건 선호상품 선택
      selectPreferred: (id) => {
        const prev = state.preferred
        if (prev && prev !== id) logger.logEvent('target_change', { from: prev, to: id })
        logger.logEvent('preferred_select', { productId: id })
        dispatch({ type: 'SET_PREFERRED', id })
      },
      // 주문 (모의 — 실제 결제 없음)
      placeOrder: () => {
        const order = {
          orderedAt: Date.now(),
          items: state.cart.map((c) => ({ ...c })),
          preferred: state.preferred,
        }
        logger.logEvent('order_placed', {
          itemCount: order.items.reduce((a, b) => a + b.qty, 0),
          products: order.items.map((i) => i.id),
        })
        dispatch({ type: 'PLACE_ORDER', order })
        return order
      },
      resetOrder: () => dispatch({ type: 'RESET_ORDER' }),
      // 설문 저장
      saveSurvey: (timepoint, answers, shownAt) => {
        const submittedAt = Date.now()
        const latencyMs = shownAt ? submittedAt - shownAt : null
        const data = { answers, submittedAt, latencyMs }
        logger.logEvent('survey_submit', { timepoint, latencyMs, answerCount: Object.keys(answers).length })
        dispatch({ type: 'SAVE_SURVEY', timepoint, data })
      },
      resetAll: () => {
        dispatch({ type: 'RESET_ALL' })
      },
      // 조건 재배정 (관리자용)
      reassign: ({ pid, cond, sim }) => {
        const next = new URLSearchParams(params)
        if (pid) next.set('pid', pid)
        if (cond) next.set('cond', cond)
        if (sim != null) next.set('sim', String(sim))
        setParams(next)
        // 새로고침 없이 반영되도록 세션 재초기화
        logger.initSession({ pid, cond, sim })
        dispatch({ type: 'SET_SESSION', pid, cond, sim })
      },
    }
  }, [state, condition, params, setParams])

  return <StudyCtx.Provider value={api}>{children}</StudyCtx.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyCtx)
  if (!ctx) throw new Error('useStudy must be used within StudyProvider')
  return ctx
}
