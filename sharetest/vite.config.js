import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/line-liff-v2-starter/sharetest/', // ← リポジトリ名 + フォルダ名
})
