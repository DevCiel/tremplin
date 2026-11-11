import type { CodeSample } from './guide-docs'
import { formsSass, formsDemoCss, formsDemoJavascript } from './forms-overview-docs'
import { nativeFormSass, nativeFormDemoCss, indeterminateDemoJavascript } from './native-form-guides'
import { advancedDemoJavascript, advancedDemoCss } from './advanced-input-docs'
import { compositionSass, compositionDemoCss, localFormScript, validationScript } from './form-composition-guides'
import { choiceDemoCss, chipsSubmissionJavascript } from './choice-input-docs'
import { contrastGuideSlugs, contrastExample, demoContrastCss } from './contrast-examples'

export interface FormExample { code?: CodeSample[]; example?: string }
// Executable samples only. Guide prose is authored in content/docs/forms/.
export const formsRawExamples: Record<string, FormExample[]> = {
  "forms/overview": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-docs-forms><form id=\"forms-overview\" data-docs-forms-preview class=\"vstack gap-3\">\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-email\">Email address (required)</label><input class=\"form-control\" id=\"forms-overview-email\" type=\"email\" name=\"email\" required autocomplete=\"email\" aria-describedby=\"forms-overview-email-help\"><p class=\"form-text mb-0\" id=\"forms-overview-email-help\">Use an example address for this local preview.</p></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-project\">Project name (required)</label><input class=\"form-control\" id=\"forms-overview-project\" type=\"text\" name=\"project\" required autocomplete=\"off\"></div>\n  <div class=\"form-field\"><input class=\"check\" type=\"checkbox\" id=\"forms-overview-updates\" name=\"updates\" value=\"yes\"><label for=\"forms-overview-updates\">Include project updates</label></div>\n  <div class=\"d-flex flex-wrap gap-2\"><button class=\"btn-outline theme-inverse\" type=\"submit\" data-docs-forms-submit disabled>Check locally</button><button class=\"btn-outline theme-inverse\" type=\"reset\">Reset</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No submission attempted.</p>\n</form></div>"
        }
      ],
      "example": "<div data-docs-forms><form id=\"forms-overview\" data-docs-forms-preview class=\"vstack gap-3\">\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-email\">Email address (required)</label><input class=\"form-control\" id=\"forms-overview-email\" type=\"email\" name=\"email\" required autocomplete=\"email\" aria-describedby=\"forms-overview-email-help\"><p class=\"form-text mb-0\" id=\"forms-overview-email-help\">Use an example address for this local preview.</p></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-project\">Project name (required)</label><input class=\"form-control\" id=\"forms-overview-project\" type=\"text\" name=\"project\" required autocomplete=\"off\"></div>\n  <div class=\"form-field\"><input class=\"check\" type=\"checkbox\" id=\"forms-overview-updates\" name=\"updates\" value=\"yes\"><label for=\"forms-overview-updates\">Include project updates</label></div>\n  <div class=\"d-flex flex-wrap gap-2\"><button class=\"btn-outline theme-inverse\" type=\"submit\" data-docs-forms-submit disabled>Check locally</button><button class=\"btn-outline theme-inverse\" type=\"reset\">Reset</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No submission attempted.</p>\n</form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-docs-forms><fieldset disabled class=\"vstack gap-3\">\n  <legend>Unavailable settings</legend>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-disabled-name\">Disabled display name</label><input class=\"form-control\" id=\"forms-overview-disabled-name\" type=\"text\" name=\"displayName\" value=\"Unavailable\"></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-disabled-select\">Disabled role</label><select class=\"form-control\" id=\"forms-overview-disabled-select\" name=\"role\"><option>Viewer</option><option>Editor</option></select></div>\n  <div class=\"form-field\"><input class=\"check\" type=\"checkbox\" id=\"forms-overview-disabled-updates\" name=\"updates\" checked><label for=\"forms-overview-disabled-updates\">Managed updates</label></div>\n  <div><button class=\"btn-outline theme-inverse\" type=\"button\">Save unavailable settings</button></div>\n</fieldset></div>"
        }
      ],
      "example": "<div data-docs-forms><fieldset disabled class=\"vstack gap-3\">\n  <legend>Unavailable settings</legend>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-disabled-name\">Disabled display name</label><input class=\"form-control\" id=\"forms-overview-disabled-name\" type=\"text\" name=\"displayName\" value=\"Unavailable\"></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-disabled-select\">Disabled role</label><select class=\"form-control\" id=\"forms-overview-disabled-select\" name=\"role\"><option>Viewer</option><option>Editor</option></select></div>\n  <div class=\"form-field\"><input class=\"check\" type=\"checkbox\" id=\"forms-overview-disabled-updates\" name=\"updates\" checked><label for=\"forms-overview-disabled-updates\">Managed updates</label></div>\n  <div><button class=\"btn-outline theme-inverse\" type=\"button\">Save unavailable settings</button></div>\n</fieldset></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-docs-forms><form id=\"forms-overview-state\" data-docs-forms-values class=\"vstack gap-3\">\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-state-readonly\">Readonly account</label><input class=\"form-control\" id=\"forms-overview-state-readonly\" name=\"account\" readonly value=\"example-account\"></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-state-disabled\">Disabled account note</label><input class=\"form-control\" id=\"forms-overview-state-disabled\" name=\"note\" disabled value=\"Not submitted\"></div>\n  <div><button class=\"btn-outline theme-inverse\" type=\"button\" data-docs-forms-inspect disabled>Inspect included field names</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No inspection attempted.</p>\n</form></div>"
        }
      ],
      "example": "<div data-docs-forms><form id=\"forms-overview-state\" data-docs-forms-values class=\"vstack gap-3\">\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-state-readonly\">Readonly account</label><input class=\"form-control\" id=\"forms-overview-state-readonly\" name=\"account\" readonly value=\"example-account\"></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-state-disabled\">Disabled account note</label><input class=\"form-control\" id=\"forms-overview-state-disabled\" name=\"note\" disabled value=\"Not submitted\"></div>\n  <div><button class=\"btn-outline theme-inverse\" type=\"button\" data-docs-forms-inspect disabled>Inspect included field names</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No inspection attempted.</p>\n</form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-docs-forms><div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-description\">Project reference</label><input class=\"form-control\" id=\"forms-overview-description\" name=\"reference\" aria-describedby=\"forms-overview-description-help\"><p class=\"form-text mb-0\" id=\"forms-overview-description-help\">Use a short reference that teammates recognize.</p></div></div>"
        }
      ],
      "example": "<div data-docs-forms><div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-description\">Project reference</label><input class=\"form-control\" id=\"forms-overview-description\" name=\"reference\" aria-describedby=\"forms-overview-description-help\"><p class=\"form-text mb-0\" id=\"forms-overview-description-help\">Use a short reference that teammates recognize.</p></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-docs-forms><form id=\"forms-overview-validation\" data-docs-forms-validation novalidate class=\"vstack gap-3\">\n  <div class=\"border rounded-5 p-3 focus-ring\" tabindex=\"-1\" role=\"alert\" data-docs-forms-summary hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"><li><a href=\"#forms-overview-validation-email\">Enter a valid email address.</a></li><li><a href=\"#forms-overview-validation-code\">Use six uppercase letters or digits for the project code.</a></li></ul></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-validation-email\">Email address (required)</label><input class=\"form-control\" type=\"email\" name=\"email\" id=\"forms-overview-validation-email\" required autocomplete=\"email\" aria-describedby=\"forms-overview-validation-email-error\"><p class=\"invalid-feedback mb-0\" id=\"forms-overview-validation-email-error\">Enter a valid email address.</p></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-validation-code\">Project code (required)</label><input class=\"form-control\" name=\"code\" id=\"forms-overview-validation-code\" required pattern=\"[A-Z0-9]{6}\" maxlength=\"6\" aria-describedby=\"forms-overview-validation-code-help forms-overview-validation-code-error\"><p class=\"form-text mb-0\" id=\"forms-overview-validation-code-help\">Use exactly six uppercase letters or digits.</p><p class=\"invalid-feedback mb-0\" id=\"forms-overview-validation-code-error\">Enter a six-character code such as ABC123.</p></div>\n  <div class=\"d-flex flex-wrap gap-2\"><button class=\"btn-outline theme-inverse\" type=\"submit\" data-docs-forms-submit disabled>Check details locally</button><button class=\"btn-outline theme-inverse\" type=\"reset\">Reset validation</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No submission attempted.</p>\n</form></div>"
        }
      ],
      "example": "<div data-docs-forms><form id=\"forms-overview-validation\" data-docs-forms-validation novalidate class=\"vstack gap-3\">\n  <div class=\"border rounded-5 p-3 focus-ring\" tabindex=\"-1\" role=\"alert\" data-docs-forms-summary hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"><li><a href=\"#forms-overview-validation-email\">Enter a valid email address.</a></li><li><a href=\"#forms-overview-validation-code\">Use six uppercase letters or digits for the project code.</a></li></ul></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-validation-email\">Email address (required)</label><input class=\"form-control\" type=\"email\" name=\"email\" id=\"forms-overview-validation-email\" required autocomplete=\"email\" aria-describedby=\"forms-overview-validation-email-error\"><p class=\"invalid-feedback mb-0\" id=\"forms-overview-validation-email-error\">Enter a valid email address.</p></div>\n  <div class=\"form-field\"><label class=\"form-label\" for=\"forms-overview-validation-code\">Project code (required)</label><input class=\"form-control\" name=\"code\" id=\"forms-overview-validation-code\" required pattern=\"[A-Z0-9]{6}\" maxlength=\"6\" aria-describedby=\"forms-overview-validation-code-help forms-overview-validation-code-error\"><p class=\"form-text mb-0\" id=\"forms-overview-validation-code-help\">Use exactly six uppercase letters or digits.</p><p class=\"invalid-feedback mb-0\" id=\"forms-overview-validation-code-error\">Enter a six-character code such as ABC123.</p></div>\n  <div class=\"d-flex flex-wrap gap-2\"><button class=\"btn-outline theme-inverse\" type=\"submit\" data-docs-forms-submit disabled>Check details locally</button><button class=\"btn-outline theme-inverse\" type=\"reset\">Reset validation</button></div>\n  <p class=\"form-text mb-0\" role=\"status\" data-docs-forms-status>No submission attempted.</p>\n</form></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": formsSass
        }
      ]
    },
    {
      "code": [
        {
          "language": "js",
          "source": "import 'tremplin/css'\n// Add individual component modules only for enhancements you use."
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": formsDemoCss
        },
        {
          "language": "js",
          "source": formsDemoJavascript
        }
      ]
    }
  ],
  "forms/field": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-field-name\">Project name</label><input class=\"form-control\" id=\"forms-field-name\" type=\"text\" name=\"project\" aria-describedby=\"forms-field-name-help\"><small class=\"form-text\" id=\"forms-field-name-help\">Choose a short, recognizable name.</small></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-field-name\">Project name</label><input class=\"form-control\" id=\"forms-field-name\" type=\"text\" name=\"project\" aria-describedby=\"forms-field-name-help\"><small class=\"form-text\" id=\"forms-field-name-help\">Choose a short, recognizable name.</small></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-role\">Role</label><select class=\"form-control\" id=\"native-field-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-message\">Project message</label><textarea class=\"form-control\" id=\"native-field-message\" rows=\"3\" ></textarea></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-role\">Role</label><select class=\"form-control\" id=\"native-field-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-message\">Project message</label><textarea class=\"form-control\" id=\"native-field-message\" rows=\"3\" ></textarea></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-field-check\"  class=\"check \" ><label for=\"native-field-check\">Include archived projects</label></div><fieldset class=\"form-group\"><legend>Delivery</legend><div class=\"form-field\"><input type=\"radio\" id=\"native-field-radio-first\"  class=\"radio \" name=\"native-field-radio\" value=\"first\" checked><label for=\"native-field-radio-first\">Standard</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-field-radio-second\"  class=\"radio \" name=\"native-field-radio\" value=\"second\"><label for=\"native-field-radio-second\">Express</label></div></fieldset><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-field-switch\" role=\"switch\" switch  ></span><label for=\"native-field-switch\">Enable project notices</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-field-check\"  class=\"check \" ><label for=\"native-field-check\">Include archived projects</label></div><fieldset class=\"form-group\"><legend>Delivery</legend><div class=\"form-field\"><input type=\"radio\" id=\"native-field-radio-first\"  class=\"radio \" name=\"native-field-radio\" value=\"first\" checked><label for=\"native-field-radio-first\">Standard</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-field-radio-second\"  class=\"radio \" name=\"native-field-radio\" value=\"second\"><label for=\"native-field-radio-second\">Express</label></div></fieldset><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-field-switch\" role=\"switch\" switch  ></span><label for=\"native-field-switch\">Enable project notices</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><fieldset class=\"form-group\"><legend>Choose a project plan</legend><div class=\"vstack gap-1\"><div class=\"form-field form-field-card\"><input type=\"radio\" class=\"radio\" id=\"native-plan-basic\" name=\"native-plan\" value=\"basic\" checked aria-describedby=\"native-plan-basic-help\"><div class=\"form-field-content\"><label for=\"native-plan-basic\">Basic plan</label><small class=\"form-text\" id=\"native-plan-basic-help\">For an individual project.</small></div></div><div class=\"form-field form-field-card\"><input type=\"radio\" class=\"radio\" id=\"native-plan-team\" name=\"native-plan\" value=\"team\" aria-describedby=\"native-plan-team-help\"><div class=\"form-field-content\"><label for=\"native-plan-team\">Team plan</label><small class=\"form-text\" id=\"native-plan-team-help\">For a shared workspace.</small></div></div></div></fieldset></div>"
        }
      ],
      "example": "<div data-native-forms-demo><fieldset class=\"form-group\"><legend>Choose a project plan</legend><div class=\"vstack gap-1\"><div class=\"form-field form-field-card\"><input type=\"radio\" class=\"radio\" id=\"native-plan-basic\" name=\"native-plan\" value=\"basic\" checked aria-describedby=\"native-plan-basic-help\"><div class=\"form-field-content\"><label for=\"native-plan-basic\">Basic plan</label><small class=\"form-text\" id=\"native-plan-basic-help\">For an individual project.</small></div></div><div class=\"form-field form-field-card\"><input type=\"radio\" class=\"radio\" id=\"native-plan-team\" name=\"native-plan\" value=\"team\" aria-describedby=\"native-plan-team-help\"><div class=\"form-field-content\"><label for=\"native-plan-team\">Team plan</label><small class=\"form-text\" id=\"native-plan-team-help\">For a shared workspace.</small></div></div></div></fieldset></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\" role=\"group\" aria-labelledby=\"native-field-overhead-title\"><p class=\"form-label\" id=\"native-field-overhead-title\">Project preferences</p><input type=\"checkbox\" class=\"check\" id=\"native-field-overhead\" aria-describedby=\"native-field-overhead-help\"><div class=\"form-field-content\"><label for=\"native-field-overhead\">Receive project updates</label><small class=\"form-text\" id=\"native-field-overhead-help\">A weekly project summary.</small></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\" role=\"group\" aria-labelledby=\"native-field-overhead-title\"><p class=\"form-label\" id=\"native-field-overhead-title\">Project preferences</p><input type=\"checkbox\" class=\"check\" id=\"native-field-overhead\" aria-describedby=\"native-field-overhead-help\"><div class=\"form-field-content\"><label for=\"native-field-overhead\">Receive project updates</label><small class=\"form-text\" id=\"native-field-overhead-help\">A weekly project summary.</small></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-invalid\">Email address</label><input type=\"email\" class=\"form-control is-invalid\" id=\"native-field-invalid\" value=\"not-an-email\" aria-invalid=\"true\" aria-describedby=\"native-field-invalid-help\"><p class=\"invalid-feedback mb-0\" id=\"native-field-invalid-help\">Enter a valid email address.</p></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"native-field-invalid\">Email address</label><input type=\"email\" class=\"form-control is-invalid\" id=\"native-field-invalid\" value=\"not-an-email\" aria-invalid=\"true\" aria-describedby=\"native-field-invalid-help\"><p class=\"invalid-feedback mb-0\" id=\"native-field-invalid-help\">Enter a valid email address.</p></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": nativeFormSass["field"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": nativeFormDemoCss
        }
      ]
    }
  ],
  "forms/form-control": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-name\">Full name</label><input class=\"form-control\" id=\"forms-control-name\" type=\"text\" name=\"fullName\" autocomplete=\"name\"></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-name\">Full name</label><input class=\"form-control\" id=\"forms-control-name\" type=\"text\" name=\"fullName\" autocomplete=\"name\"></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-notes\">Project notes</label><textarea class=\"form-control\" id=\"forms-control-notes\" rows=\"3\" ></textarea></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-role\">Role</label><select class=\"form-control\" id=\"forms-control-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-multiple\">Multiple workstreams</label><select class=\"form-control\" id=\"native-control-multiple\" multiple size=\"3\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-size\">Three-row select</label><select class=\"form-control\" id=\"native-control-size\" size=\"3\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-notes\">Project notes</label><textarea class=\"form-control\" id=\"forms-control-notes\" rows=\"3\" ></textarea></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-role\">Role</label><select class=\"form-control\" id=\"forms-control-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-multiple\">Multiple workstreams</label><select class=\"form-control\" id=\"native-control-multiple\" multiple size=\"3\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-size\">Three-row select</label><select class=\"form-control\" id=\"native-control-size\" size=\"3\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-small\">Compact field</label><input class=\"form-control form-control-sm\" id=\"forms-control-small\" type=\"text\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-large\">Large field</label><input class=\"form-control form-control-lg\" id=\"forms-control-large\" type=\"text\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-small-notes\">Small textarea</label><textarea class=\"form-control form-control-sm\" id=\"native-control-small-notes\" rows=\"3\" ></textarea></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-large-select\">Large select</label><select class=\"form-control form-control-lg\" id=\"native-control-large-select\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-small\">Compact field</label><input class=\"form-control form-control-sm\" id=\"forms-control-small\" type=\"text\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-large\">Large field</label><input class=\"form-control form-control-lg\" id=\"forms-control-large\" type=\"text\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-small-notes\">Small textarea</label><textarea class=\"form-control form-control-sm\" id=\"native-control-small-notes\" rows=\"3\" ></textarea></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-large-select\">Large select</label><select class=\"form-control form-control-lg\" id=\"native-control-large-select\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-reference\">Project reference</label><input class=\"form-control\" id=\"native-control-reference\" type=\"text\" name=\"reference\" aria-describedby=\"native-control-reference-help\"><small class=\"form-text\" id=\"native-control-reference-help\">Use a recognizable project reference.</small></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-disabled\">Disabled value</label><input class=\"form-control\" id=\"forms-control-disabled\" type=\"text\" disabled value=\"Unavailable\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-readonly\">Readonly account</label><input class=\"form-control\" id=\"forms-control-readonly\" type=\"text\" readonly value=\"example-account\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-plaintext\">Readonly project ID</label><input class=\"form-control-plaintext\" id=\"native-control-plaintext\" type=\"text\" readonly value=\"PROJECT-001\"></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-reference\">Project reference</label><input class=\"form-control\" id=\"native-control-reference\" type=\"text\" name=\"reference\" aria-describedby=\"native-control-reference-help\"><small class=\"form-text\" id=\"native-control-reference-help\">Use a recognizable project reference.</small></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-disabled\">Disabled value</label><input class=\"form-control\" id=\"forms-control-disabled\" type=\"text\" disabled value=\"Unavailable\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-readonly\">Readonly account</label><input class=\"form-control\" id=\"forms-control-readonly\" type=\"text\" readonly value=\"example-account\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-plaintext\">Readonly project ID</label><input class=\"form-control-plaintext\" id=\"native-control-plaintext\" type=\"text\" readonly value=\"PROJECT-001\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-date\">Native date</label><input class=\"form-control\" id=\"forms-control-date\" type=\"date\" value=\"2026-11-08\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-time\">Native time</label><input class=\"form-control\" id=\"native-control-time\" type=\"time\" value=\"13:00\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-datetime\">Native date and time</label><input class=\"form-control\" id=\"native-control-datetime\" type=\"datetime-local\" value=\"2026-11-08T13:00\"></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-date\">Native date</label><input class=\"form-control\" id=\"forms-control-date\" type=\"date\" value=\"2026-11-08\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-time\">Native time</label><input class=\"form-control\" id=\"native-control-time\" type=\"time\" value=\"13:00\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-datetime\">Native date and time</label><input class=\"form-control\" id=\"native-control-datetime\" type=\"datetime-local\" value=\"2026-11-08T13:00\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-color\">Project color</label><input class=\"form-control form-control-color\" id=\"native-control-color\" type=\"color\" value=\"#631aff\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-datalist\">Suggested workstream</label><input class=\"form-control form-control-caret\" id=\"native-control-datalist\" type=\"text\" list=\"native-workstreams\"></div><datalist id=\"native-workstreams\"><option value=\"Design\"></option><option value=\"Engineering\"></option><option value=\"Support\"></option></datalist></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-color\">Project color</label><input class=\"form-control form-control-color\" id=\"native-control-color\" type=\"color\" value=\"#631aff\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-datalist\">Suggested workstream</label><input class=\"form-control form-control-caret\" id=\"native-control-datalist\" type=\"text\" list=\"native-workstreams\"></div><datalist id=\"native-workstreams\"><option value=\"Design\"></option><option value=\"Engineering\"></option><option value=\"Support\"></option></datalist></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-file\">Project attachment</label><input class=\"form-control\" id=\"forms-control-file\" type=\"file\" accept=\"text/plain\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-files\">Multiple attachments</label><input class=\"form-control\" id=\"native-control-files\" type=\"file\" multiple></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-file-disabled\">Unavailable attachment</label><input class=\"form-control\" id=\"native-control-file-disabled\" type=\"file\" disabled></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-control-file\">Project attachment</label><input class=\"form-control\" id=\"forms-control-file\" type=\"file\" accept=\"text/plain\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-files\">Multiple attachments</label><input class=\"form-control\" id=\"native-control-files\" type=\"file\" multiple></div><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-file-disabled\">Unavailable attachment</label><input class=\"form-control\" id=\"native-control-file-disabled\" type=\"file\" disabled></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-ghost\">Search project documentation</label><div class=\"form-control form-adorn\"><span class=\"form-adorn-text\" aria-hidden=\"true\">?</span><input type=\"search\" class=\"form-ghost\" id=\"native-control-ghost\" placeholder=\"Search locally\" autocomplete=\"off\"></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><label class=\"form-label\" for=\"native-control-ghost\">Search project documentation</label><div class=\"form-control form-adorn\"><span class=\"form-adorn-text\" aria-hidden=\"true\">?</span><input type=\"search\" class=\"form-ghost\" id=\"native-control-ghost\" placeholder=\"Search locally\" autocomplete=\"off\"></div></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": nativeFormSass["form-control"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": nativeFormDemoCss
        }
      ]
    }
  ],
  "forms/checkbox": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"forms-checkbox-updates\"  class=\"check \" name=\"updates\" value=\"yes\"><label for=\"forms-checkbox-updates\">Receive product updates</label></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"forms-checkbox-updates\"  class=\"check \" name=\"updates\" value=\"yes\"><label for=\"forms-checkbox-updates\">Receive product updates</label></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"forms-checkbox-partial\"  class=\"check \" data-native-indeterminate name=\"workstreams\" value=\"all\" aria-describedby=\"forms-checkbox-partial-help\"><div class=\"form-field-content\"><label for=\"forms-checkbox-partial\">Select all workstreams</label><small class=\"form-text\" id=\"forms-checkbox-partial-help\">This is a mixed-state specimen, not an implemented select-all controller.</small></div></div></div>"
        },
        {
          "language": "js",
          "source": indeterminateDemoJavascript
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"forms-checkbox-partial\"  class=\"check \" data-native-indeterminate name=\"workstreams\" value=\"all\" aria-describedby=\"forms-checkbox-partial-help\"><div class=\"form-field-content\"><label for=\"forms-checkbox-partial\">Select all workstreams</label><small class=\"form-text\" id=\"forms-checkbox-partial-help\">This is a mixed-state specimen, not an implemented select-all controller.</small></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"native-check-help\"  class=\"check \"  aria-describedby=\"native-check-help-help\"><div class=\"form-field-content\"><label for=\"native-check-help\">Include archived projects</label><small class=\"form-text\" id=\"native-check-help-help\">Archived projects are read-only.</small></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"checkbox\" id=\"native-check-help\"  class=\"check \"  aria-describedby=\"native-check-help-help\"><div class=\"form-field-content\"><label for=\"native-check-help\">Include archived projects</label><small class=\"form-text\" id=\"native-check-help-help\">Archived projects are read-only.</small></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-primary\"  class=\"check theme-primary\" checked name=\"checkbox-primary\" value=\"yes\"><label for=\"native-checkbox-theme-primary\">primary specimen</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-success\"  class=\"check theme-success\" checked name=\"checkbox-success\" value=\"yes\"><label for=\"native-checkbox-theme-success\">success specimen</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-inverse\"  class=\"check theme-inverse\" checked name=\"checkbox-inverse\" value=\"yes\"><label for=\"native-checkbox-theme-inverse\">inverse specimen</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-primary\"  class=\"check theme-primary\" checked name=\"checkbox-primary\" value=\"yes\"><label for=\"native-checkbox-theme-primary\">primary specimen</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-success\"  class=\"check theme-success\" checked name=\"checkbox-success\" value=\"yes\"><label for=\"native-checkbox-theme-success\">success specimen</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-theme-inverse\"  class=\"check theme-inverse\" checked name=\"checkbox-inverse\" value=\"yes\"><label for=\"native-checkbox-theme-inverse\">inverse specimen</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled\"  class=\"check \" disabled><label for=\"native-checkbox-disabled\">Unavailable checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled-checked\"  class=\"check \" disabled checked><label for=\"native-checkbox-disabled-checked\">Unavailable checked checkbox</label></div></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled-mixed\"  class=\"check \" disabled data-native-indeterminate><label for=\"native-checkbox-disabled-mixed\">Unavailable mixed choice</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled\"  class=\"check \" disabled><label for=\"native-checkbox-disabled\">Unavailable checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled-checked\"  class=\"check \" disabled checked><label for=\"native-checkbox-disabled-checked\">Unavailable checked checkbox</label></div></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-disabled-mixed\"  class=\"check \" disabled data-native-indeterminate><label for=\"native-checkbox-disabled-mixed\">Unavailable mixed choice</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-sm\"  class=\"check check-sm\" checked name=\"checkbox-size-sm\" value=\"yes\"><label for=\"native-checkbox-size-sm\">sm checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-default\"  class=\"check \" checked name=\"checkbox-size-default\" value=\"yes\"><label for=\"native-checkbox-size-default\">Default checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-lg\"  class=\"check check-lg\" checked name=\"checkbox-size-lg\" value=\"yes\"><label for=\"native-checkbox-size-lg\">lg checkbox</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-sm\"  class=\"check check-sm\" checked name=\"checkbox-size-sm\" value=\"yes\"><label for=\"native-checkbox-size-sm\">sm checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-default\"  class=\"check \" checked name=\"checkbox-size-default\" value=\"yes\"><label for=\"native-checkbox-size-default\">Default checkbox</label></div><div class=\"form-field\"><input type=\"checkbox\" id=\"native-checkbox-size-lg\"  class=\"check check-lg\" checked name=\"checkbox-size-lg\" value=\"yes\"><label for=\"native-checkbox-size-lg\">lg checkbox</label></div></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": nativeFormSass["checkbox"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": nativeFormDemoCss
        }
      ]
    }
  ],
  "forms/radio": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><fieldset class=\"form-group\"><legend>Billing schedule</legend><div class=\"form-field\"><input type=\"radio\" id=\"forms-radio-monthly\"  class=\"radio \" name=\"billing\" value=\"monthly\" checked><label for=\"forms-radio-monthly\">Monthly</label></div><div class=\"form-field\"><input type=\"radio\" id=\"forms-radio-yearly\"  class=\"radio \" name=\"billing\" value=\"yearly\"><label for=\"forms-radio-yearly\">Yearly</label></div></fieldset></div>"
        }
      ],
      "example": "<div data-native-forms-demo><fieldset class=\"form-group\"><legend>Billing schedule</legend><div class=\"form-field\"><input type=\"radio\" id=\"forms-radio-monthly\"  class=\"radio \" name=\"billing\" value=\"monthly\" checked><label for=\"forms-radio-monthly\">Monthly</label></div><div class=\"form-field\"><input type=\"radio\" id=\"forms-radio-yearly\"  class=\"radio \" name=\"billing\" value=\"yearly\"><label for=\"forms-radio-yearly\">Yearly</label></div></fieldset></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-help\"  class=\"radio \" name=\"delivery\" value=\"standard\" checked aria-describedby=\"native-radio-help-help\"><div class=\"form-field-content\"><label for=\"native-radio-help\">Standard delivery</label><small class=\"form-text\" id=\"native-radio-help-help\">Arrives in five to seven business days.</small></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-help\"  class=\"radio \" name=\"delivery\" value=\"standard\" checked aria-describedby=\"native-radio-help-help\"><div class=\"form-field-content\"><label for=\"native-radio-help\">Standard delivery</label><small class=\"form-text\" id=\"native-radio-help-help\">Arrives in five to seven business days.</small></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-primary\"  class=\"radio theme-primary\" checked name=\"radio-primary\" value=\"yes\"><label for=\"native-radio-theme-primary\">primary specimen</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-success\"  class=\"radio theme-success\" checked name=\"radio-success\" value=\"yes\"><label for=\"native-radio-theme-success\">success specimen</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-inverse\"  class=\"radio theme-inverse\" checked name=\"radio-inverse\" value=\"yes\"><label for=\"native-radio-theme-inverse\">inverse specimen</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-primary\"  class=\"radio theme-primary\" checked name=\"radio-primary\" value=\"yes\"><label for=\"native-radio-theme-primary\">primary specimen</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-success\"  class=\"radio theme-success\" checked name=\"radio-success\" value=\"yes\"><label for=\"native-radio-theme-success\">success specimen</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-theme-inverse\"  class=\"radio theme-inverse\" checked name=\"radio-inverse\" value=\"yes\"><label for=\"native-radio-theme-inverse\">inverse specimen</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-disabled\"  class=\"radio \" disabled><label for=\"native-radio-disabled\">Unavailable radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-disabled-checked\"  class=\"radio \" disabled checked><label for=\"native-radio-disabled-checked\">Unavailable checked radio</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-disabled\"  class=\"radio \" disabled><label for=\"native-radio-disabled\">Unavailable radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-disabled-checked\"  class=\"radio \" disabled checked><label for=\"native-radio-disabled-checked\">Unavailable checked radio</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-sm\"  class=\"radio radio-sm\" checked name=\"radio-size-sm\" value=\"yes\"><label for=\"native-radio-size-sm\">sm radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-default\"  class=\"radio \" checked name=\"radio-size-default\" value=\"yes\"><label for=\"native-radio-size-default\">Default radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-lg\"  class=\"radio radio-lg\" checked name=\"radio-size-lg\" value=\"yes\"><label for=\"native-radio-size-lg\">lg radio</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-sm\"  class=\"radio radio-sm\" checked name=\"radio-size-sm\" value=\"yes\"><label for=\"native-radio-size-sm\">sm radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-default\"  class=\"radio \" checked name=\"radio-size-default\" value=\"yes\"><label for=\"native-radio-size-default\">Default radio</label></div><div class=\"form-field\"><input type=\"radio\" id=\"native-radio-size-lg\"  class=\"radio radio-lg\" checked name=\"radio-size-lg\" value=\"yes\"><label for=\"native-radio-size-lg\">lg radio</label></div></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": nativeFormSass["radio"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": nativeFormDemoCss
        }
      ]
    }
  ],
  "forms/switch": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"forms-switch-notices\" role=\"switch\" switch  name=\"notices\" value=\"yes\"></span><label for=\"forms-switch-notices\">Enable notifications</label></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"forms-switch-notices\" role=\"switch\" switch  name=\"notices\" value=\"yes\"></span><label for=\"forms-switch-notices\">Enable notifications</label></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-help\" role=\"switch\" switch  name=\"digest\" value=\"yes\" aria-describedby=\"native-switch-help-help\"></span><div class=\"form-field-content\"><label for=\"native-switch-help\">Weekly project digest</label><small class=\"form-text\" id=\"native-switch-help-help\">A summary of project activity.</small></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-help\" role=\"switch\" switch  name=\"digest\" value=\"yes\" aria-describedby=\"native-switch-help-help\"></span><div class=\"form-field-content\"><label for=\"native-switch-help\">Weekly project digest</label><small class=\"form-text\" id=\"native-switch-help-help\">A summary of project activity.</small></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch theme-primary\"><input type=\"checkbox\" id=\"native-switch-theme-primary\" role=\"switch\" switch  checked name=\"switch-primary\" value=\"yes\"></span><label for=\"native-switch-theme-primary\">primary specimen</label></div><div class=\"form-field\"><span class=\"switch theme-success\"><input type=\"checkbox\" id=\"native-switch-theme-success\" role=\"switch\" switch  checked name=\"switch-success\" value=\"yes\"></span><label for=\"native-switch-theme-success\">success specimen</label></div><div class=\"form-field\"><span class=\"switch theme-inverse\"><input type=\"checkbox\" id=\"native-switch-theme-inverse\" role=\"switch\" switch  checked name=\"switch-inverse\" value=\"yes\"></span><label for=\"native-switch-theme-inverse\">inverse specimen</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch theme-primary\"><input type=\"checkbox\" id=\"native-switch-theme-primary\" role=\"switch\" switch  checked name=\"switch-primary\" value=\"yes\"></span><label for=\"native-switch-theme-primary\">primary specimen</label></div><div class=\"form-field\"><span class=\"switch theme-success\"><input type=\"checkbox\" id=\"native-switch-theme-success\" role=\"switch\" switch  checked name=\"switch-success\" value=\"yes\"></span><label for=\"native-switch-theme-success\">success specimen</label></div><div class=\"form-field\"><span class=\"switch theme-inverse\"><input type=\"checkbox\" id=\"native-switch-theme-inverse\" role=\"switch\" switch  checked name=\"switch-inverse\" value=\"yes\"></span><label for=\"native-switch-theme-inverse\">inverse specimen</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-disabled\" role=\"switch\" switch  disabled></span><label for=\"native-switch-disabled\">Unavailable switch</label></div><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-disabled-checked\" role=\"switch\" switch  disabled checked></span><label for=\"native-switch-disabled-checked\">Unavailable checked switch</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-disabled\" role=\"switch\" switch  disabled></span><label for=\"native-switch-disabled\">Unavailable switch</label></div><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-disabled-checked\" role=\"switch\" switch  disabled checked></span><label for=\"native-switch-disabled-checked\">Unavailable checked switch</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch switch-sm\"><input type=\"checkbox\" id=\"native-switch-size-sm\" role=\"switch\" switch  checked name=\"switch-size-sm\" value=\"yes\"></span><label for=\"native-switch-size-sm\">sm switch</label></div><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-size-default\" role=\"switch\" switch  checked name=\"switch-size-default\" value=\"yes\"></span><label for=\"native-switch-size-default\">Default switch</label></div><div class=\"form-field\"><span class=\"switch switch-lg\"><input type=\"checkbox\" id=\"native-switch-size-lg\" role=\"switch\" switch  checked name=\"switch-size-lg\" value=\"yes\"></span><label for=\"native-switch-size-lg\">lg switch</label></div></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><span class=\"switch switch-sm\"><input type=\"checkbox\" id=\"native-switch-size-sm\" role=\"switch\" switch  checked name=\"switch-size-sm\" value=\"yes\"></span><label for=\"native-switch-size-sm\">sm switch</label></div><div class=\"form-field\"><span class=\"switch \"><input type=\"checkbox\" id=\"native-switch-size-default\" role=\"switch\" switch  checked name=\"switch-size-default\" value=\"yes\"></span><label for=\"native-switch-size-default\">Default switch</label></div><div class=\"form-field\"><span class=\"switch switch-lg\"><input type=\"checkbox\" id=\"native-switch-size-lg\" role=\"switch\" switch  checked name=\"switch-size-lg\" value=\"yes\"></span><label for=\"native-switch-size-lg\">lg switch</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch\" style=\"--trm-switch-width: 2.75rem; --trm-switch-indicator-width: 1.5rem\"><input type=\"checkbox\" role=\"switch\" switch id=\"native-switch-wide\"></span><label for=\"native-switch-wide\">Wide project preference</label></div></div>"
        }
      ],
      "example": "<div data-native-forms-demo><div class=\"form-field\"><span class=\"switch\" style=\"--trm-switch-width: 2.75rem; --trm-switch-indicator-width: 1.5rem\"><input type=\"checkbox\" role=\"switch\" switch id=\"native-switch-wide\"></span><label for=\"native-switch-wide\">Wide project preference</label></div></div>"
    },
    {},
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": nativeFormSass["switch"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": nativeFormDemoCss
        }
      ]
    }
  ],
  "forms/range": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-range-volume\">Volume</label><div id=\"forms-range-volume-range\" class=\"form-range\" data-trm-bubble=\"true\" ><input id=\"forms-range-volume\" class=\"form-range-input\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"5\" value=\"40\" ></div></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-range-volume\">Volume</label><div id=\"forms-range-volume-range\" class=\"form-range\" data-trm-bubble=\"true\" ><input id=\"forms-range-volume\" class=\"form-range-input\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"5\" value=\"40\" ></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<form id=\"forms-submitted-range-form\" class=\"d-grid gap-4\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-submitted-range\">Submitted volume</label><div id=\"forms-submitted-range-range\" class=\"form-range\" data-trm-bubble=\"true\" ><input id=\"forms-submitted-range\" class=\"form-range-input\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"5\" value=\"40\" ></div></div><button class=\"btn-outline theme-primary\" type=\"button\" data-demo-range-set>Set demo value to 75</button><p role=\"status\">Demo value is 40. This page does not submit data.</p></form>"
        }
      ],
      "example": "<form id=\"forms-submitted-range-form\" class=\"d-grid gap-4\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-submitted-range\">Submitted volume</label><div id=\"forms-submitted-range-range\" class=\"form-range\" data-trm-bubble=\"true\" ><input id=\"forms-submitted-range\" class=\"form-range-input\" name=\"volume\" type=\"range\" min=\"0\" max=\"100\" step=\"5\" value=\"40\" ></div></div><button class=\"btn-outline theme-primary\" type=\"button\" data-demo-range-set>Set demo value to 75</button><p role=\"status\">Demo value is 40. This page does not submit data.</p></form>"
    },
    {},
    {
      "code": [
        {
          "language": "js",
          "source": "import Range from 'tremplin/range'\n\nconst range = Range.getOrCreateInstance('#forms-range-volume-range')\n// After changing the native input value in application code:\nrange.update() // emits changed.trm.range on the native input, even if unchanged"
        }
      ]
    },
    {
      "code": [
        {
          "language": "js",
          "source": advancedDemoJavascript
        }
      ]
    }
  ],
  "forms/input-group": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-group-user\">Username</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-user-prefix\">@</span><input class=\"form-control\" id=\"forms-group-user\" name=\"username\" autocomplete=\"username\" aria-describedby=\"composition-user-prefix\"></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-recipient\">Recipient account</label><div class=\"input-group\"><input class=\"form-control\" id=\"composition-group-recipient\" aria-describedby=\"composition-recipient-suffix\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-recipient-suffix\">@example.com</span></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-group-user\">Username</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-user-prefix\">@</span><input class=\"form-control\" id=\"forms-group-user\" name=\"username\" autocomplete=\"username\" aria-describedby=\"composition-user-prefix\"></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-recipient\">Recipient account</label><div class=\"input-group\"><input class=\"form-control\" id=\"composition-group-recipient\" aria-describedby=\"composition-recipient-suffix\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-recipient-suffix\">@example.com</span></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-url\">Profile path</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-profile-prefix\">/profiles/</span><input class=\"form-control\" id=\"composition-group-url\" aria-describedby=\"composition-profile-prefix composition-profile-help\"></div><small class=\"form-text\" id=\"composition-profile-help\">Choose a unique profile path.</small></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-url\">Profile path</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" id=\"composition-profile-prefix\">/profiles/</span><input class=\"form-control\" id=\"composition-group-url\" aria-describedby=\"composition-profile-prefix composition-profile-help\"></div><small class=\"form-text\" id=\"composition-profile-help\">Choose a unique profile path.</small></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-search\">Project search</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Search</button><input class=\"form-control\" id=\"composition-group-search\" type=\"search\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Review</button></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-search\">Project search</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Search</button><input class=\"form-control\" id=\"composition-group-search\" type=\"search\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Review</button></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-message\">Project message</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">Note</span><textarea class=\"form-control\" id=\"composition-group-message\" rows=\"3\"></textarea></div></div>\n<div class=\"input-group\"><label class=\"input-group-text\" for=\"composition-group-role\">Role</label><select class=\"form-control\" id=\"composition-group-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div>\n<div class=\"input-group\"><select class=\"form-control\" id=\"composition-group-role-end\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select><label class=\"input-group-text\" for=\"composition-group-role-end\">Role</label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-message\">Project message</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">Note</span><textarea class=\"form-control\" id=\"composition-group-message\" rows=\"3\"></textarea></div></div>\n<div class=\"input-group\"><label class=\"input-group-text\" for=\"composition-group-role\">Role</label><select class=\"form-control\" id=\"composition-group-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div>\n<div class=\"input-group\"><select class=\"form-control\" id=\"composition-group-role-end\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select><label class=\"input-group-text\" for=\"composition-group-role-end\">Role</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"input-group\"><label class=\"input-group-text\" for=\"composition-group-file\">Attachment</label><input class=\"form-control\" id=\"composition-group-file\" type=\"file\"></div>\n<div class=\"input-group\"><input class=\"form-control\" id=\"composition-group-file-end\" type=\"file\" multiple><label class=\"input-group-text\" for=\"composition-group-file-end\">Files</label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"input-group\"><label class=\"input-group-text\" for=\"composition-group-file\">Attachment</label><input class=\"form-control\" id=\"composition-group-file\" type=\"file\"></div>\n<div class=\"input-group\"><input class=\"form-control\" id=\"composition-group-file-end\" type=\"file\" multiple><label class=\"input-group-text\" for=\"composition-group-file-end\">Files</label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"input-group\"><span class=\"input-group-text\"><input class=\"check\" id=\"composition-group-check\" type=\"checkbox\" aria-label=\"Include project filter\"></span><input class=\"form-control\" id=\"composition-group-filter\" aria-label=\"Project filter\"></div>\n<div class=\"input-group\"><span class=\"input-group-text\"><input class=\"radio\" id=\"composition-group-radio\" type=\"radio\" name=\"composition-filter\" aria-label=\"Use project category\"></span><input class=\"form-control\" id=\"composition-group-category\" aria-label=\"Project category\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"input-group\"><span class=\"input-group-text\"><input class=\"check\" id=\"composition-group-check\" type=\"checkbox\" aria-label=\"Include project filter\"></span><input class=\"form-control\" id=\"composition-group-filter\" aria-label=\"Project filter\"></div>\n<div class=\"input-group\"><span class=\"input-group-text\"><input class=\"radio\" id=\"composition-group-radio\" type=\"radio\" name=\"composition-filter\" aria-label=\"Use project category\"></span><input class=\"form-control\" id=\"composition-group-category\" aria-label=\"Project category\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><fieldset class=\"form-group\"><legend>Account owner</legend><div class=\"input-group\" data-forms-demo=\"multiple\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">Name</span><input class=\"form-control\" id=\"composition-first\" aria-label=\"First name\" name=\"firstName\" autocomplete=\"given-name\"><input class=\"form-control\" id=\"composition-last\" aria-label=\"Last name\" name=\"lastName\" autocomplete=\"family-name\"></div></fieldset>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-amount\">Amount in whole US dollars</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">$</span><input class=\"form-control\" id=\"composition-group-amount\" inputmode=\"numeric\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">.00</span></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><fieldset class=\"form-group\"><legend>Account owner</legend><div class=\"input-group\" data-forms-demo=\"multiple\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">Name</span><input class=\"form-control\" id=\"composition-first\" aria-label=\"First name\" name=\"firstName\" autocomplete=\"given-name\"><input class=\"form-control\" id=\"composition-last\" aria-label=\"Last name\" name=\"lastName\" autocomplete=\"family-name\"></div></fieldset>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-group-amount\">Amount in whole US dollars</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">$</span><input class=\"form-control\" id=\"composition-group-amount\" inputmode=\"numeric\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">.00</span></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-menu-input\">Search documentation</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" id=\"composition-menu-start\" data-trm-toggle=\"menu\" aria-expanded=\"false\">Search scope</button><div class=\"menu\" aria-labelledby=\"composition-menu-start\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div><input class=\"form-control\" id=\"composition-menu-input\" type=\"search\"></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-menu-end-input\">Search another guide</label><div class=\"input-group\"><input class=\"form-control\" id=\"composition-menu-end-input\" type=\"search\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" id=\"composition-menu-end\" data-trm-toggle=\"menu\" aria-expanded=\"false\" data-trm-placement=\"bottom-end\">Search scope</button><div class=\"menu\" aria-labelledby=\"composition-menu-end\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-menu-input\">Search documentation</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" id=\"composition-menu-start\" data-trm-toggle=\"menu\" aria-expanded=\"false\">Search scope</button><div class=\"menu\" aria-labelledby=\"composition-menu-start\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div><input class=\"form-control\" id=\"composition-menu-input\" type=\"search\"></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-menu-end-input\">Search another guide</label><div class=\"input-group\"><input class=\"form-control\" id=\"composition-menu-end-input\" type=\"search\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" id=\"composition-menu-end\" data-trm-toggle=\"menu\" aria-expanded=\"false\" data-trm-placement=\"bottom-end\">Search scope</button><div class=\"menu\" aria-labelledby=\"composition-menu-end\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-segment-input\">Guide query</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Search</button><button class=\"btn-outline theme-inverse input-group-btn menu-toggle-split\" type=\"button\" id=\"composition-menu-split\" data-trm-toggle=\"menu\" aria-expanded=\"false\"><span aria-hidden=\"true\">▾</span><span class=\"visually-hidden\">Choose search scope</span></button><div class=\"menu\" aria-labelledby=\"composition-menu-split\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div><input class=\"form-control\" id=\"composition-segment-input\" type=\"search\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-segment-input\">Guide query</label><div class=\"input-group\"><button class=\"btn-outline theme-inverse input-group-btn\" type=\"button\" >Search</button><button class=\"btn-outline theme-inverse input-group-btn menu-toggle-split\" type=\"button\" id=\"composition-menu-split\" data-trm-toggle=\"menu\" aria-expanded=\"false\"><span aria-hidden=\"true\">▾</span><span class=\"visually-hidden\">Choose search scope</span></button><div class=\"menu\" aria-labelledby=\"composition-menu-split\"><a class=\"menu-item\" href=\"/forms/field/\">Field guide</a><a class=\"menu-item\" href=\"/forms/form-control/\">Control guide</a><hr class=\"menu-divider\"><a class=\"menu-item\" href=\"/components/menu/\">Menu guide</a></div><input class=\"form-control\" id=\"composition-segment-input\" type=\"search\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-ignore-input\">Visible account</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-ignore-input\" ><input class=\"input-group-ignore\" id=\"composition-hidden-input\" type=\"hidden\" name=\"context\" value=\"demo\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-ignore-input\">Visible account</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-ignore-input\" ><input class=\"input-group-ignore\" id=\"composition-hidden-input\" type=\"hidden\" name=\"context\" value=\"demo\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-sm\">sm group</label><div class=\"input-group input-group-sm\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-sm\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-default\">Default group</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-default\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-lg\">lg group</label><div class=\"input-group input-group-lg\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-lg\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-sm\">sm group</label><div class=\"input-group input-group-sm\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-sm\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-default\">Default group</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-default\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-size-lg\">lg group</label><div class=\"input-group input-group-lg\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control\" id=\"composition-size-lg\" ><button class=\"btn btn-outline theme-inverse input-group-btn\" type=\"button\" >Check</button></div></div></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": compositionSass["input-group"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": compositionDemoCss
        }
      ]
    }
  ],
  "forms/floating-labels": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-email\">Email address</label><input class=\"form-control\" id=\"forms-floating-email\" type=\"email\" placeholder=\"name@example.com\" autocomplete=\"email\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-password\">Example password</label><input class=\"form-control\" id=\"composition-floating-password\" type=\"password\" placeholder=\"Example password\" autocomplete=\"new-password\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-email\">Email address</label><input class=\"form-control\" id=\"forms-floating-email\" type=\"email\" placeholder=\"name@example.com\" autocomplete=\"email\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-password\">Example password</label><input class=\"form-control\" id=\"composition-floating-password\" type=\"password\" placeholder=\"Example password\" autocomplete=\"new-password\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-filled\">Saved example address</label><input class=\"form-control\" id=\"composition-floating-filled\" type=\"email\" value=\"demo@example.com\" placeholder=\"name@example.com\"></div>\n<div class=\"form-field\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-invalid\">Account address</label><input class=\"form-control is-invalid\" id=\"composition-floating-invalid\" type=\"email\" value=\"not-an-email\" placeholder=\"name@example.com\" aria-invalid=\"true\" aria-describedby=\"composition-floating-error\"></div><p class=\"invalid-feedback d-block mb-0\" id=\"composition-floating-error\">Use a valid email address.</p></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-filled\">Saved example address</label><input class=\"form-control\" id=\"composition-floating-filled\" type=\"email\" value=\"demo@example.com\" placeholder=\"name@example.com\"></div>\n<div class=\"form-field\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-invalid\">Account address</label><input class=\"form-control is-invalid\" id=\"composition-floating-invalid\" type=\"email\" value=\"not-an-email\" placeholder=\"name@example.com\" aria-invalid=\"true\" aria-describedby=\"composition-floating-error\"></div><p class=\"invalid-feedback d-block mb-0\" id=\"composition-floating-error\">Use a valid email address.</p></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-notes\">Notes</label><textarea class=\"form-control\" id=\"forms-floating-notes\" placeholder=\"Project notes\"></textarea></div>\n<div class=\"form-floating\" style=\"--trm-form-floating-height: 100px\"><label class=\"\" for=\"composition-floating-tall\">Longer notes</label><textarea class=\"form-control\" id=\"composition-floating-tall\" placeholder=\"Longer notes\">An example message.</textarea></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-notes\">Notes</label><textarea class=\"form-control\" id=\"forms-floating-notes\" placeholder=\"Project notes\"></textarea></div>\n<div class=\"form-floating\" style=\"--trm-form-floating-height: 100px\"><label class=\"\" for=\"composition-floating-tall\">Longer notes</label><textarea class=\"form-control\" id=\"composition-floating-tall\" placeholder=\"Longer notes\">An example message.</textarea></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-role\">Role</label><select class=\"form-control\" id=\"forms-floating-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-floating \"><label class=\"\" for=\"forms-floating-role\">Role</label><select class=\"form-control\" id=\"forms-floating-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-date\">Native date</label><input class=\"form-control\" id=\"composition-floating-date\" type=\"date\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-time\">Native time</label><input class=\"form-control\" id=\"composition-floating-time\" type=\"time\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-datetime-local\">Native datetime-local</label><input class=\"form-control\" id=\"composition-floating-datetime-local\" type=\"datetime-local\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-month\">Native month</label><input class=\"form-control\" id=\"composition-floating-month\" type=\"month\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-week\">Native week</label><input class=\"form-control\" id=\"composition-floating-week\" type=\"week\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-date\">Native date</label><input class=\"form-control\" id=\"composition-floating-date\" type=\"date\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-time\">Native time</label><input class=\"form-control\" id=\"composition-floating-time\" type=\"time\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-datetime-local\">Native datetime-local</label><input class=\"form-control\" id=\"composition-floating-datetime-local\" type=\"datetime-local\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-month\">Native month</label><input class=\"form-control\" id=\"composition-floating-month\" type=\"month\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-week\">Native week</label><input class=\"form-control\" id=\"composition-floating-week\" type=\"week\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled\">Unavailable email</label><input class=\"form-control\" id=\"composition-floating-disabled\" type=\"email\" disabled placeholder=\"name@example.com\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled-notes\">Unavailable notes</label><textarea class=\"form-control\" id=\"composition-floating-disabled-notes\" disabled placeholder=\"Notes\">Example notes.</textarea></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled-role\">Unavailable role</label><select class=\"form-control\" id=\"composition-floating-disabled-role\" disabled><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-plain\">Readonly account</label><input class=\"form-control-plaintext\" id=\"composition-floating-plain\" type=\"email\" readonly value=\"demo@example.com\"></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled\">Unavailable email</label><input class=\"form-control\" id=\"composition-floating-disabled\" type=\"email\" disabled placeholder=\"name@example.com\"></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled-notes\">Unavailable notes</label><textarea class=\"form-control\" id=\"composition-floating-disabled-notes\" disabled placeholder=\"Notes\">Example notes.</textarea></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-disabled-role\">Unavailable role</label><select class=\"form-control\" id=\"composition-floating-disabled-role\" disabled><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div>\n<div class=\"form-floating \"><label class=\"\" for=\"composition-floating-plain\">Readonly account</label><input class=\"form-control-plaintext\" id=\"composition-floating-plain\" type=\"email\" readonly value=\"demo@example.com\"></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><div class=\"form-floating is-invalid\"><label class=\"\" for=\"composition-floating-group\">Username</label><input class=\"form-control is-invalid\" id=\"composition-floating-group\" placeholder=\"Username\" aria-invalid=\"true\" aria-describedby=\"composition-floating-group-error\"></div></div><p class=\"invalid-feedback mb-0\" id=\"composition-floating-group-error\">Choose a username.</p></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><div class=\"form-floating is-invalid\"><label class=\"\" for=\"composition-floating-group\">Username</label><input class=\"form-control is-invalid\" id=\"composition-floating-group\" placeholder=\"Username\" aria-invalid=\"true\" aria-describedby=\"composition-floating-group-error\"></div></div><p class=\"invalid-feedback mb-0\" id=\"composition-floating-group-error\">Choose a username.</p></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating form-floating-always\"><label class=\"\" for=\"composition-floating-always\">Always-floating email</label><input class=\"form-control\" id=\"composition-floating-always\" type=\"email\" placeholder=\"name@example.com\"></div>\n<div class=\"form-floating-always\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-always-child\">Always-floating project</label><input class=\"form-control\" id=\"composition-floating-always-child\" placeholder=\"Project name\"></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-floating form-floating-always\"><label class=\"\" for=\"composition-floating-always\">Always-floating email</label><input class=\"form-control\" id=\"composition-floating-always\" type=\"email\" placeholder=\"name@example.com\"></div>\n<div class=\"form-floating-always\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-always-child\">Always-floating project</label><input class=\"form-control\" id=\"composition-floating-always-child\" placeholder=\"Project name\"></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"row g-3\"><div class=\"col-12 md:col-6\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-grid-email\">Project email</label><input class=\"form-control\" id=\"composition-floating-grid-email\" type=\"email\" placeholder=\"name@example.com\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-grid-role\">Project role</label><select class=\"form-control\" id=\"composition-floating-grid-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"row g-3\"><div class=\"col-12 md:col-6\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-grid-email\">Project email</label><input class=\"form-control\" id=\"composition-floating-grid-email\" type=\"email\" placeholder=\"name@example.com\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-floating \"><label class=\"\" for=\"composition-floating-grid-role\">Project role</label><select class=\"form-control\" id=\"composition-floating-grid-role\" ><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": compositionSass["floating-labels"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": compositionDemoCss
        }
      ]
    }
  ],
  "forms/form-adorn": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-search\">Search documentation</label><label class=\"form-control form-adorn \" for=\"composition-adorn-search\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-search\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-end\">Find an email address</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-end\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-end\" type=\"email\" placeholder=\"name@example.com\"></label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-search\">Search documentation</label><label class=\"form-control form-adorn \" for=\"composition-adorn-search\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-search\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-end\">Find an email address</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-end\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-end\" type=\"email\" placeholder=\"name@example.com\"></label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-adorn-site\">Website</label><label class=\"form-control form-adorn \" for=\"forms-adorn-site\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost\" id=\"forms-adorn-site\" name=\"site\" placeholder=\"example.com\" aria-describedby=\"composition-adorn-help\" autocomplete=\"off\"></label><small class=\"form-text\" id=\"composition-adorn-help\">Enter the HTTPS host without the https:// prefix.</small></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"forms-adorn-site\">Website</label><label class=\"form-control form-adorn \" for=\"forms-adorn-site\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost\" id=\"forms-adorn-site\" name=\"site\" placeholder=\"example.com\" aria-describedby=\"composition-adorn-help\" autocomplete=\"off\"></label><small class=\"form-text\" id=\"composition-adorn-help\">Enter the HTTPS host without the https:// prefix.</small></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-currency\">Amount in US dollars</label><label class=\"form-control form-adorn \" for=\"composition-adorn-currency\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">$</span><input class=\"form-ghost\" id=\"composition-adorn-currency\" inputmode=\"decimal\" placeholder=\"0.00\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-unit\">Weight in kilograms</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-unit\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">kg</span><input class=\"form-ghost\" id=\"composition-adorn-unit\" inputmode=\"decimal\" placeholder=\"Weight\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-account\">Example.com account name</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-account\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">@example.com</span><input class=\"form-ghost\" id=\"composition-adorn-account\" placeholder=\"username\"></label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-currency\">Amount in US dollars</label><label class=\"form-control form-adorn \" for=\"composition-adorn-currency\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">$</span><input class=\"form-ghost\" id=\"composition-adorn-currency\" inputmode=\"decimal\" placeholder=\"0.00\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-unit\">Weight in kilograms</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-unit\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">kg</span><input class=\"form-ghost\" id=\"composition-adorn-unit\" inputmode=\"decimal\" placeholder=\"Weight\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-account\">Example.com account name</label><label class=\"form-control form-adorn form-adorn-end\" for=\"composition-adorn-account\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">@example.com</span><input class=\"form-ghost\" id=\"composition-adorn-account\" placeholder=\"username\"></label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-sm\">sm search</label><label class=\"form-control form-adorn form-control-sm\" for=\"composition-adorn-size-sm\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-sm\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-default\">Default search</label><label class=\"form-control form-adorn \" for=\"composition-adorn-size-default\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-default\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-lg\">lg search</label><label class=\"form-control form-adorn form-control-lg\" for=\"composition-adorn-size-lg\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-lg\" type=\"search\" placeholder=\"Search locally\"></label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-sm\">sm search</label><label class=\"form-control form-adorn form-control-sm\" for=\"composition-adorn-size-sm\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-sm\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-default\">Default search</label><label class=\"form-control form-adorn \" for=\"composition-adorn-size-default\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-default\" type=\"search\" placeholder=\"Search locally\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-size-lg\">lg search</label><label class=\"form-control form-adorn form-control-lg\" for=\"composition-adorn-size-lg\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-size-lg\" type=\"search\" placeholder=\"Search locally\"></label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-disabled\">Unavailable search</label><label class=\"form-control form-adorn \" for=\"composition-adorn-disabled\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-disabled\" type=\"search\" disabled value=\"Unavailable\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-readonly\">Readonly host</label><label class=\"form-control form-adorn \" for=\"composition-adorn-readonly\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost\" id=\"composition-adorn-readonly\" readonly value=\"example.com\"></label></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-disabled\">Unavailable search</label><label class=\"form-control form-adorn \" for=\"composition-adorn-disabled\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost\" id=\"composition-adorn-disabled\" type=\"search\" disabled value=\"Unavailable\"></label></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-readonly\">Readonly host</label><label class=\"form-control form-adorn \" for=\"composition-adorn-readonly\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost\" id=\"composition-adorn-readonly\" readonly value=\"example.com\"></label></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-invalid\">Required host</label><label class=\"form-control form-adorn \" for=\"composition-adorn-invalid\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost is-invalid\" id=\"composition-adorn-invalid\" aria-invalid=\"true\" aria-describedby=\"composition-adorn-invalid-error\"></label><p class=\"invalid-feedback mb-0\" id=\"composition-adorn-invalid-error\">Enter the website host.</p></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field\"><label class=\"form-label\" for=\"composition-adorn-invalid\">Required host</label><label class=\"form-control form-adorn \" for=\"composition-adorn-invalid\"><span class=\"form-adorn-text\" dir=\"ltr\" aria-hidden=\"true\">https://</span><input class=\"form-ghost is-invalid\" id=\"composition-adorn-invalid\" aria-invalid=\"true\" aria-describedby=\"composition-adorn-invalid-error\"></label><p class=\"invalid-feedback mb-0\" id=\"composition-adorn-invalid-error\">Enter the website host.</p></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "scss",
          "source": compositionSass["form-adorn"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": compositionDemoCss
        }
      ]
    }
  ],
  "forms/chips": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-chips-input\">Project tags</label><div id=\"forms-chips\" class=\"chip-input\" data-trm-chips ><span class=\"chip\" data-trm-chip-value=\"Design\">Design<button class=\"chip-dismiss\" type=\"button\" aria-label=\"Remove Design\"><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m4 4 8 8m0-8-8 8\"/></svg></button></span><input id=\"forms-chips-input\" class=\"form-ghost\" type=\"text\" placeholder=\"Type a value and press Enter\" aria-describedby=\"forms-chips-help\" ></div><p class=\"form-text\" id=\"forms-chips-help\">Enter adds text; Backspace on an empty input first selects a chip.</p></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-chips-input\">Project tags</label><div id=\"forms-chips\" class=\"chip-input\" data-trm-chips ><span class=\"chip\" data-trm-chip-value=\"Design\">Design<button class=\"chip-dismiss\" type=\"button\" aria-label=\"Remove Design\"><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m4 4 8 8m0-8-8 8\"/></svg></button></span><input id=\"forms-chips-input\" class=\"form-ghost\" type=\"text\" placeholder=\"Type a value and press Enter\" aria-describedby=\"forms-chips-help\" ></div><p class=\"form-text\" id=\"forms-chips-help\">Enter adds text; Backspace on an empty input first selects a chip.</p></div>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": choiceDemoCss
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<form id=\"forms-submitted-tags-form\" data-demo-chip-form><div class=\"form-field\"><label class=\"form-label\" for=\"forms-submitted-tags-input\">Submitted project tags</label><div id=\"forms-submitted-tags\" class=\"chip-input\" data-trm-chips ><span class=\"chip\" data-trm-chip-value=\"Design\">Design<button class=\"chip-dismiss\" type=\"button\" aria-label=\"Remove Design\"><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m4 4 8 8m0-8-8 8\"/></svg></button></span><input id=\"forms-submitted-tags-input\" class=\"form-ghost\" type=\"text\" placeholder=\"Type a value and press Enter\" aria-describedby=\"forms-submitted-tags-help\" ></div><p class=\"form-text\" id=\"forms-submitted-tags-help\">Enter adds text; Backspace on an empty input first selects a chip.</p></div><input type=\"hidden\" name=\"project-tags\" value=\"[&quot;Design&quot;]\"><p role=\"status\">Current values: Design. Hidden JSON is ready.</p></form>"
        },
        {
          "language": "js",
          "source": chipsSubmissionJavascript
        }
      ],
      "example": "<form id=\"forms-submitted-tags-form\" data-demo-chip-form><div class=\"form-field\"><label class=\"form-label\" for=\"forms-submitted-tags-input\">Submitted project tags</label><div id=\"forms-submitted-tags\" class=\"chip-input\" data-trm-chips ><span class=\"chip\" data-trm-chip-value=\"Design\">Design<button class=\"chip-dismiss\" type=\"button\" aria-label=\"Remove Design\"><svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m4 4 8 8m0-8-8 8\"/></svg></button></span><input id=\"forms-submitted-tags-input\" class=\"form-ghost\" type=\"text\" placeholder=\"Type a value and press Enter\" aria-describedby=\"forms-submitted-tags-help\" ></div><p class=\"form-text\" id=\"forms-submitted-tags-help\">Enter adds text; Backspace on an empty input first selects a chip.</p></div><input type=\"hidden\" name=\"project-tags\" value=\"[&quot;Design&quot;]\"><p role=\"status\">Current values: Design. Hidden JSON is ready.</p></form>"
    },
    {}
  ],
  "forms/combobox": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><span class=\"form-label\" id=\"forms-combo-city-label\">City</span>\n  <button class=\"form-control combobox-toggle\" type=\"button\" id=\"forms-combo-city\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"forms-combo-city-options\" aria-labelledby=\"forms-combo-city-label forms-combo-city-value\" data-trm-toggle=\"combobox\" data-trm-search=\"true\" data-trm-name=\"forms-combo-city\" data-trm-placeholder=\"Choose a value\"><span class=\"combobox-value\" id=\"forms-combo-city-value\">Choose a value</span><svg class=\"combobox-caret\" width=\"10\" height=\"16\" viewBox=\"0 0 10 16\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m1 6 4 4 4-4\"/></svg></button>\n  <div class=\"menu\" id=\"forms-combo-city-menu\"><div class=\"combobox-search\"><input class=\"form-control combobox-search-input\" type=\"search\" aria-label=\"Search City\" placeholder=\"Search\" autocomplete=\"off\"></div><div role=\"listbox\" id=\"forms-combo-city-options\" aria-labelledby=\"forms-combo-city-label\"><button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"par\">Paris<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lon\">London<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lis\">Lisbon<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button></div><div class=\"combobox-no-results d-none\" role=\"status\">No matching values</div></div></div>"
        }
      ],
      "example": "<div class=\"form-field\"><span class=\"form-label\" id=\"forms-combo-city-label\">City</span>\n  <button class=\"form-control combobox-toggle\" type=\"button\" id=\"forms-combo-city\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"forms-combo-city-options\" aria-labelledby=\"forms-combo-city-label forms-combo-city-value\" data-trm-toggle=\"combobox\" data-trm-search=\"true\" data-trm-name=\"forms-combo-city\" data-trm-placeholder=\"Choose a value\"><span class=\"combobox-value\" id=\"forms-combo-city-value\">Choose a value</span><svg class=\"combobox-caret\" width=\"10\" height=\"16\" viewBox=\"0 0 10 16\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m1 6 4 4 4-4\"/></svg></button>\n  <div class=\"menu\" id=\"forms-combo-city-menu\"><div class=\"combobox-search\"><input class=\"form-control combobox-search-input\" type=\"search\" aria-label=\"Search City\" placeholder=\"Search\" autocomplete=\"off\"></div><div role=\"listbox\" id=\"forms-combo-city-options\" aria-labelledby=\"forms-combo-city-label\"><button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"par\">Paris<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lon\">London<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lis\">Lisbon<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button></div><div class=\"combobox-no-results d-none\" role=\"status\">No matching values</div></div></div>"
    },
    {
      "code": [
        {
          "language": "css",
          "source": choiceDemoCss
        }
      ]
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><span class=\"form-label\" id=\"forms-combo-offices-label\">Offices</span>\n  <button class=\"form-control combobox-toggle\" type=\"button\" id=\"forms-combo-offices\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"forms-combo-offices-options\" aria-labelledby=\"forms-combo-offices-label forms-combo-offices-value\" data-trm-toggle=\"combobox\" data-trm-search=\"true\" data-trm-name=\"forms-combo-offices\" data-trm-placeholder=\"Choose a value\" data-trm-multiple=\"true\"><span class=\"combobox-value\" id=\"forms-combo-offices-value\">Choose a value</span><svg class=\"combobox-caret\" width=\"10\" height=\"16\" viewBox=\"0 0 10 16\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m1 6 4 4 4-4\"/></svg></button>\n  <div class=\"menu\" id=\"forms-combo-offices-menu\"><div class=\"combobox-search\"><input class=\"form-control combobox-search-input\" type=\"search\" aria-label=\"Search Offices\" placeholder=\"Search\" autocomplete=\"off\"></div><div role=\"listbox\" id=\"forms-combo-offices-options\" aria-labelledby=\"forms-combo-offices-label\" aria-multiselectable=\"true\"><button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"par\">Paris<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item selected\" type=\"button\" role=\"option\" aria-selected=\"true\" data-trm-value=\"lon\">London<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lis\">Lisbon<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button></div><div class=\"combobox-no-results d-none\" role=\"status\">No matching values</div></div></div>"
        }
      ],
      "example": "<div class=\"form-field\"><span class=\"form-label\" id=\"forms-combo-offices-label\">Offices</span>\n  <button class=\"form-control combobox-toggle\" type=\"button\" id=\"forms-combo-offices\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"false\" aria-controls=\"forms-combo-offices-options\" aria-labelledby=\"forms-combo-offices-label forms-combo-offices-value\" data-trm-toggle=\"combobox\" data-trm-search=\"true\" data-trm-name=\"forms-combo-offices\" data-trm-placeholder=\"Choose a value\" data-trm-multiple=\"true\"><span class=\"combobox-value\" id=\"forms-combo-offices-value\">Choose a value</span><svg class=\"combobox-caret\" width=\"10\" height=\"16\" viewBox=\"0 0 10 16\" fill=\"none\" stroke=\"currentColor\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m1 6 4 4 4-4\"/></svg></button>\n  <div class=\"menu\" id=\"forms-combo-offices-menu\"><div class=\"combobox-search\"><input class=\"form-control combobox-search-input\" type=\"search\" aria-label=\"Search Offices\" placeholder=\"Search\" autocomplete=\"off\"></div><div role=\"listbox\" id=\"forms-combo-offices-options\" aria-labelledby=\"forms-combo-offices-label\" aria-multiselectable=\"true\"><button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"par\">Paris<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item selected\" type=\"button\" role=\"option\" aria-selected=\"true\" data-trm-value=\"lon\">London<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button>\n<button class=\"menu-item\" type=\"button\" role=\"option\" aria-selected=\"false\" data-trm-value=\"lis\">Lisbon<svg class=\"menu-item-check\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" focusable=\"false\"><path d=\"m2 7 4 5 8-8\"/></svg></button></div><div class=\"combobox-no-results d-none\" role=\"status\">No matching values</div></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "js",
          "source": "import Combobox from 'tremplin/combobox'\nconst trigger = document.querySelector('#forms-combo-city')\nconst combo = Combobox.getOrCreateInstance(trigger)\n// Observe Menu completion, not Combobox's immediate shown notification.\ntrigger.addEventListener('shown.trm.menu', () => { /* settled Menu */ })\ncombo.show()"
        }
      ]
    }
  ],
  "forms/datepicker": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-date\">Project deadline</label><input id=\"forms-date\" type=\"text\" class=\"form-control\" name=\"deadline\" data-trm-toggle=\"datepicker\" data-trm-selected-dates='[\"2026-10-15\"]' autocomplete=\"off\" ></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-date\">Project deadline</label><input id=\"forms-date\" type=\"text\" class=\"form-control\" name=\"deadline\" data-trm-toggle=\"datepicker\" data-trm-selected-dates='[\"2026-10-15\"]' autocomplete=\"off\" ></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"table-responsive focus-ring\" role=\"region\" tabindex=\"0\" aria-label=\"Inline date calendar\"><div id=\"forms-inline-date\" data-trm-toggle=\"datepicker\" data-trm-inline=\"true\" data-demo-inline-date data-trm-selected-dates='[\"2026-10-15\"]' data-trm-display-months-count=\"1\"></div></div><input id=\"forms-inline-date-value\" type=\"hidden\" name=\"selected-date\" value=\"2026-10-15\">"
        }
      ],
      "example": "<div class=\"table-responsive focus-ring\" role=\"region\" tabindex=\"0\" aria-label=\"Inline date calendar\"><div id=\"forms-inline-date\" data-trm-toggle=\"datepicker\" data-trm-inline=\"true\" data-demo-inline-date data-trm-selected-dates='[\"2026-10-15\"]' data-trm-display-months-count=\"1\"></div></div><input id=\"forms-inline-date-value\" type=\"hidden\" name=\"selected-date\" value=\"2026-10-15\">"
    },
    {
      "code": [
        {
          "language": "css",
          "source": advancedDemoCss
        }
      ]
    },
    {},
    {
      "code": [
        {
          "language": "js",
          "source": "import Datepicker from 'tremplin/datepicker'\n\nconst picker = Datepicker.getOrCreateInstance('#forms-date')\nconst dates = picker.getSelectedDates() // copied ISO-date array\n// setSelectedDates([...]) updates display, but does not emit change.trm.datepicker."
        }
      ]
    },
    {
      "code": [
        {
          "language": "js",
          "source": advancedDemoJavascript
        }
      ]
    }
  ],
  "forms/otp-input": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-otp-code\">Verification code</label><div id=\"forms-otp\" class=\"otp\" data-trm-otp ><input id=\"forms-otp-code\" type=\"text\" name=\"code\" maxlength=\"4\" autocomplete=\"one-time-code\" ></div></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-otp-code\">Verification code</label><div id=\"forms-otp\" class=\"otp\" data-trm-otp ><input id=\"forms-otp-code\" type=\"text\" name=\"code\" maxlength=\"4\" autocomplete=\"one-time-code\" ></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-grouped-otp-code\">Grouped verification code</label><div id=\"forms-grouped-otp\" class=\"otp\" data-trm-otp data-trm-groups=\"[3,3]\" style=\"--trm-otp-size: clamp(2rem, 6vw, 2.5rem); --trm-otp-gap: .25rem\"><input id=\"forms-grouped-otp-code\" type=\"text\" name=\"code\" maxlength=\"6\" autocomplete=\"one-time-code\" ></div></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-grouped-otp-code\">Grouped verification code</label><div id=\"forms-grouped-otp\" class=\"otp\" data-trm-otp data-trm-groups=\"[3,3]\" style=\"--trm-otp-size: clamp(2rem, 6vw, 2.5rem); --trm-otp-gap: .25rem\"><input id=\"forms-grouped-otp-code\" type=\"text\" name=\"code\" maxlength=\"6\" autocomplete=\"one-time-code\" ></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "js",
          "source": "import OtpInput from 'tremplin/otp-input'\n\nconst otp = OtpInput.getOrCreateInstance('#forms-otp')\n// The named native input submits the complete value; do not log codes.\n// Runtime events: input.trm.otpInput and complete.trm.otpInput."
        }
      ]
    }
  ],
  "forms/password-strength": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-strength-password\">New password</label><input id=\"forms-strength-password\" class=\"form-control\" name=\"password\" type=\"password\" autocomplete=\"new-password\" aria-describedby=\"forms-strength-password-feedback\" value=\"\" ><div id=\"forms-strength-password-strength\" class=\"strength\" data-trm-strength data-trm-input=\"#forms-strength-password\" aria-hidden=\"true\" ><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span></div><p id=\"forms-strength-password-feedback\" class=\"strength-text\" role=\"status\" aria-live=\"polite\"></p></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-strength-password\">New password</label><input id=\"forms-strength-password\" class=\"form-control\" name=\"password\" type=\"password\" autocomplete=\"new-password\" aria-describedby=\"forms-strength-password-feedback\" value=\"\" ><div id=\"forms-strength-password-strength\" class=\"strength\" data-trm-strength data-trm-input=\"#forms-strength-password\" aria-hidden=\"true\" ><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span><span class=\"strength-segment\"></span></div><p id=\"forms-strength-password-feedback\" class=\"strength-text\" role=\"status\" aria-live=\"polite\"></p></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-bar-password\">Bar password</label><input id=\"forms-bar-password\" class=\"form-control\" name=\"password\" type=\"password\" autocomplete=\"new-password\" aria-describedby=\"forms-bar-password-feedback\" value=\"\" ><div id=\"forms-bar-password-strength\" class=\"strength-bar\" data-trm-strength data-trm-input=\"#forms-bar-password\" aria-hidden=\"true\" ></div><p id=\"forms-bar-password-feedback\" class=\"strength-text\" role=\"status\" aria-live=\"polite\"></p></div>"
        }
      ],
      "example": "<div class=\"form-field\"><label class=\"form-label\" for=\"forms-bar-password\">Bar password</label><input id=\"forms-bar-password\" class=\"form-control\" name=\"password\" type=\"password\" autocomplete=\"new-password\" aria-describedby=\"forms-bar-password-feedback\" value=\"\" ><div id=\"forms-bar-password-strength\" class=\"strength-bar\" data-trm-strength data-trm-input=\"#forms-bar-password\" aria-hidden=\"true\" ></div><p id=\"forms-bar-password-feedback\" class=\"strength-text\" role=\"status\" aria-live=\"polite\"></p></div>"
    },
    {},
    {
      "code": [
        {
          "language": "js",
          "source": "import Strength from 'tremplin/strength'\n\nconst strength = Strength.getOrCreateInstance('#forms-strength-password-strength')\nconst level = strength.getStrength() // null, weak, fair, good or strong\n// Call evaluate() after an application-owned input.value change."
        }
      ]
    },
    {
      "code": [
        {
          "language": "js",
          "source": advancedDemoJavascript
        }
      ]
    }
  ],
  "forms/layout": [
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form data-composition-local class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-utility-name\">Example name</label><input class=\"form-control\" id=\"composition-layout-utility-name\" name=\"name\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-utility-code\">Example code</label><input class=\"form-control\" id=\"composition-layout-utility-code\" name=\"code\"></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Preview locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
        },
        {
          "language": "js",
          "source": localFormScript
        }
      ],
      "example": "<div data-form-composition-demo><form data-composition-local class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-utility-name\">Example name</label><input class=\"form-control\" id=\"composition-layout-utility-name\" name=\"name\"></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-utility-code\">Example code</label><input class=\"form-control\" id=\"composition-layout-utility-code\" name=\"code\"></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Preview locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"row g-3\" data-forms-demo=\"grid\"><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-layout-first\">First name</label><input class=\"form-control\" id=\"forms-layout-first\" name=\"firstName\" autocomplete=\"given-name\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-layout-last\">Last name</label><input class=\"form-control\" id=\"forms-layout-last\" name=\"lastName\" autocomplete=\"family-name\"></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"row g-3\" data-forms-demo=\"grid\"><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-layout-first\">First name</label><input class=\"form-control\" id=\"forms-layout-first\" name=\"firstName\" autocomplete=\"given-name\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-layout-last\">Last name</label><input class=\"form-control\" id=\"forms-layout-last\" name=\"lastName\" autocomplete=\"family-name\"></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form data-composition-local class=\"row g-3\"><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-email\">Example email</label><input class=\"form-control\" id=\"composition-layout-email\" type=\"email\" name=\"email\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-city\">City</label><input class=\"form-control\" id=\"composition-layout-city\" name=\"city\"></div></div><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-address\">Mailing address</label><input class=\"form-control\" id=\"composition-layout-address\" name=\"address\"></div></div><div class=\"col-12 md:col-8\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-region\">Region</label><input class=\"form-control\" id=\"composition-layout-region\" name=\"region\"></div></div><div class=\"col-12 md:col-4\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-postcode\">Postal code</label><input class=\"form-control\" id=\"composition-layout-postcode\" name=\"postcode\"></div></div><div class=\"col-12\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Review address locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form data-composition-local class=\"row g-3\"><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-email\">Example email</label><input class=\"form-control\" id=\"composition-layout-email\" type=\"email\" name=\"email\"></div></div><div class=\"col-12 md:col-6\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-city\">City</label><input class=\"form-control\" id=\"composition-layout-city\" name=\"city\"></div></div><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-address\">Mailing address</label><input class=\"form-control\" id=\"composition-layout-address\" name=\"address\"></div></div><div class=\"col-12 md:col-8\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-region\">Region</label><input class=\"form-control\" id=\"composition-layout-region\" name=\"region\"></div></div><div class=\"col-12 md:col-4\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-postcode\">Postal code</label><input class=\"form-control\" id=\"composition-layout-postcode\" name=\"postcode\"></div></div><div class=\"col-12\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Review address locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form data-composition-local class=\"vstack gap-3\"><div class=\"row g-3\"><label class=\"sm:col-4 col-form-label\" for=\"forms-layout-project\">Project name</label><div class=\"sm:col-8\"><input class=\"form-control\" id=\"forms-layout-project\" name=\"project\"></div></div><fieldset class=\"row g-3\"><legend class=\"sm:col-4 col-form-label pt-0\">Delivery</legend><div class=\"sm:col-8 vstack gap-2\"><div class=\"form-field\"><input class=\"radio\" id=\"composition-layout-radio-a\" type=\"radio\" name=\"delivery\" value=\"standard\" checked><label class=\"\" for=\"composition-layout-radio-a\">Standard</label></div><div class=\"form-field\"><input class=\"radio\" id=\"composition-layout-radio-b\" type=\"radio\" name=\"delivery\" value=\"express\"><label class=\"\" for=\"composition-layout-radio-b\">Express</label></div></div></fieldset><div class=\"row\"><div class=\"sm:col-8 sm:offset-4\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Review delivery locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></div></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form data-composition-local class=\"vstack gap-3\"><div class=\"row g-3\"><label class=\"sm:col-4 col-form-label\" for=\"forms-layout-project\">Project name</label><div class=\"sm:col-8\"><input class=\"form-control\" id=\"forms-layout-project\" name=\"project\"></div></div><fieldset class=\"row g-3\"><legend class=\"sm:col-4 col-form-label pt-0\">Delivery</legend><div class=\"sm:col-8 vstack gap-2\"><div class=\"form-field\"><input class=\"radio\" id=\"composition-layout-radio-a\" type=\"radio\" name=\"delivery\" value=\"standard\" checked><label class=\"\" for=\"composition-layout-radio-a\">Standard</label></div><div class=\"form-field\"><input class=\"radio\" id=\"composition-layout-radio-b\" type=\"radio\" name=\"delivery\" value=\"express\"><label class=\"\" for=\"composition-layout-radio-b\">Express</label></div></div></fieldset><div class=\"row\"><div class=\"sm:col-8 sm:offset-4\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Review delivery locally</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></div></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"row g-3\"><label for=\"composition-layout-label-sm\" class=\"sm:col-4 col-form-label col-form-label-sm\">sm field</label><div class=\"sm:col-8\"><input class=\"form-control form-control-sm\" id=\"composition-layout-label-sm\" ></div></div>\n<div class=\"row g-3\"><label for=\"composition-layout-label-default\" class=\"sm:col-4 col-form-label\">Default field</label><div class=\"sm:col-8\"><input class=\"form-control\" id=\"composition-layout-label-default\" ></div></div>\n<div class=\"row g-3\"><label for=\"composition-layout-label-lg\" class=\"sm:col-4 col-form-label col-form-label-lg\">lg field</label><div class=\"sm:col-8\"><input class=\"form-control form-control-lg\" id=\"composition-layout-label-lg\" ></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"row g-3\"><label for=\"composition-layout-label-sm\" class=\"sm:col-4 col-form-label col-form-label-sm\">sm field</label><div class=\"sm:col-8\"><input class=\"form-control form-control-sm\" id=\"composition-layout-label-sm\" ></div></div>\n<div class=\"row g-3\"><label for=\"composition-layout-label-default\" class=\"sm:col-4 col-form-label\">Default field</label><div class=\"sm:col-8\"><input class=\"form-control\" id=\"composition-layout-label-default\" ></div></div>\n<div class=\"row g-3\"><label for=\"composition-layout-label-lg\" class=\"sm:col-4 col-form-label col-form-label-lg\">lg field</label><div class=\"sm:col-8\"><input class=\"form-control form-control-lg\" id=\"composition-layout-label-lg\" ></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"row g-3\"><div class=\"col-12 sm:col-7\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-wide\">Wider project field</label><input class=\"form-control\" id=\"composition-layout-wide\" ></div></div><div class=\"col-12 sm:col\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-short\">Short code</label><input class=\"form-control\" id=\"composition-layout-short\" ></div></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"row g-3\"><div class=\"col-12 sm:col-7\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-wide\">Wider project field</label><input class=\"form-control\" id=\"composition-layout-wide\" ></div></div><div class=\"col-12 sm:col\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-short\">Short code</label><input class=\"form-control\" id=\"composition-layout-short\" ></div></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form data-composition-local class=\"row lg:row-cols-auto g-3 align-items-end\"><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-inline-name\">Project name</label><input class=\"form-control\" id=\"composition-layout-inline-name\" name=\"project\"></div></div><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-inline-role\">Role</label><select class=\"form-control\" id=\"composition-layout-inline-role\" name=\"role\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div><div class=\"col-12\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Preview inline form</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form data-composition-local class=\"row lg:row-cols-auto g-3 align-items-end\"><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-inline-name\">Project name</label><input class=\"form-control\" id=\"composition-layout-inline-name\" name=\"project\"></div></div><div class=\"col-12\"><div class=\"form-field\"><label class=\"form-label\" for=\"composition-layout-inline-role\">Role</label><select class=\"form-control\" id=\"composition-layout-inline-role\" name=\"role\"><option value=\"design\">Design</option><option value=\"engineering\">Engineering</option><option value=\"support\">Support</option></select></div></div><div class=\"col-12\"><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Preview inline form</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></div></form></div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": compositionSass["layout"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": compositionDemoCss
        }
      ]
    }
  ],
  "forms/validation": [
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form id=\"forms-validation-demo\" data-composition-validation novalidate class=\"vstack gap-3\"><div class=\"border rounded-5 p-3 focus-ring\" data-error-summary role=\"alert\" tabindex=\"-1\" hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"></ul></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-validation-email\">Email address (required)</label><input class=\"form-control\" id=\"forms-validation-email\" type=\"email\" name=\"email\" required autocomplete=\"email\" aria-describedby=\"forms-validation-error\" data-composition-validate-field data-error-message=\"Enter a valid email address\"><p class=\"invalid-feedback mb-0\" id=\"forms-validation-error\">Enter a valid email address.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Check details</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
        },
        {
          "language": "js",
          "source": validationScript
        }
      ],
      "example": "<div data-form-composition-demo><form id=\"forms-validation-demo\" data-composition-validation novalidate class=\"vstack gap-3\"><div class=\"border rounded-5 p-3 focus-ring\" data-error-summary role=\"alert\" tabindex=\"-1\" hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"></ul></div><div class=\"form-field\"><label class=\"form-label\" for=\"forms-validation-email\">Email address (required)</label><input class=\"form-control\" id=\"forms-validation-email\" type=\"email\" name=\"email\" required autocomplete=\"email\" aria-describedby=\"forms-validation-error\" data-composition-validate-field data-error-message=\"Enter a valid email address\"><p class=\"invalid-feedback mb-0\" id=\"forms-validation-error\">Enter a valid email address.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Check details</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form id=\"composition-code-form\" data-composition-validation novalidate class=\"vstack gap-3\"><div class=\"border rounded-5 p-3 focus-ring\" data-error-summary role=\"alert\" tabindex=\"-1\" hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"></ul></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-validation-code\">Project code (required)</label><input class=\"form-control\" id=\"composition-validation-code\" name=\"code\" required pattern=\"[A-Z0-9]{6}\" maxlength=\"6\" data-project-code data-composition-validate-field data-error-message=\"Use six uppercase letters or digits, except DEMO00\" aria-describedby=\"composition-code-help composition-code-error\"><small class=\"form-text\" id=\"composition-code-help\">Six uppercase letters or digits; DEMO00 is reserved.</small><p class=\"invalid-feedback mb-0\" id=\"composition-code-error\">Use six uppercase letters or digits, except DEMO00.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Check project code</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form id=\"composition-code-form\" data-composition-validation novalidate class=\"vstack gap-3\"><div class=\"border rounded-5 p-3 focus-ring\" data-error-summary role=\"alert\" tabindex=\"-1\" hidden><p><strong>Check the required details.</strong></p><ul class=\"mb-0\"></ul></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-validation-code\">Project code (required)</label><input class=\"form-control\" id=\"composition-validation-code\" name=\"code\" required pattern=\"[A-Z0-9]{6}\" maxlength=\"6\" data-project-code data-composition-validate-field data-error-message=\"Use six uppercase letters or digits, except DEMO00\" aria-describedby=\"composition-code-help composition-code-error\"><small class=\"form-text\" id=\"composition-code-help\">Six uppercase letters or digits; DEMO00 is reserved.</small><p class=\"invalid-feedback mb-0\" id=\"composition-code-error\">Use six uppercase letters or digits, except DEMO00.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Check project code</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form id=\"forms-native-demo\" data-composition-local class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-native-email\">Native email validation (required)</label><input class=\"form-control\" id=\"forms-native-email\" type=\"email\" name=\"email\" required autocomplete=\"email\"></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Try native validation</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form id=\"forms-native-demo\" data-composition-local class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-native-email\">Native email validation (required)</label><input class=\"form-control\" id=\"forms-native-email\" type=\"email\" name=\"email\" required autocomplete=\"email\"></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Try native validation</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-server-email\">Account email</label><input class=\"form-control is-invalid\" id=\"forms-server-email\" type=\"email\" value=\"already-used@example.com\" aria-invalid=\"true\" aria-describedby=\"composition-server-error\"><p class=\"invalid-feedback mb-0\" id=\"composition-server-error\">That address is already registered. Use another address or sign in.</p></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-server-valid\">Accepted project</label><input class=\"form-control is-valid\" id=\"composition-server-valid\" value=\"Example project\" aria-describedby=\"composition-server-success\"><p class=\"valid-feedback mb-0\" id=\"composition-server-success\">This example was accepted.</p></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><label class=\"form-label\" for=\"forms-server-email\">Account email</label><input class=\"form-control is-invalid\" id=\"forms-server-email\" type=\"email\" value=\"already-used@example.com\" aria-invalid=\"true\" aria-describedby=\"composition-server-error\"><p class=\"invalid-feedback mb-0\" id=\"composition-server-error\">That address is already registered. Use another address or sign in.</p></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-server-valid\">Accepted project</label><input class=\"form-control is-valid\" id=\"composition-server-valid\" value=\"Example project\" aria-describedby=\"composition-server-success\"><p class=\"valid-feedback mb-0\" id=\"composition-server-success\">This example was accepted.</p></div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input class=\"check is-invalid\" id=\"composition-invalid-check\" type=\"checkbox\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-check-error\"><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-check\">Required agreement</label><p id=\"composition-invalid-check-error\" class=\"invalid-feedback mb-0\">Accept the agreement.</p></div></div>\n<fieldset class=\"form-group\"><legend>Delivery choice</legend><div class=\"form-field\"><input class=\"radio is-invalid\" id=\"composition-invalid-radio\" type=\"radio\" name=\"composition-invalid-delivery\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-radio-error\"><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-radio\">Standard delivery</label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-radio-error\">Choose a delivery method.</p></div></div></fieldset>\n<div class=\"form-field\"><span class=\"switch\"><input class=\"is-invalid\" id=\"composition-invalid-switch\" type=\"checkbox\" role=\"switch\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-switch-error\"></span><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-switch\">Enable required setting</label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-switch-error\">Enable this setting.</p></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-invalid-group\">Required username</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control is-invalid\" id=\"composition-invalid-group\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-group-error\"></div><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-group-error\">Choose a username.</p></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-invalid-adorn\">Required search term</label><label class=\"form-control form-adorn \" for=\"composition-invalid-adorn\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost is-invalid\" id=\"composition-invalid-adorn\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-adorn-error\"></label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-adorn-error\">Enter a search term.</p></div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"vstack gap-3\"><div class=\"form-field\"><input class=\"check is-invalid\" id=\"composition-invalid-check\" type=\"checkbox\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-check-error\"><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-check\">Required agreement</label><p id=\"composition-invalid-check-error\" class=\"invalid-feedback mb-0\">Accept the agreement.</p></div></div>\n<fieldset class=\"form-group\"><legend>Delivery choice</legend><div class=\"form-field\"><input class=\"radio is-invalid\" id=\"composition-invalid-radio\" type=\"radio\" name=\"composition-invalid-delivery\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-radio-error\"><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-radio\">Standard delivery</label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-radio-error\">Choose a delivery method.</p></div></div></fieldset>\n<div class=\"form-field\"><span class=\"switch\"><input class=\"is-invalid\" id=\"composition-invalid-switch\" type=\"checkbox\" role=\"switch\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-switch-error\"></span><div class=\"form-field-content\"><label class=\"\" for=\"composition-invalid-switch\">Enable required setting</label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-switch-error\">Enable this setting.</p></div></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-invalid-group\">Required username</label><div class=\"input-group\"><span class=\"input-group-text\" dir=\"ltr\" aria-hidden=\"true\">@</span><input class=\"form-control is-invalid\" id=\"composition-invalid-group\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-group-error\"></div><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-group-error\">Choose a username.</p></div>\n<div class=\"form-field\"><label class=\"form-label\" for=\"composition-invalid-adorn\">Required search term</label><label class=\"form-control form-adorn \" for=\"composition-invalid-adorn\"><span class=\"form-adorn-icon\" dir=\"ltr\" aria-hidden=\"true\"><svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"currentColor\" focusable=\"false\"><path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/></svg></span><input class=\"form-ghost is-invalid\" id=\"composition-invalid-adorn\" aria-invalid=\"true\" aria-describedby=\"composition-invalid-adorn-error\"></label><p class=\"invalid-feedback mb-0\" id=\"composition-invalid-adorn-error\">Enter a search term.</p></div></div></div>"
    },
    {},
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><div class=\"form-field position-relative pb-5\"><label class=\"form-label\" for=\"composition-validation-tooltip\">Example account code</label><input class=\"form-control is-invalid\" id=\"composition-validation-tooltip\" aria-invalid=\"true\" aria-describedby=\"composition-tooltip-inline\"><p class=\"invalid-feedback mb-0\" id=\"composition-tooltip-inline\">Choose an available account code.</p><div class=\"tooltip invalid-tooltip\" aria-hidden=\"true\">Choose an available code.</div></div></div>"
        }
      ],
      "example": "<div data-form-composition-demo><div class=\"form-field position-relative pb-5\"><label class=\"form-label\" for=\"composition-validation-tooltip\">Example account code</label><input class=\"form-control is-invalid\" id=\"composition-validation-tooltip\" aria-invalid=\"true\" aria-describedby=\"composition-tooltip-inline\"><p class=\"invalid-feedback mb-0\" id=\"composition-tooltip-inline\">Choose an available account code.</p><div class=\"tooltip invalid-tooltip\" aria-hidden=\"true\">Choose an available code.</div></div></div>"
    },
    {
      "code": [
        {
          "language": "html",
          "source": "<div data-form-composition-demo><form id=\"composition-native-state-form\" data-composition-local novalidate class=\"vstack gap-3\"><div class=\"form-field\" data-trm-validate=\"valid\"><label class=\"form-label\" for=\"composition-native-required\">Required project name</label><input class=\"form-control\" id=\"composition-native-required\" required name=\"project\" aria-describedby=\"composition-native-required-good composition-native-required-error\"><p class=\"valid-feedback mb-0\" id=\"composition-native-required-good\">The native required constraint is satisfied.</p><p class=\"invalid-feedback mb-0\" id=\"composition-native-required-error\">Enter a project name.</p></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-native-optional\">Optional project note</label><input class=\"form-control\" id=\"composition-native-optional\" name=\"note\" aria-describedby=\"composition-native-optional-good\"><p class=\"valid-feedback mb-0\" id=\"composition-native-optional-good\">This optional field is outside the success scope.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Try scoped native validity</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
        }
      ],
      "example": "<div data-form-composition-demo><form id=\"composition-native-state-form\" data-composition-local novalidate class=\"vstack gap-3\"><div class=\"form-field\" data-trm-validate=\"valid\"><label class=\"form-label\" for=\"composition-native-required\">Required project name</label><input class=\"form-control\" id=\"composition-native-required\" required name=\"project\" aria-describedby=\"composition-native-required-good composition-native-required-error\"><p class=\"valid-feedback mb-0\" id=\"composition-native-required-good\">The native required constraint is satisfied.</p><p class=\"invalid-feedback mb-0\" id=\"composition-native-required-error\">Enter a project name.</p></div><div class=\"form-field\"><label class=\"form-label\" for=\"composition-native-optional\">Optional project note</label><input class=\"form-control\" id=\"composition-native-optional\" name=\"note\" aria-describedby=\"composition-native-optional-good\"><p class=\"valid-feedback mb-0\" id=\"composition-native-optional-good\">This optional field is outside the success scope.</p></div><div class=\"d-flex flex-wrap gap-2\"><button type=\"submit\" class=\"btn-outline theme-inverse\" data-composition-submit disabled>Try scoped native validity</button><button type=\"reset\" class=\"btn-outline theme-inverse\">Reset form</button></div><p class=\"form-text mb-0\" role=\"status\" data-composition-status>No submission attempted.</p></form></div>"
    },
    {
      "code": [
        {
          "language": "scss",
          "source": compositionSass["validation"]!
        }
      ]
    },
    {
      "code": [
        {
          "language": "scss",
          "source": "@use 'tremplin/scss/forms/validation' with ($validation-states: ('warning': 'warning'));\n@use 'tremplin/scss/mixins/form-validation' as selectors;\n.project-validation {\n  @include selectors.form-validation-state-selector('invalid') { outline-style: solid; }\n}"
        }
      ]
    },
    {
      "code": [
        {
          "language": "css",
          "source": compositionDemoCss
        }
      ]
    }
  ]
}

