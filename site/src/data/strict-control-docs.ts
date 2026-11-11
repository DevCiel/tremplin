import { componentNarrative } from '../libs/component-mdx'
import type { ComponentDetail } from './component-docs'
import { choiceAccessibility, choiceChipInput, choiceClasses, choiceDetails } from './choice-input-docs'
import { chipTableExamples, chipTableDetails, chipTableClasses, chipTableAccessibility } from './chip-table-docs'
import { adaptiveExamples, adaptiveDetails, adaptiveClasses, adaptiveAccessibility } from './adaptive-navigation-docs'
import { advancedAccessibility, advancedClasses, advancedDetails, advancedExamples, dateInput, otpInput, rangeInput, strengthInput } from './advanced-input-docs'

export { dateInput, otpInput, rangeInput, strengthInput }
export const chipInput=choiceChipInput
export const strictControlExamples:Record<string,string>={chip:chipTableExamples.chip,chips:chipInput('tags','Project tags'),...advancedExamples,'nav-overflow':adaptiveExamples['nav-overflow']}
export const strictControlIntros:Record<string,string>={
  get 'chips'() { return componentNarrative('chips').lead },
  get 'otp-input'() { return componentNarrative('otp-input').lead },
  get 'range'() { return componentNarrative('range').lead },
  get 'strength'() { return componentNarrative('strength').lead },
  get 'datepicker'() { return componentNarrative('datepicker').lead },
  get 'nav-overflow'() { return componentNarrative('nav-overflow').lead }
}
export const strictControlClasses:Record<string,string[]>={chip:chipTableClasses.chip,chips:choiceClasses.chips,...advancedClasses,'nav-overflow':adaptiveClasses['nav-overflow']}
export const strictControlAccessibility:Record<string,string>={chip:chipTableAccessibility.chip,chips:choiceAccessibility.chips,...advancedAccessibility,'nav-overflow':adaptiveAccessibility['nav-overflow']}
export const strictControlDetails:Record<string,ComponentDetail>={chip:chipTableDetails.chip,chips:choiceDetails.chips,...advancedDetails,'nav-overflow':adaptiveDetails['nav-overflow']}
