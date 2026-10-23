import { useMemo, useRef, useState } from 'react'
import { surveyForTimepoint } from '../data/surveys.js'
import { useStudy } from '../context/StudyContext.jsx'
import * as logger from '../lib/logger.js'

// 설문 모달 — 측정시점(T0~T7) 설문을 렌더링하고 응답을 저장
export default function SurveyModal({ timepoint, onClose }) {
  const { condition, saveSurvey } = useStudy()
  const survey = useMemo(() => surveyForTimepoint(timepoint, condition.key), [timepoint, condition.key])
  const shownAt = useRef(Date.now())
  const [answers, setAnswers] = useState(() => {
    // VAS 기본값 50
    const init = {}
    survey?.items.forEach((it) => {
      if (it.type === 'vas') init[it.id] = 50
    })
    return init
  })

  // 설문 노출 로그
  useRef(
    (() => {
      logger.logEvent('survey_shown', { timepoint })
      return true
    })(),
  )

  if (!survey) return null

  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }))

  const required = survey.items.filter((it) => it.type !== 'vas') // vas는 기본값 있음
  const answeredCount = required.filter((it) => answers[it.id] != null).length
  const canSubmit = answeredCount === required.length

  const submit = () => {
    if (!canSubmit) return
    saveSurvey(timepoint, answers, shownAt.current)
    onClose(true)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={survey.title}>
      <div className="modal">
        <div className="modal__head">
          <h3>{survey.title}</h3>
          <p>{survey.note}</p>
        </div>
        <div className="modal__body">
          {survey.items.map((it) => (
            <div className="q" key={it.id}>
              <div className="q__text">{it.text}</div>
              {it.type === 'vas' && (
                <div className="vas">
                  <input
                    type="range"
                    min={it.min}
                    max={it.max}
                    value={answers[it.id]}
                    onChange={(e) => set(it.id, Number(e.target.value))}
                    aria-label={it.text}
                  />
                  <div className="vas__labels">
                    <span>{it.lo} ({it.min})</span>
                    <span className="vas__val">{answers[it.id]}</span>
                    <span>{it.hi} ({it.max})</span>
                  </div>
                </div>
              )}
              {it.type === 'likert7' && (
                <div>
                  <div className="likert">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={answers[it.id] === n ? 'sel' : ''}
                        onClick={() => set(it.id, n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="likert-labels">
                    <span>{it.lo}</span>
                    <span>{it.hi}</span>
                  </div>
                </div>
              )}
              {it.type === 'choice' && (
                <div className="choice-opts">
                  {it.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      className={answers[it.id] === opt ? 'sel' : ''}
                      onClick={() => set(it.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="modal__foot">
          <button className="btn btn-primary btn-block btn-lg" onClick={submit} disabled={!canSubmit}>
            {canSubmit ? '응답 제출' : `남은 문항 ${required.length - answeredCount}개`}
          </button>
        </div>
      </div>
    </div>
  )
}
