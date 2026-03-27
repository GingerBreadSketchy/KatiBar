import { useState } from 'react'
import SectionModal from './SectionModal'
import { ShieldCheck, Flag, Map, Scale, Pickaxe, Landmark, Users, ArrowRight, BookOpen, HandHeart, Mountain } from 'lucide-react'

// Using Lucide Icons for Chapter Meta
const CHAPTER_META = {
  green: {
    accent: '#3ecfa0',
    bar:    '#006A4E',
    chip:   'chip-forest',
    panel:  'panel-forest',
    icon: ShieldCheck,
  },
  red: {
    accent: '#f47285',
    bar:    '#C8102E',
    chip:   'chip-crimson',
    panel:  'panel-crimson',
    icon: Flag,
  },
  blue: {
    accent: '#7db8ff',
    bar:    '#3b82f6',
    chip:   'chip-blue',
    panel:  'panel-blue',
    icon: Map,
  },
  black: {
    accent: '#888',
    bar:    '#444',
    chip:   'chip-neutral',
    panel:  '',
    icon: Landmark,
  },
}

// Map chapter ID to specific semantic icon if preferred, falling back to color meta
const SEMANTIC_CHAPTER_ICONS = {
  chapter1: ShieldCheck, // Bill of Rights
  chapter2: Flag,        // Citizenship
  chapter3: Mountain,    // Land and Environment
  chapter4: Scale,       // Governance
  chapter5: Pickaxe,     // Devolution
  chapter6: Landmark,    // Finance
  chapter7: Users,       // Vulnerable
  chapter8: HandHeart,   // Leadership/Ethics
}

