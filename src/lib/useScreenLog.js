// 화면 체류시간 로깅 훅 (v6 §15: 화면별 체류시간)
import { useEffect } from 'react'
import * as logger from './logger.js'

export function useScreenLog(screenName, extra = {}) {
  useEffect(() => {
    const enterAt = Date.now()
    logger.logEvent('screen_enter', { screen: screenName, ...extra })
    return () => {
      const dwellMs = Date.now() - enterAt
      logger.logEvent('screen_exit', { screen: screenName, dwellMs })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenName])
}