export const formsRawScripts: Record<string, string> = {
"forms/overview": formsDemoJavascript,
"forms/checkbox": indeterminateDemoJavascript,
"forms/range": advancedDemoJavascript,
"forms/chips": chipsSubmissionJavascript,
"forms/datepicker": advancedDemoJavascript,
"forms/password-strength": advancedDemoJavascript,
"forms/layout": localFormScript,
"forms/validation": validationScript,
}

export const formsExamples: Record<string, FormExample[]> = Object.fromEntries(Object.entries(formsRawExamples).map(([slug, entries]) => [slug, !contrastGuideSlugs.has(slug) ? entries : [
  { code: [{ language: 'css', source: demoContrastCss }] },
  ...entries.map(entry => ({ ...entry, example: entry.example ? contrastExample(entry.example) : undefined, code: entry.code?.map(sample => sample.language === 'html' ? { ...sample, source: contrastExample(sample.source) } : sample) }))
]]))
export const formsRuntimeScripts: Record<string, string> = Object.fromEntries(Object.keys(formsRawExamples).map(slug => [slug, !contrastGuideSlugs.has(slug) ? formsRawScripts[slug] ?? '' : `${formsRawScripts[slug] ?? ''}\nconst demoStyle = document.createElement('style'); demoStyle.textContent = ${JSON.stringify(demoContrastCss)}; document.head.append(demoStyle);`]))
