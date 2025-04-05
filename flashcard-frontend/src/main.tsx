import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    // FIXME: This causes components to mount twice - turn it off in prod mode.
    // Also, add a prod mode.
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
