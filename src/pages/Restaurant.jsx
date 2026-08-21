import { useState } from 'react'
import { Link } from 'react-router-dom'
import c from '../../content.js'
import SmartLink from '../components/SmartLink.jsx'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'
import Lightbox from '../components/Lightbox.jsx'

export default function Restaurant() {
  const [menu, setMenu] = useState(null)
  const menus = [c.restaurant_menu_dine_image, c.restaurant_menu_catering_image]
  return (
    <>
      <Seo title={c.restaurant_seo_title} description={c.restaurant_seo_description} />
      <span hidden data-cms="Restaurant - SEO - Page Title">{c.restaurant_seo_title}</span>
      <span hidden data-cms="Restaurant - SEO - Meta Description">{c.restaurant_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Restaurant - Hero - Heading">
            {c.restaurant_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Restaurant - Hero - Sub">{c.restaurant_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section mx-auto max-w-3xl text-center">
        <AnimatedSection>
          <p className="text-lg text-navy/70" data-cms="Restaurant - Intro - Body">{c.restaurant_intro_body}</p>
        </AnimatedSection>
      </section>

      {/* Hours */}
      <section className="bg-sand">
        <div className="section grid gap-8 md:grid-cols-2">
          <AnimatedSection className="h-full">
            <div className="card h-full p-7">
              <h2 className="text-xl font-semibold" data-cms="Restaurant - Club Rooms - Heading">
                {c.restaurant_clubrooms_heading}
              </h2>
              <ul data-cms-repeater="Restaurant - Club Rooms - Hours" data-cms-shape="list" data-cms-min="1" data-cms-max="7" data-cms-overflow="wrap" className="mt-4 divide-y divide-navy/5">
                {c.clubrooms_hours.map((row, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium text-navy" data-cms-field="days">{row.days}</span>
                    <span className="text-navy/70" data-cms-field="time">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={120} className="h-full">
            <div className="card h-full p-7">
              <h2 className="text-xl font-semibold" data-cms="Restaurant - Kitchen - Heading">
                {c.restaurant_kitchen_heading}
              </h2>
              <p className="mt-1 text-sm text-navy/60" data-cms="Restaurant - Kitchen - Sub">{c.restaurant_kitchen_sub}</p>
              <ul data-cms-repeater="Restaurant - Kitchen - Hours" data-cms-shape="list" data-cms-min="1" data-cms-max="7" data-cms-overflow="wrap" className="mt-4 divide-y divide-navy/5">
                {c.kitchen_hours.map((row, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium text-navy" data-cms-field="days">{row.days}</span>
                    <span className="text-navy/70" data-cms-field="time">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Menus */}
      <section className="section">
        <AnimatedSection className="mb-8 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Restaurant - Menus - Heading">
            {c.restaurant_menu_heading}
          </h2>
        </AnimatedSection>
        <div className="grid gap-6 sm:grid-cols-2">
          <button type="button" onClick={() => setMenu(0)} className="group block focus:outline-none" aria-label="Enlarge dining menu">
            <img
              src={c.restaurant_menu_dine_image}
              data-cms="Restaurant - Menus - Dine Image"
              alt="Dining menu"
              className="w-full cursor-zoom-in rounded-2xl border border-navy/10 bg-navy/5 object-cover transition-shadow group-hover:shadow-lg"
            />
          </button>
          <button type="button" onClick={() => setMenu(1)} className="group block focus:outline-none" aria-label="Enlarge catering menu">
            <img
              src={c.restaurant_menu_catering_image}
              data-cms="Restaurant - Menus - Catering Image"
              alt="Catering menu"
              className="w-full cursor-zoom-in rounded-2xl border border-navy/10 bg-navy/5 object-cover transition-shadow group-hover:shadow-lg"
            />
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-navy/50" data-cms="Restaurant - Menus - Hint">{c.restaurant_menus_hint}</p>
      </section>

      {/* CTA */}
      <section className="bg-navy text-white">
        <div className="section text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-semibold md:text-4xl" data-cms="Restaurant - CTA - Heading">
              {c.restaurant_cta_heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80" data-cms="Restaurant - CTA - Body">
              {c.restaurant_cta_body}
            </p>
            <SmartLink to={c.restaurant_cta_button_link} className="btn-primary mt-8" data-cms="Restaurant - CTA - Button">
              {c.restaurant_cta_button}
            </SmartLink>
            <span hidden data-cms="Restaurant - CTA - Button Link">{c.restaurant_cta_button_link}</span>
          </AnimatedSection>
        </div>
      </section>

      <Lightbox items={menus} index={menu} setIndex={setMenu} />
    </>
  )
}
