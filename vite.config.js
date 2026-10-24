import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 경로:
//  - GitHub Pages(프로젝트 사이트)는 /<repo>/ 하위 경로에서 서비스되므로 DEPLOY_BASE로 주입
//  - Vercel 등 루트 도메인 배포는 기본값 '/'
// 라우터 basename은 import.meta.env.BASE_URL(=이 base)로 자동 연동된다.
const base = process.env.DEPLOY_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
})
