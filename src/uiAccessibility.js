const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function getPreferredScrollBehavior() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'auto'
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

export function getFocusableElements(container) {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter((element) => {
    if (!(element instanceof HTMLElement)) {
      return false
    }

    return !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
  })
}
