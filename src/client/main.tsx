import ReactDom from 'react-dom/client'
import { App } from './App'

import './global.css'
import Layout from './components/layout/layout'

ReactDom.createRoot(document.getElementById('root')!).render(
  <Layout>
    <App />
  </Layout>
)
