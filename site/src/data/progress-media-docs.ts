import { authoredComponentDetail } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { documentedTokens } from './documented-tokens'

// Authored documentation for the verified Bootstrap 6 pin, not a core adapter.
const steps = `<ol class="stepper theme-inverse" aria-label="Account setup progress">
  <li class="stepper-item active">Account — complete</li>
  <li class="stepper-item active" aria-current="step">Profile — current</li>
  <li class="stepper-item">Confirm — pending</li>
</ol>`
export const stepperExample = steps
export const stepperDetails: ComponentDetail = authoredComponentDetail("stepper", {
    variants: [
        { markup: steps },
        { markup: `<ol class="stepper theme-inverse" aria-label="Deployment progress">
  <li class="stepper-item active align-items-start"><div><strong class="d-block">Build — complete</strong><small class="fg-2">Compiled successfully</small></div></li>
  <li class="stepper-item active align-items-start" aria-current="step"><div><strong class="d-block">Review — current</strong><small class="fg-2">Approval pending</small></div></li>
  <li class="stepper-item align-items-start"><div><strong class="d-block">Release — pending</strong><small class="fg-2">Not started</small></div></li>
</ol>` },
        { markup: `<div class="contains-inline">
  <ol class="stepper sm:stepper-horizontal theme-inverse" aria-label="Responsive checkout progress">
    <li class="stepper-item active">Shipping — complete</li>
    <li class="stepper-item active" aria-current="step">Payment — current</li>
    <li class="stepper-item">Review — pending</li>
  </ol>
</div>` },
        { markup: `<div class="stepper-overflow" tabindex="0" role="region" aria-label="Scrollable onboarding progress">
  <ol class="stepper stepper-horizontal theme-inverse" aria-label="Onboarding progress">
    <li class="stepper-item active">Create account — complete</li>
    <li class="stepper-item active" aria-current="step">Verify email address — current</li>
    <li class="stepper-item">Complete profile setup — pending</li>
    <li class="stepper-item">Add payment method — pending</li>
    <li class="stepper-item">Review and confirm — pending</li>
    <li class="stepper-item">Finish onboarding — pending</li>
  </ol>
</div>` },
        { markup: `<ol class="stepper theme-inverse" aria-label="Application progress">
  <li class="stepper-item active" aria-current="step">Details — current</li>
  <li class="stepper-item"><div>Documents — unavailable<small class="d-block fg-2">Complete Details first.</small></div></li>
  <li class="stepper-item"><div>Submit — unavailable<small class="d-block fg-2">Upload Documents first.</small></div></li>
</ol>` },
        { markup: `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body">${steps.replace('Account setup progress', 'Setup progress')}</div>` }
    ],
    variables: documentedTokens('stepper'),
    sass: `@use 'tremplin/scss/stepper' with (
  $stepper-tokens: (
    --trm-stepper-size: 2.5rem,
    --trm-stepper-gap: 1.5rem
  )
);`
})

