import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FlowEditorPage } from './pages/FlowEditorPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlowEditorPage />
  </StrictMode>,
)
