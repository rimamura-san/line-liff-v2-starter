import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/line-liff-v2-starter/channel_consent_demo/', // リポジトリ名 + フォルダ名
})
