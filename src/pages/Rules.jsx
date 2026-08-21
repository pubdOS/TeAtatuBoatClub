import c from '../../content.js'
import Seo from '../components/Seo.jsx'
import AnimatedSection from '../components/AnimatedSection.jsx'
import WaveDivider from '../components/WaveDivider.jsx'

export default function Rules() {
  return (
    <>
      <Seo title={c.rules_seo_title} description={c.rules_seo_description} />
      <span hidden data-cms="Rules - SEO - Page Title">{c.rules_seo_title}</span>
      <span hidden data-cms="Rules - SEO - Meta Description">{c.rules_seo_description}</span>
      <section className="bg-navy py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-5">
          <h1 className="text-4xl font-semibold md:text-5xl" data-cms="Rules - Hero - Heading">
            {c.rules_hero_heading}
          </h1>
          <p className="mt-4 text-lg text-white/75" data-cms="Rules - Hero - Sub">{c.rules_hero_sub}</p>
        </div>
      </section>
      <WaveDivider />

      <section className="section mx-auto max-w-3xl">
        <AnimatedSection className="mb-8">
          <p className="text-lg text-navy/70" data-cms="Rules - Content - Body">{c.rules_intro_body}</p>
        </AnimatedSection>

        <div data-cms-repeater="Rules - Content - Groups" data-cms-shape="card" data-cms-min="2" data-cms-overflow="wrap" className="space-y-5">
          {c.rules_groups.map((g, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-display text-lg font-semibold text-navy" data-cms-field="title">{g.title}</h3>
              <p className="mt-2 text-sm text-navy/70" data-cms-field="body">{g.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900" data-cms="Rules - Content - Notice">
          {c.rules_notice}
        </p>
      </section>
    </>
  )
}
