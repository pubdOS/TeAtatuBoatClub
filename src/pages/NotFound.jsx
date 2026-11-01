import { Link } from 'react-router-dom'
import { Head } from 'vite-react-ssg'

export default function NotFound() {
  // Prerendered as 404.html and served with a real 404 status, so Google drops a
  // stray address instead of reading it as a copy of the home page.
  return (
    <>
    <Head>
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
    </Head>
    <section className="flex min-h-[70vh] items-center justify-center bg-navy px-5 text-center text-white">
      <div>
        <p className="text-6xl font-semibold text-accent">404</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Looks like that page has drifted off its mooring. Let’s get you back on course.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/contact" className="btn-secondary">Contact the Club</Link>
        </div>
      </div>
    </section>
    </>
  )
}
