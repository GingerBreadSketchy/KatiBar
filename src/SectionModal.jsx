import { useEffect, useRef } from 'react'
import { X, ExternalLink, ShieldAlert, BookOpen, AlertCircle, PhoneCall, ChevronDown } from 'lucide-react'

function SectionModal({ section, onClose, isSwahili }) {
  const panelRef = useRef(null)

  // Trap focus & handle escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const accentMap = {
    green: { color: '#3ecfa0', bar: '#006A4E', chip: 'chip-forest' },
    red:   { color: '#f47285', bar: '#C8102E', chip: 'chip-crimson' },
    blue:  { color: '#7db8ff', bar: '#3b82f6', chip: 'chip-blue'   },
    black: { color: '#888',    bar: '#555',    chip: 'chip-neutral' },
  }
  const accent = accentMap[section.chapterColor] || accentMap.green

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
            <h2 id="modal-title" className="headline text-fluid-2xl text-ink-1 text-2xl md:text-3xl font-semibold leading-tight">
              {isSwahili ? (section.swTitle || section.title) : section.title}
            </h2>
          </div>
          <button
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
          {section.originalText && (
            <details className="group border border-transparent hover:border-faint rounded-xl transition-colors">
              <summary className="flex items-center gap-2 text-ink-4 text-sm hover:text-ink-2 transition-colors cursor-pointer select-none p-2">
                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                <span className="label text-xs">{isSwahili ? 'Angalia maandishi asilia ya kikatiba' : 'View original constitutional text'}</span>
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-subtle ml-3 mb-2">
                <p className="headline text-ink-3 text-sm leading-relaxed italic bg-surface-2 p-3 rounded-lg border border-faint shadow-inner">
                  "{section.originalText}"
                </p>
              </div>
            </details>
          )}

          {/* Simplified — hero block */}
          <div className="panel-forest p-5 rounded-xl border-l-4" style={{ borderLeftColor: '#006A4E' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-forest-bright" />
              <span className="label text-forest-bright">{isSwahili ? 'Hii ina maana gani kwako' : 'What this means for you'}</span>
            </div>
            <p className="text-ink-1 leading-relaxed text-base">
              {isSwahili ? (section.swSimplified || section.simplified) : section.simplified}
            </p>
          </div>

          {/* Real-life examples */}
          {((isSwahili && section.swExamples) || section.examples) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-crimson-bright" />
                <span className="label text-crimson-bright">{isSwahili ? 'Mifano ya maisha halisi' : 'Real-life examples'}</span>
              </div>
              <ul className="space-y-2">
                {(isSwahili ? (section.swExamples || section.examples) : section.examples).map((example, idx) => (
                  <li key={idx} className="flex items-start gap-3 glass-card p-3 border border-transparent hover:border-subtle/50 transition-colors">
                    <span className="mt-0.5 flex-shrink-0 text-forest-bright text-lg leading-none" aria-hidden="true">→</span>
                    <span className="text-ink-2 text-sm leading-relaxed">{example}</span>
                  </li>
                ))}
              </ul>
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

          {/* Actions row */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-faint">
            <button onClick={onClose} className="btn-primary flex-1 sm:flex-none justify-center group text-base">
              {isSwahili ? 'Nimeelewa' : 'Got it'}
            </button>
            <button className="btn-secondary text-base" onClick={onClose}>
              {isSwahili ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionModal
