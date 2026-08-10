import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Facilities from './pages/Facilities.jsx'
import Pricing from './pages/Pricing.jsx'
import Membership from './pages/Membership.jsx'
import Restaurant from './pages/Restaurant.jsx'
import Venue from './pages/Venue.jsx'
import Events from './pages/Events.jsx'
import Rules from './pages/Rules.jsx'
import Gallery from './pages/Gallery.jsx'
import Contact from './pages/Contact.jsx'
import Booking from './pages/Booking.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

// Route table (react-router v6 data-route shape, consumed by vite-react-ssg).
// Nav paths match content.js `nav_links`; /admin is intentionally out of the nav
// and sitemap. Booking + admin fetch their data client-side (useEffect), so they
// prerender their static shell and hydrate live — no SSR hazard.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'facilities', element: <Facilities /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'membership', element: <Membership /> },
      { path: 'restaurant', element: <Restaurant /> },
      { path: 'venue-hire', element: <Venue /> },
      { path: 'events', element: <Events /> },
      { path: 'club-rules', element: <Rules /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'contact', element: <Contact /> },
      { path: 'booking', element: <Booking /> },
      { path: 'admin', element: <Admin /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
