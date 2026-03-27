import { useState, useEffect } from 'react'
import { ShieldAlert, HeartPulse, Home, Briefcase, Baby, Megaphone, Wallet, Accessibility, Search as SearchIcon, Check, X } from 'lucide-react'
import QuickScenarioCard from './QuickScenarioCard'

const SCENARIOS = [
  { id: 'police',     icon: ShieldAlert,   title: 'Police Stop',     swTitle: 'Kusimamishwa na Polisi', query: 'police arrest freedom',   color: '#C8102E' },
  { id: 'healthcare', icon: HeartPulse,    title: 'Healthcare',      swTitle: 'Huduma za Afya',          query: 'healthcare',               color: '#006A4E' },
  { id: 'land',       icon: Home,          title: 'Land & Housing',  swTitle: 'Ardhi na Makazi',        query: 'land',                     color: '#3b82f6' },
  { id: 'employment', icon: Briefcase,     title: 'Work & Pay',      swTitle: 'Kazi na Malipo',         query: 'employment',               color: '#D4A017' },
  { id: 'children',   icon: Baby,          title: 'Children',        swTitle: 'Haki za Watoto',         query: 'children',                 color: '#006A4E' },
  { id: 'expression', icon: Megaphone,     title: 'Free Speech',     swTitle: 'Uhuru wa Kujieleza',      query: 'expression',               color: '#C8102E' },
  { id: 'property',   icon: Wallet,        title: 'Property',        swTitle: 'Mali na Fedha',          query: 'property money',           color: '#3b82f6' },
  { id: 'disability', icon: Accessibility, title: 'Disability',      swTitle: 'Ulemavu',                query: 'disability',               color: '#D4A017' },
]

function RightsFinder({ constitution, onSectionSelect, isSwahili }) {
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!selected) { setResults([]); return }
    const keywords = selected.query.toLowerCase().split(' ')
    const matches = []
    constitution.chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        const titleL = section.title.toLowerCase()
        const simpleL = section.simplified.toLowerCase()
        const tagsL = section.tags.map(t => t.toLowerCase())
        const exL = section.examples ? section.examples.map(e => e.toLowerCase()) : []
        
        const hit = keywords.some(k => 
          titleL.includes(k) ||
          simpleL.includes(k) ||
          tagsL.some(t => t.includes(k)) ||
          exL.some(e => e.includes(k))
        )
        if (hit) matches.push({ ...section, chapterTitle: chapter.title, chapterId: chapter.id, chapterColor: chapter.color })
      })
    })
    // Deduplicate matches just in case
    const uniqueMatches = Array.from(new Set(matches.map(m => m.article))).map(a => matches.find(m => m.article === a))
    setResults(uniqueMatches)
  }, [selected, constitution])

  const SelectedIcon = selected?.icon || SearchIcon

  return (
    <section aria-labelledby="finder-heading">
      {/* Intro */}
      <div className="mb-8 animate-fade-up">
        <span className="label text-ink-4 block mb-2">{isSwahili ? 'Mwongozo wa Hali' : 'Situational Guide'}</span>
        <h2 id="finder-heading" className="headline text-fluid-2xl text-ink-1 font-semibold mb-2">
          {isSwahili ? 'Pata Haki Zako' : 'Find Your Rights'}
        </h2>
        <p className="text-ink-3 max-w-xl">
          {isSwahili 
            ? 'Chagua hali ya maisha ili uone mara moja ni ulinzi upi wa kikatiba unakuhusu.' 
            : 'Pick a life situation to instantly see which constitutional protections apply to you.'}
        </p>
      </div>

      {/* Scenario grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        role="group"
        aria-label={isSwahili ? "Chagua hali" : "Choose a situation"}
      >
        {SCENARIOS.map((s, idx) => {
          const isActive = selected?.id === s.id
          const IconComponent = s.icon
          const displayTitle = isSwahili ? s.swTitle : s.title
          return (
            <button
              key={s.id}
              id={`scenario-${s.id}`}
              onClick={() => setSelected(isActive ? null : s)}
              className={`
                glass-card p-4 text-center transition-all duration-250 flex flex-col items-center
                hover:scale-[1.03] active:scale-[0.97]
                animate-fade-up
              `}
              style={{
                animationDelay: `${idx * 40}ms`,
                borderColor: isActive ? s.color : undefined,
                borderWidth: isActive ? '1px' : undefined,
                background: isActive ? `${s.color}14` : undefined,
                color: isActive ? s.color : '#888'
              }}
              aria-pressed={isActive}
              aria-label={`Find rights related to ${displayTitle}`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: isActive ? `${s.color}22` : 'rgba(255,255,255,0.04)' }}
              >
                <IconComponent className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium">
                {displayTitle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Results */}
      {selected && (
        <div className="animate-fade-up">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg" style={{ background: `${selected.color}22`, color: selected.color }}>
                <SelectedIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="headline text-ink-1 text-xl font-semibold">
                  {isSwahili ? 'Haki Zako:' : 'Your Rights:'} {isSwahili ? selected.swTitle : selected.title}
                </h3>
                <p className="text-ink-4 text-sm mt-0.5">
                  {results.length} {isSwahili ? 'ulinzi wa kikatiba uliopatikana' : `constitutional protection${results.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="btn-ghost flex items-center gap-1 text-sm bg-surface-3 hover:bg-surface-4 px-3 py-1.5 rounded-full"
              aria-label={isSwahili ? "Ondoa mada" : "Clear selection"}
            >
              {isSwahili ? 'Ondoa' : 'Clear'} <X className="w-4 h-4" />
            </button>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((r, idx) => (
                <QuickScenarioCard
                  key={idx}
                  result={r}
                  isSwahili={isSwahili}
                  onClick={() => onSectionSelect(r, r.chapterId)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center flex flex-col items-center">
              <SearchIcon className="w-12 h-12 text-ink-4 mb-3 opacity-50" strokeWidth={1.5} />
              <p className="text-ink-3">{isSwahili ? 'Hakuna ibara maalum zilizopatikana kwa mada hii.' : 'No specific articles found for this topic.'}</p>
              <p className="text-ink-4 text-sm mt-1">
                {isSwahili 
                  ? 'Jaribu kugundua Katiba moja kwa moja kwenye kichupo cha Gundua.' 
                  : 'Try exploring the Constitution directly in the Explore tab.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Idle state */}
      {!selected && (
        <div className="glass-card p-10 text-center animate-fade-in flex flex-col items-center">
          <SearchIcon className="w-12 h-12 text-ink-4 mb-4 opacity-50" strokeWidth={1.5} />
          <h3 className="headline text-ink-2 text-lg font-medium mb-2">{isSwahili ? 'Chagua Hali Hapo Juu' : 'Pick a Situation Above'}</h3>
          <p className="text-ink-4 text-sm max-w-sm mx-auto">
            {isSwahili 
              ? 'Kila kadi inakuonyesha mara moja ni ibara gani za Katiba ya Kenya zinakulinda katika hali hiyo.' 
              : 'Each card instantly reveals which articles of the Kenyan Constitution protect you in that situation.'}
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-left max-w-md mx-auto">
            {(isSwahili 
              ? ['Maelezo yaliyorahisishwa', 'Mifano halisi ya Kenya', 'Nani wa kuwasiliana naye'] 
              : ['Simplified explanations', 'Real Kenyan examples', 'Who to contact for help']
            ).map(f => (
              <div key={f} className="flex items-start gap-2 text-xs text-ink-4">
                <Check className="w-4 h-4 text-forest-bright mt-0.5 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default RightsFinder
