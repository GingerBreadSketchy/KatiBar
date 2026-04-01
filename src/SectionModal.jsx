import { useEffect, useRef } from 'react'
import {
  X,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  PhoneCall,
  ChevronDown,
  MapPinned,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { getFocusableElements } from './uiAccessibility'

function SectionModal({ section, onClose, isSwahili, isLoadingDetails = false }) {
  const panelRef = useRef(null)

  // Trap focus & handle escape
  useEffect(() => {
    const panel = panelRef.current
    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const originalOverflow = document.body.style.overflow

    const focusableElements = getFocusableElements(panel)
    ;(focusableElements[0] || panel)?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab' || !panel) {
        return
      }

      const elements = getFocusableElements(panel)
      if (elements.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus()
      }
    }
  }, [onClose])

  const accentMap = {
    green: { color: '#3ecfa0', bar: '#006A4E', chip: 'chip-forest' },
    gold:  { color: '#facc15', bar: '#a16207', chip: 'chip-gold' },
    red:   { color: '#f47285', bar: '#C8102E', chip: 'chip-crimson' },
    blue:  { color: '#7db8ff', bar: '#3b82f6', chip: 'chip-blue'   },
    purple:{ color: '#c084fc', bar: '#7e22ce', chip: 'chip-purple' },
    teal:  { color: '#2dd4bf', bar: '#0f766e', chip: 'chip-teal' },
    orange:{ color: '#fb923c', bar: '#c2410c', chip: 'chip-orange' },
    black: { color: '#888',    bar: '#555',    chip: 'chip-neutral' },
  }
  const accent = accentMap[section.chapterColor] || accentMap.green
  const exampleStyles = [
    {
      icon: MapPinned,
      label: isSwahili ? 'Mfano wa 1' : 'Example 1',
      badgeBg: 'linear-gradient(135deg, rgba(200,16,46,0.22) 0%, rgba(249,115,22,0.16) 100%)',
      badgeBorder: 'rgba(244,114,133,0.35)',
      badgeColor: '#fca5a5',
      cardBg: 'linear-gradient(135deg, rgba(200,16,46,0.16) 0%, rgba(200,16,46,0.05) 100%)',
      cardBorder: 'rgba(200,16,46,0.22)',
      glow: '0 18px 40px rgba(200,16,46,0.12)',
    },
    {
      icon: Sparkles,
      label: isSwahili ? 'Mfano wa 2' : 'Example 2',
      badgeBg: 'linear-gradient(135deg, rgba(0,106,78,0.24) 0%, rgba(34,197,94,0.12) 100%)',
      badgeBorder: 'rgba(62,207,160,0.32)',
      badgeColor: '#86efac',
      cardBg: 'linear-gradient(135deg, rgba(0,106,78,0.16) 0%, rgba(0,106,78,0.05) 100%)',
      cardBorder: 'rgba(0,106,78,0.24)',
      glow: '0 18px 40px rgba(0,106,78,0.12)',
    },
  ]

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={panelRef}
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        aria-busy={isLoadingDetails}
        style={{ borderTop: `3px solid ${accent.bar}` }}
      >
        {/* ── Modal Header ──── */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="article-badge"
                style={{ color: accent.color, background: `${accent.bar}22` }}
              >
                {isSwahili ? (section.swArticle || section.article) : section.article}
              </span>
              <span className={accent.chip}>{isSwahili ? (section.swChapterTitle || section.chapterTitle || 'Katiba ya Kenya') : (section.chapterTitle || 'Constitution of Kenya')}</span>
            </div>
            <h2 id="modal-title" className="ui-heading text-fluid-2xl text-ink-1 text-2xl md:text-3xl font-semibold leading-tight">
              {isSwahili ? (section.swTitle || section.title) : section.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-2 mt-1 flex-shrink-0"
            aria-label={isSwahili ? "Funga" : "Close"}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="glow-line-crimson mx-6 mb-0" style={{ background: `linear-gradient(90deg, transparent, ${accent.bar}66, transparent)` }} />

        <div className="p-6 space-y-6">
          {/* Original text — collapsible */}
          {section.originalText ? (
            <details className="group border border-transparent hover:border-faint rounded-xl transition-colors">
              <summary className="flex items-center gap-2 text-ink-4 text-sm hover:text-ink-2 transition-colors cursor-pointer select-none p-2">
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                <span className="label text-xs">{isSwahili ? 'Angalia maandishi asilia ya kikatiba' : 'View original constitutional text'}</span>
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-subtle ml-3 mb-2">
                <p className="text-ink-3 text-sm leading-relaxed italic bg-surface-2 p-3 rounded-lg border border-faint shadow-inner">
                  {section.originalText}
                </p>
              </div>
            </details>
          ) : isLoadingDetails ? (
            <div className="rounded-xl border border-faint bg-surface-2/70 p-3">
              <div className="flex items-center gap-3 text-ink-4 text-sm">
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: 'rgba(0, 106, 78, 0.18)',
                    borderTopColor: '#3ecfa0',
                  }}
                  aria-hidden="true"
                />
                <span>{isSwahili ? 'Tunapakia maandishi rasmi ya Katiba…' : 'Loading the official constitutional text…'}</span>
              </div>
            </div>
          ) : null}

          {/* Simplified — hero block */}
          <div className="panel-forest p-5 rounded-xl border-l-4" style={{ borderLeftColor: '#006A4E' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-forest-bright" />
              <span className="label text-forest-bright">{isSwahili ? 'Hii ina maana gani kwako' : 'What this means for you'}</span>
            </div>
            <p className="text-ink-1 leading-relaxed text-base">
              {isSwahili ? (section.swSimplified || section.simplified) : section.simplified}
            </p>
            {section.explainerReviewStatus === 'draft' && (
              <p className="text-ink-4 text-sm mt-3 leading-relaxed">
                {isSwahili
                  ? 'Haya ni maelezo ya mwanzo yaliyotengenezwa ili kurahisisha kuelewa ibara hii. Tumia maandishi rasmi hapa chini kama rejeleo kuu la kisheria.'
                  : 'This is a first-pass draft explainer to make the Article easier to understand. Use the official constitutional text below as the legal source of truth.'}
              </p>
            )}
          </div>

          {/* Real-life examples */}
          {((isSwahili && section.swExamples) || section.examples) && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(200,16,46,0.14) 100%)',
                    border: '1px solid rgba(251,146,60,0.28)',
                    color: '#fdba74',
                    boxShadow: '0 10px 30px rgba(249,115,22,0.12)',
                  }}
                >
                  <WandSparkles className="w-5 h-5" />
                </span>
                <span className="label examples-heading text-orange-300">
                  {isSwahili ? 'Mifano ya maisha halisi' : 'Real-life examples'}
                </span>
              </div>
              <ul className="space-y-2">
                {(isSwahili ? (section.swExamples || section.examples) : section.examples).map((example, idx) => (
                  <li
                    key={idx}
                    className="relative overflow-hidden p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: exampleStyles[idx % exampleStyles.length].cardBg,
                      border: `1px solid ${exampleStyles[idx % exampleStyles.length].cardBorder}`,
                      boxShadow: exampleStyles[idx % exampleStyles.length].glow,
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl"
                      style={{ background: exampleStyles[idx % exampleStyles.length].badgeBorder }}
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{
                          background: exampleStyles[idx % exampleStyles.length].badgeBg,
                          border: `1px solid ${exampleStyles[idx % exampleStyles.length].badgeBorder}`,
                          color: exampleStyles[idx % exampleStyles.length].badgeColor,
                        }}
                        aria-hidden="true"
                      >
                        {(() => {
                          const ExampleIcon = exampleStyles[idx % exampleStyles.length].icon
                          return <ExampleIcon className="w-5 h-5" />
                        })()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: exampleStyles[idx % exampleStyles.length].badgeColor }}
                          >
                            {exampleStyles[idx % exampleStyles.length].label}
                          </span>
                        </div>
                        <span className="text-ink-2 text-sm leading-relaxed block">{example}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-ink-4 leading-relaxed">
                <p>
                  {isSwahili
                    ? 'Mifano hii imeandikwa kwa lugha rahisi kutokana na matatizo halisi yaliyoripotiwa au maelezo ya taasisi za Kenya.'
                    : 'These examples are written in simple English from real Kenyan complaint patterns and public rights guidance.'}
                </p>
                {section.exampleSources?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {section.exampleSources.map((source) => (
                      <a
                        key={source.id || source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{source.organization}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If violated */}
          {section.whatToDoIfViolated && (
            <div className="panel-crimson p-5 rounded-xl border-l-4" style={{ borderLeftColor: '#C8102E' }}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-crimson-bright flex-shrink-0" />
                <span className="label text-crimson-bright">{isSwahili ? 'Ikiwa haki yako imekiukwa' : 'If your right is violated'}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div className="bg-surface-2 rounded-lg p-3 border border-faint">
                  <span className="label text-ink-4 block mb-1">{isSwahili ? 'Mawasiliano' : 'Contact'}</span>
                  <p className="text-ink-2 text-sm font-medium flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-ink-3" />
                    {section.whatToDoIfViolated.contact}
                  </p>
                </div>
                <div className="bg-surface-2 rounded-lg p-3 border border-faint">
                  <span className="label text-ink-4 block mb-1">{isSwahili ? 'Ukomo wa Muda' : 'Time Limit'}</span>
                  <p className="text-ink-2 text-sm">{section.whatToDoIfViolated.timeLimit}</p>
                </div>
              </div>

              <div>
                <span className="label text-ink-4 block mb-3">{isSwahili ? 'Hatua za kuchukua' : 'Steps to take'}</span>
                <ol className="space-y-2">
                  {section.whatToDoIfViolated.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-ink-2">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans shadow-sm"
                        style={{ background: 'rgba(200,16,46,0.2)', color: '#f47285', border: '1px solid rgba(200,16,46,0.3)' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Related articles */}
          {section.relatedArticles?.length > 0 && (
            <div>
              <span className="label text-ink-4 block mb-2">{isSwahili ? 'Ibara Zinazohusiana' : 'Related Articles'}</span>
              <div className="flex flex-wrap gap-2 bg-surface-2 p-3 rounded-lg border border-subtle inline-flex">
                {section.relatedArticles.map(article => (
                  <span key={article} className="chip-neutral border-surface-4 bg-surface-3">{article}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {section.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {section.tags.map(tag => (
                <span key={tag} className="tag-pill bg-transparent border border-faint">#{tag}</span>
              ))}
            </div>
          )}

          {section.officialUrl && (
            <div className="bg-surface-2 border border-subtle rounded-lg p-3">
              <a
                href={section.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {isSwahili ? 'Fungua chanzo rasmi cha Kenya Law' : 'Open official Kenya Law source'}
              </a>
            </div>
          )}

          {/* Actions row */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-faint">
            <button type="button" onClick={onClose} className="btn-primary flex-1 sm:flex-none justify-center group text-base">
              {isSwahili ? 'Nimeelewa' : 'Got it'}
            </button>
            <button type="button" className="btn-secondary text-base" onClick={onClose}>
              {isSwahili ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionModal
