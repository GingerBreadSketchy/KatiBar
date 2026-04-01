// QuickScenarioCard — Digital Sovereign aesthetic
import { ChevronRight } from 'lucide-react'

function QuickScenarioCard({ result, onClick, isSwahili }) {
  const accentMap = {
    green: { chip: 'chip-forest', article: '#3ecfa0', bar: '#006A4E' },
    gold:  { chip: 'chip-gold', article: '#facc15', bar: '#a16207' },
    red:   { chip: 'chip-crimson', article: '#f47285', bar: '#C8102E' },
    blue:  { chip: 'chip-blue',   article: '#7db8ff', bar: '#3b82f6' },
    purple:{ chip: 'chip-purple', article: '#c084fc', bar: '#7e22ce' },
    teal:  { chip: 'chip-teal', article: '#2dd4bf', bar: '#0f766e' },
    orange:{ chip: 'chip-orange', article: '#fb923c', bar: '#c2410c' },
    black: { chip: 'chip-neutral', article: '#888',   bar: '#555' },
  }

  const accent = accentMap[result.chapterColor] || accentMap.green

  return (
    <button
      type="button"
      onClick={onClick}
      className="bento-card group cursor-pointer text-left w-full"
      style={{
        '--accent-bar': accent.bar,
        borderLeft: `3px solid ${accent.bar}`,
      }}
      aria-label={`${isSwahili ? (result.swArticle || result.article) : result.article} — ${isSwahili ? (result.swTitle || result.title) : result.title}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <span
          className="article-badge"
          style={{ color: accent.article, background: `${accent.bar}22` }}
        >
          {isSwahili ? (result.swArticle || result.article) : result.article}
        </span>
        <span className={accent.chip}>{isSwahili ? (result.swChapterTitle || result.chapterTitle) : result.chapterTitle}</span>
      </div>

      {/* Title */}
      <h4 className="ui-heading text-ink-1 text-lg font-semibold mb-2 leading-snug group-hover:text-white transition-colors">
        {isSwahili ? (result.swTitle || result.title) : result.title}
      </h4>

      {/* Simplified preview */}
      <p className="text-ink-3 text-sm leading-relaxed line-clamp-3 mb-4">
        {isSwahili ? (result.swSimplified || result.simplified) : result.simplified}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {result.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag-pill">#{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-subtle">
        <span className="text-ink-4 text-xs font-medium">{isSwahili ? 'Gusa ili kusoma zaidi' : 'Tap to read more'}</span>
        <ChevronRight className="w-4 h-4 text-ink-4 group-hover:text-ink-2 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  )
}

export default QuickScenarioCard
