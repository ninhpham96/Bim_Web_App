import { defineConfig, loadEnv, } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
const config = () => {
  const env = loadEnv('development', process.cwd(), "")
  return {
    Worker: {
      plugins: [react()]
    },
    server: {
      port: Number(env.PORT)
    },
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment'
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
}

export default defineConfig(config)