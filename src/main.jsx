import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// 행동로그 중복을 피하기 위해 StrictMode(개발 모드 effect 2회 실행)를 사용하지 않음
// basename: Vite의 base(import.meta.env.BASE_URL)에 맞춰 GitHub Pages 하위경로/루트 모두 대응
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>,
)