const slide = (title: string, text: string, index: number, count: number, surface = 'bg-1') => `<div class="carousel-item${index === 0 ? ' active' : ''}" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${count}"><div class="p-4 rounded-5 ${surface} fg-body" style="min-block-size: 10rem"><h3 class="h5">${title}</h3><p class="mb-0">${text}</p></div></div>`
const controls = (id: string, indicators = false) => `<div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
  <button class="btn-outline theme-inverse btn-icon" type="button" data-trm-slide="prev" data-trm-target="#${id}" aria-label="Previous slide"><span class="carousel-icon-prev" aria-hidden="true"></span></button>
  ${indicators ? `<div class="carousel-indicators"><button type="button" class="active" data-trm-slide-to="0" data-trm-target="#${id}" aria-label="Slide 1" aria-current="true"></button><button type="button" data-trm-slide-to="1" data-trm-target="#${id}" aria-label="Slide 2"></button><button type="button" data-trm-slide-to="2" data-trm-target="#${id}" aria-label="Slide 3"></button></div>` : ''}
  <button class="btn-outline theme-inverse btn-icon" type="button" data-trm-slide="next" data-trm-target="#${id}" aria-label="Next slide"><span class="carousel-icon-next" aria-hidden="true"></span></button>
</div>`
export const carouselExample = `<div class="carousel" id="demo-carousel" role="region" aria-label="Featured projects">
  <div class="carousel-inner" tabindex="0" role="group" aria-label="Featured project slides">${slide('First slide', 'Plan the next milestone.', 0, 2)}${slide('Second slide', 'Build and review the interface.', 1, 2, 'bg-2')}</div>
  ${controls('demo-carousel')}
</div>`
export const carouselDetails: ComponentDetail = authoredComponentDetail("carousel", {
    variants: [
        { markup: `<div class="carousel" id="carousel-controls" role="region" aria-label="Project highlights" style="--trm-carousel-indicator-width: 1.5rem; --trm-carousel-indicator-height: 1.5rem">
  <div class="carousel-inner" tabindex="0" role="group" aria-label="Project highlight slides">${slide('Plan', 'Define tokens and component contracts.', 0, 3)}${slide('Build', 'Implement accessible interactions.', 1, 3, 'bg-2')}${slide('Ship', 'Verify packages and documentation.', 2, 3, 'bg-3')}</div>
  ${controls('carousel-controls', true)}
</div>` },
        { markup: `<div class="carousel carousel-center" id="carousel-multi" role="region" aria-label="Team projects" style="--trm-carousel-items: 2; --trm-carousel-items-gap: 1rem; --trm-carousel-items-peek: 1rem">
  <div class="carousel-inner" tabindex="0" role="group" aria-label="Team project slides">${slide('Design system', 'Tokens and patterns.', 0, 3)}${slide('Dashboard', 'Operational metrics.', 1, 3, 'bg-2')}${slide('Portal', 'Customer workflows.', 2, 3, 'bg-3')}</div>
  ${controls('carousel-multi')}
</div>` },
        { markup: `<div class="carousel carousel-fade" id="carousel-fade" role="region" aria-label="Release stages">
  <div class="carousel-inner">${slide('Alpha', 'API exploration.', 0, 2)}${slide('Beta', 'Production hardening.', 1, 2, 'bg-2')}</div>
  <div class="d-flex flex-wrap justify-content-center gap-2"><button class="btn-outline theme-inverse btn-sm" type="button" data-trm-slide="prev" data-trm-target="#carousel-fade">Previous</button><button class="btn-outline theme-inverse btn-sm" type="button" data-trm-slide="next" data-trm-target="#carousel-fade">Next</button></div>
</div>` },
        { markup: `<div class="carousel" id="carousel-autoplay" role="region" aria-label="Announcements" data-trm-autoplay="false" data-trm-interval="6000">
  <div class="carousel-inner" tabindex="0" role="group" aria-label="Announcement slides">${slide('Documentation release', 'Read the latest guides.', 0, 2)}${slide('New starter templates', 'Explore the available project patterns.', 1, 2, 'bg-2')}</div>
  <button class="btn-outline theme-inverse btn-icon align-self-center carousel-control-play-pause paused" type="button" data-trm-target="#carousel-autoplay" data-trm-pause-label="Pause announcements" data-trm-play-label="Play announcements" aria-label="Play announcements"><span class="carousel-icon-pause" aria-hidden="true"></span><span class="carousel-icon-play" aria-hidden="true"></span></button>
</div>` },
        { markup: `<div data-trm-theme="dark" dir="rtl" class="p-3 rounded-5 bg-body fg-body"><div class="carousel" id="carousel-rtl" role="region" aria-label="Framework features">
  <div class="carousel-inner" tabindex="0" role="group" aria-label="Framework feature slides">${slide('Responsive layout', 'Flexible grids for different screens.', 0, 2)}${slide('Accessible components', 'Keyboard and focus behavior.', 1, 2, 'bg-2')}</div>
  ${controls('carousel-rtl')}
</div></div>` }
    ],
    variables: documentedTokens('carousel'),
    sass: `@use 'tremplin/scss/carousel' with (
  $carousel-tokens: (
    --trm-carousel-gap: 1rem,
    --trm-carousel-control-icon-width: 1.25rem
  )
);`
})
