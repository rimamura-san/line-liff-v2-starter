import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 用の設定
export default defineConfig({
  plugins: [react()],
  base: '/line-liff-v2-starter/omikuji/', // ★ あなたのGitHubリポジトリ名に合わせる
})