function ConstitutionExplorer({ constitution, selectedSection, onSelectSection, isSwahili }) {
  const [expandedChapter, setExpandedChapter] = useState(constitution.chapters[0]?.id || null)

  const toggleChapter = (id) => setExpandedChapter(expandedChapter === id ? null : id)

  const handleSectionClick = (section, chapter) => {
    onSelectSection({
      ...section,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      swChapterTitle: chapter.swTitle,
      chapterColor: chapter.color,
    })
  }

  return (
    <section aria-labelledby="explore-heading">
      {/* Section intro */}
      <div className="mb-10 animate-fade-up md:text-center md:flex md:flex-col md:items-center">
        <span className="label text-ink-4 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-forest-bright" strokeWidth={2.5} />
          {isSwahili ? 'Vinjari' : 'Browse'}
        </span>
        <h2 id="explore-heading" className="headline text-fluid-2xl text-ink-1 font-semibold mb-3">
          {isSwahili ? 'Gundua Katiba' : 'Explore the Constitution'}
        </h2>
        <p className="text-ink-3 max-w-2xl">
          {isSwahili 
            ? 'Gusa sura yoyote ili kuona maelezo yaliyorahisishwa ya haki zako, pamoja na mifano halisi ya Kenya.' 
            : 'Tap any chapter to see simplified explanations of your rights, with real Kenyan examples.'}
        </p>
      </div>

      {/* Chapter count strip — horizontally scrollable on mobile, centered grid on desktop */}
      <div 
        className="flex md:flex-wrap items-start md:justify-center gap-6 mb-12 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scroll-smooth custom-scrollbar" 
        role="list" 
        aria-label="Chapter overview"
      >
        {constitution.chapters.map((chapter) => {
          const meta = CHAPTER_META[chapter.color] || CHAPTER_META.green
          const IconComponent = SEMANTIC_CHAPTER_ICONS[chapter.id] || meta.icon
          const isActive = expandedChapter === chapter.id
          
          return (
            <button
              key={chapter.id}
              role="listitem"
              onClick={() => {
                toggleChapter(chapter.id);
                // Standard scrollIntoView now works perfectly with scroll-mt-24 in CSS
                setTimeout(() => {
                  document.getElementById(`chapter-${chapter.id}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }, 100);
              }}
              className="flex-shrink-0 flex flex-col items-center gap-2 group transition-all duration-300"
              style={{ 
                opacity: isActive || !expandedChapter ? 1 : 0.6,
                transform: isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)'
              }}
              aria-label={`Jump to ${chapter.title}`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg"
                style={{ 
                  background: isActive ? `${meta.bar}33` : `${meta.bar}15`, 
                  border: `1px solid ${isActive ? meta.accent : `${meta.bar}33`}`,
                  color: isActive ? meta.accent : meta.bar,
                  boxShadow: isActive ? `0 0 20px -5px ${meta.bar}` : 'none'
                }}
              >
                <IconComponent className="w-6 h-6 flex-shrink-0 drop-shadow-md" />
              </div>
              <span className={`text-xs text-center leading-tight max-w-[90px] transition-colors ${isActive ? 'text-ink-1 font-bold' : 'text-ink-4 group-hover:text-ink-2'}`}>
                {isSwahili ? (chapter.swTitle || chapter.title) : chapter.title}
              </span>
            </button>
          )
        })}
      </div>

      {/* Accordion chapters — width constrained for better web aesthetics */}
      <div className="space-y-4 md:max-w-4xl md:mx-auto">
        {constitution.chapters.map((chapter, idx) => {
          const meta = CHAPTER_META[chapter.color] || CHAPTER_META.green
          const IconComponent = SEMANTIC_CHAPTER_ICONS[chapter.id] || meta.icon
          const isOpen = expandedChapter === chapter.id

          return (
            <div
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className={`animate-fade-up scroll-mt-24 transition-all duration-500 rounded-xl ${isOpen ? 'bg-surface-2 ring-1 ring-subtle/30 shadow-2xl py-2' : ''}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className={`accordion-header !bg-transparent w-full ${isOpen ? 'hover:!bg-transparent' : ''}`}
                aria-expanded={isOpen}
                aria-controls={`chapter-sections-${chapter.id}`}
              >
                <div className="flex items-center gap-5">
                  {/* Icon bubble */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner"
                    style={{ 
                      background: isOpen ? `linear-gradient(135deg, ${meta.bar}33 0%, transparent 100%)` : `${meta.bar}15`, 
                      border: `1px solid ${isOpen ? meta.bar : `${meta.bar}44`}`,
                      color: isOpen ? meta.accent : meta.bar
                    }}
                  >
                    <IconComponent className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'scale-110' : ''}`} />
                  </div>

                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={meta.chip}>{isSwahili ? (chapter.swNumber || chapter.number) : chapter.number}</span>
                      <span className="text-ink-4 text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-3 border border-faint">
                        {chapter.sections.length} {isSwahili ? 'Ibara' : 'Article'}{chapter.sections.length !== 1 ? (isSwahili ? '' : 's') : ''}
                      </span>
                    </div>
                    <h3 className="headline text-ink-1 text-xl font-semibold leading-tight">
                      {isSwahili ? (chapter.swTitle || chapter.title) : chapter.title}
                    </h3>
                    <p className="text-ink-4 text-sm mt-1">
                      {isSwahili ? (chapter.swDescription || chapter.description) : chapter.description}
                    </p>
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-6 h-6 text-ink-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-ink-2' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sections bento grid */}
              <div 
                className={`grid transition-all duration-500 origin-top overflow-hidden
                  ${isOpen ? 'grid-rows-[1fr] opacity-100 my-4' : 'grid-rows-[0fr] opacity-0'}`
                }
              >
                <div className="min-h-0 mx-2 md:mx-6 md:pl-6 md:border-l-2 border-subtle">
                  <div
                    id={`chapter-sections-${chapter.id}`}
                    className="grid gap-3 sm:grid-cols-2 pt-2 pb-4"
                  >
                    {chapter.sections.map((section, sIdx) => (
                      <article
                        key={sIdx}
                        onClick={() => handleSectionClick(section, chapter)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && handleSectionClick(section, chapter)}
                        className="bento-card group hover:bg-surface-3 transition-colors duration-300"
                        style={{ borderLeft: `3px solid ${meta.bar}` }}
                        aria-label={`${isSwahili ? (section.swArticle || section.article) : section.article} — ${isSwahili ? (section.swTitle || section.title) : section.title}`}
                      >
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                          <span
                            className="article-badge"
                            style={{ color: meta.accent, background: `${meta.bar}22`, boxShadow: `0 0 10px ${meta.bar}15` }}
                          >
                            {isSwahili ? (section.swArticle || section.article) : section.article}
                          </span>
                          <ArrowRight className="w-4 h-4 text-ink-5 group-hover:text-ink-2 group-hover:translate-x-1 transition-all" />
                        </div>

                        <h4 className="headline text-ink-1 text-base font-semibold mb-2 leading-snug group-hover:text-white transition-colors">
                          {isSwahili ? (section.swTitle || section.title) : section.title}
                        </h4>
                        <p className="text-ink-4 text-sm leading-relaxed line-clamp-2 mb-4">
                          {isSwahili ? (section.swSimplified || section.simplified) : section.simplified}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {section.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="tag-pill text-xs px-2 py-0.5 border border-transparent group-hover:border-subtle/50 transition-colors">#{tag}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Detail Modal */}
      {selectedSection && (
        <SectionModal
          section={selectedSection}
          onClose={() => onSelectSection(null)}
          isSwahili={isSwahili}
        />
      )}
    </section>
  )
}

export default ConstitutionExplorer
