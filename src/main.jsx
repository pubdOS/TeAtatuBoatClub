import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App.jsx'
import './index.css'

// Prerendered (SSG) entry. `vite-react-ssg build` renders every static route in
// `routes` to real HTML with its own <head> (title, meta, canonical, OG, JSON-LD),
// so crawlers — including AI crawlers that don't run JS — see a full page on first
// byte. In the browser this same export hydrates the app. See SEO_ENGINE_ROADMAP.md.
export const createRoot = ViteReactSSG({ routes })
