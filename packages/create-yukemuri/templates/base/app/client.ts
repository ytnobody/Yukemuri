import { hydrate } from 'preact'
import App from './routes/index'
import 'uno.css'

// SSRされたHTMLをハイドレート
const app = document.getElementById('app')
if (app) {
  hydrate(App(), app)
}