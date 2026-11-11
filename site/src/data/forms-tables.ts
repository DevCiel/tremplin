import { sharedFormTokens } from './forms-overview-docs'
import { nativeFormTokens } from './native-form-guides'
import { compositionTokens } from './form-composition-guides'

// Evaluated token rows remain connected to their maintained sources.
export const formsTables: Record<string, string[][]> = {
"forms/overview#5": sharedFormTokens.map(token => [token.name, token.defaultValue]),
"forms/form-control#8": nativeFormTokens["form-control"].map(token => [token.name, token.name.includes('icon-') || /select-bg(?:-dark)?$/.test(token.name) ? 'Embedded SVG data URL (see Sass source)' : token.defaultValue]),
"forms/checkbox#6": nativeFormTokens["checkbox"].map(token => [token.name, token.name.includes('icon-') || /select-bg(?:-dark)?$/.test(token.name) ? 'Embedded SVG data URL (see Sass source)' : token.defaultValue]),
"forms/radio#5": nativeFormTokens["radio"].map(token => [token.name, token.name.includes('icon-') || /select-bg(?:-dark)?$/.test(token.name) ? 'Embedded SVG data URL (see Sass source)' : token.defaultValue]),
"forms/switch#6": nativeFormTokens["switch"].map(token => [token.name, token.name.includes('icon-') || /select-bg(?:-dark)?$/.test(token.name) ? 'Embedded SVG data URL (see Sass source)' : token.defaultValue]),
"forms/input-group#11": compositionTokens["input-group"].map(token => [token.name, token.defaultValue]),
"forms/floating-labels#9": compositionTokens["floating-labels"].map(token => [token.name, token.defaultValue]),
"forms/form-adorn#6": compositionTokens["form-adorn"].map(token => [token.name, token.defaultValue]),
}
