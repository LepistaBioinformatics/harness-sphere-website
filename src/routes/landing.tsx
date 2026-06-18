import { Hero } from '../components/landing/hero'
import { Why } from '../components/landing/why'
import { Layers } from '../components/landing/layers'
import { Resilience } from '../components/landing/resilience'
import { RunsAnywhere } from '../components/landing/runs-anywhere'
import { Ecosystem } from '../components/landing/ecosystem'
import { CTA } from '../components/landing/cta'

export default function Landing() {
  return (
    <>
      <Hero />
      <Why />
      <Layers />
      <Resilience />
      <RunsAnywhere />
      <Ecosystem />
      <CTA />
    </>
  )
}
