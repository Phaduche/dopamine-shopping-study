import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 연구용 모의 쇼핑 앱 빌드 설정
export default defineConfig({
  plugins: [react()],
  base: './',
})
