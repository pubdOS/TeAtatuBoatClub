import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// On every route change: go to the #anchor if the link has one (the home hero's
// "Get tickets" points at /events/snapper-classic#tickets), else to the top.
// The target sets its own scroll-margin so the fixed navbar does not cover it.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
