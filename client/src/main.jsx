import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Enable axios to send cookies with every request (httpOnly cookie)
axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
 
    <StrictMode>
      <App />
    </StrictMode>
 
)
