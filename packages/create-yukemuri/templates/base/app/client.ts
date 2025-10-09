import { hydrate } from 'preact'
import App from './routes/index'

// SSRされたHTMLをハイドレート
const app = document.getElementById('app')
if (app) {
  hydrate(App(), app)
}