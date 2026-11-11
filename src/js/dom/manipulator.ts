/**
 * --------------------------------------------------------------------------
 * Tremplin dom/manipulator.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

function normalizeData(value: string | null | undefined): unknown {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (value === Number(value).toString()) {
    return Number(value)
  }

  if (value === '' || value === 'null') {
    return null
  }

  if (typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(decodeURIComponent(value))
  } catch {
    return value
  }
}

function normalizeDataKey(key: string): string {
  return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`)
}

const Manipulator = {
  setDataAttribute(element: Element, key: string, value: unknown): void {
    element.setAttribute(`data-trm-${normalizeDataKey(key)}`, value as string)
  },

  removeDataAttribute(element: Element, key: string): void {
    element.removeAttribute(`data-trm-${normalizeDataKey(key)}`)
  },

  getDataAttributes(element: HTMLElement | null): Record<string, unknown> {
    if (!element) {
      return {}
    }

    const attributes: Record<string, unknown> = {}
    const trmKeys = Object.keys(element.dataset).filter(key => key.startsWith('trm') && !key.startsWith('trmConfig'))

    for (const key of trmKeys) {
      let pureKey = key.replace(/^trm/, '')
      pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1)
      attributes[pureKey] = normalizeData(element.dataset[key])
    }

    return attributes
  },

  getDataAttribute(element: Element, key: string): unknown {
    return normalizeData(element.getAttribute(`data-trm-${normalizeDataKey(key)}`))
  }
}

export default Manipulator
