import { useState, useEffect, useCallback, useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Target } from 'lucide-react'
import constitutionData from './data/constitution.json'
import Header from './Header'
import SearchBar from './SearchBar'
import ConstitutionExplorer from './ConstitutionExplorer'
import RightsFinder from './RightsFinder'
import QuickCards from './QuickCards'
import Quiz from './Quiz'
import RightsMap from './RightsMap'
import SectionModal from './SectionModal'
import Downloads from './Downloads'
import './App.css'
import './index.css'

// ── Stats derived from JSON ───────────────────────────────────────────────────
function computeStats(constitution) {
  const chapters = constitution.chapters.length
  const articles = constitution.chapters.reduce((a, c) => a + c.sections.length, 0)
  const tags = new Set()
  constitution.chapters.forEach(c => c.sections.forEach(s => s.tags.forEach(t => tags.add(t))))
  return { chapters, articles, topics: tags.size }
}

// ── Search logic ──────────────────────────────────────────────────────────────
function searchConstitution(constitution, query) {
  const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 1)
  if (keywords.length === 0) return []
  
  const results = []
  constitution.chapters.forEach(chapter => {
    chapter.sections.forEach(section => {
      const titleL = section.title.toLowerCase()
      const swTitleL = (section.swTitle || "").toLowerCase()
      const articleL = section.article.toLowerCase()
      const swArticleL = (section.swArticle || "").toLowerCase()
      const simpleL = section.simplified.toLowerCase()
      const swSimpleL = (section.swSimplified || "").toLowerCase()
      const tagsL = section.tags.join(' ').toLowerCase()
      
      const isMatch = keywords.some(k => 
        titleL.includes(k) ||
        swTitleL.includes(k) ||
        articleL.includes(k) ||
        swArticleL.includes(k) ||
        simpleL.includes(k) ||
        swSimpleL.includes(k) ||
        tagsL.includes(k)
      )

      if (isMatch) results.push({ 
        ...section, 
        chapterTitle: chapter.title, 
        swChapterTitle: chapter.swTitle || chapter.title,
        chapterId: chapter.id, 
        chapterColor: chapter.color 
      })
    })
  })
  return results
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function Hero({ stats, onTabChange, isSwahili }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      aria-label={isSwahili ? "Karibu KatiBar" : "Welcome to KatiBar"}
    >
      {/* Ambient glows */}
      <div className="hero-glow-crimson absolute -top-20 -right-20 opacity-60" aria-hidden="true" />
      <div className="hero-glow-forest absolute -bottom-20 -left-20 opacity-50" aria-hidden="true" />

      <div className="ds-container relative z-10 md:flex md:flex-col md:items-center md:text-center">
        {/* Eyebrow */}
        <div className={`flex items-center gap-2 mb-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson animate-pulse-glow" aria-hidden="true" style={{ background: '#C8102E' }} />
            <span className="w-2 h-2 rounded-full" aria-hidden="true" style={{ background: '#000', border: '1px solid #333' }} />
            <span className="w-2 h-2 rounded-full" aria-hidden="true" style={{ background: '#006A4E' }} />
          </div>
          <span className="label text-ink-4">{isSwahili ? 'Kenya • Katiba ya 2010' : 'Kenya • 2010 Constitution'}</span>
        </div>

        {/* Main headline */}
        <h1
          className={`headline font-semibold text-fluid-4xl md:text-6xl lg:text-7xl leading-none mb-6 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="text-ink-1">{isSwahili ? 'Haki Zako.' : 'Your Rights.'}</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #ff4060 50%, #006A4E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isSwahili ? 'Zimerahisishwa.' : 'Simplified.'}
          </span>
        </h1>

        {/* Sub-tagline — editorial */}
        <p
          className={`text-ink-3 text-fluid-lg max-w-xl mb-8 leading-relaxed transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {isSwahili
            ? 'Kila Mkenya anastahili kuelewa kile Katiba inawapa — kutoka Turkana hadi Mombasa, kutoka Kibera hadi Karen.'
            : 'Every Kenyan deserves to understand what the Constitution guarantees them — from Turkana to Mombasa, from Kibera to Karen.'}
        </p>

        {/* CTA row */}
        <div
          className={`flex flex-wrap md:justify-center gap-3 mb-10 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <button 
            id="hero-explore-btn" 
            onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })} 
            className="btn-primary"
          >
            {isSwahili ? 'Gundua Haki Zako' : 'Explore Your Rights'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button id="hero-quiz-btn" onClick={() => onTabChange('quiz')} className="btn-secondary">
            <Target className="w-4 h-4" /> {isSwahili ? 'Fanya Jaribio' : 'Take the Quiz'}
          </button>
        </div>

        {/* Stats triptych */}
        <div
          className={`grid grid-cols-3 gap-3 max-w-md transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          aria-label="Content statistics"
        >
          {[
            { value: stats.articles, label: isSwahili ? 'Ibara' : 'Articles',  color: '#C8102E' },
            { value: stats.chapters, label: isSwahili ? 'Sura' : 'Chapters',   color: '#006A4E' },
            { value: stats.topics,   label: isSwahili ? 'mada' : 'Topics',     color: '#D4A017' },
          ].map(stat => (
            <div
              key={stat.label}
              className="glass-card p-4 text-center"
              style={{ borderTop: `3px solid ${stat.color}` }}
            >
              <div className="headline text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}+
              </div>
              <div className="text-ink-4 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Search Results Panel ──────────────────────────────────────────────────────
function SearchResults({ results, query, onSelect, onClear, isSwahili }) {
  return (
    <div className="ds-container pb-8 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="headline text-ink-1 text-xl font-semibold">
            {results.length} {isSwahili ? 'matokeo ya' : 'results for'} "{query}"
          </h2>
          <p className="text-ink-4 text-sm mt-0.5">{isSwahili ? 'Inalingana katika sura zote' : 'Matching articles across all chapters'}</p>
        </div>
        <button onClick={onClear} className="btn-ghost text-sm">
          {isSwahili ? 'Ondoa' : 'Clear'} ✕
        </button>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r, idx) => (
            <article
              key={idx}
              onClick={() => onSelect(r)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(r)}
              className="bento-card group cursor-pointer"
              aria-label={`${isSwahili ? (r.swArticle || r.article) : r.article} — ${isSwahili ? (r.swTitle || r.title) : r.title}`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <span className="chip-forest">{isSwahili ? (r.swArticle || r.article) : r.article}</span>
                <span className="chip-neutral text-xs">{isSwahili ? (r.swChapterTitle || r.chapterTitle) : r.chapterTitle}</span>
              </div>
              <h3 className="headline text-ink-1 text-base font-semibold mb-2 group-hover:text-white transition-colors">
                {isSwahili ? (r.swTitle || r.title) : r.title}
              </h3>
              <p className="text-ink-4 text-sm leading-relaxed line-clamp-2">
                {isSwahili ? (r.swSimplified || r.simplified) : r.simplified}
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {r.tags.slice(0, 3).map(t => <span key={t} className="tag-pill">#{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-ink-3">{isSwahili ? `Hakuna matokeo yaliyopatikana kwa "${query}"` : `No results found for "${query}"`}</p>
          <p className="text-ink-4 text-sm mt-1">{isSwahili ? 'Jaribu: ardhi, afya, polisi, elimu, watoto' : 'Try: land, healthcare, police, education, children'}</p>
        </div>
      )}
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────
function App() {
  const [constitution] = useState(constitutionData)
  const [isSwahili, setIsSwahili] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const isExploreTab = location.pathname === '/'

  const stats = useMemo(() => computeStats(constitution), [constitution])

  // Search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsSearching(true)
      setSearchResults(searchConstitution(constitution, query))
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }, [constitution])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }, [])

  const handleSectionSelect = useCallback((section) => {
    setSelectedSection(section)
  }, [])

  const handleCardClick = useCallback((section) => {
    setSelectedSection(section)
    setIsSearching(false)
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const handleToggleLang = () => setIsSwahili(!isSwahili)

  return (
    <div className="bg-amoled min-h-screen text-ink-1">
      {/* Navigation */}
      <Header isSwahili={isSwahili} onToggleLanguage={handleToggleLang} />

      {/* ── Hero ─────────────────────────────────────── */}
      {isExploreTab && !isSearching && (
        <Hero stats={stats} onTabChange={(path) => navigate(path === 'explore' ? '/' : `/${path}`)} isSwahili={isSwahili} />
      )}

      {/* ── Search bar ──────────────────────────────── */}
      <div
        className={`ds-container ${isExploreTab && !isSearching ? 'pb-8' : 'py-8'}`}
        role="search"
      >
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder={isSwahili ? "Tafuta haki zako... (mfano 'ardhi', 'afya', 'polisi')" : "Search your rights… (e.g. 'land', 'healthcare', 'police', 'water')"}
        />
      </div>

      <div className="glow-line-crimson ds-container" aria-hidden="true" />

      {/* ── Search Results (overlay mode) ───────────── */}
      {isSearching && (
        <SearchResults
          results={searchResults}
          query={searchQuery}
          onSelect={handleSectionSelect}
          onClear={handleClearSearch}
          isSwahili={isSwahili}
        />
      )}

      {/* ── Tab content ─────────────────────────────── */}
      {!isSearching && (
        <main className="ds-container pb-20" id="main-content">
          <Routes>
            <Route path="/" element={
              <ConstitutionExplorer
                constitution={constitution}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
                isSwahili={isSwahili}
              />
            } />
            <Route path="/find" element={
              <RightsFinder
                constitution={constitution}
                onSectionSelect={handleCardClick}
                isSwahili={isSwahili}
              />
            } />
            <Route path="/cards" element={
              <QuickCards
                constitution={constitution}
                onTopicClick={handleSearch}
                isSwahili={isSwahili}
              />
            } />
            <Route path="/map" element={<RightsMap isSwahili={isSwahili} />} />
            <Route path="/quiz" element={<Quiz constitution={constitution} isSwahili={isSwahili} />} />
            <Route path="/downloads" element={<Downloads isSwahili={isSwahili} />} />
          </Routes>
        </main>
      )}

      {/* ── Global selected section modal ─────────────
           (used by search results & QuickCards & RightsFinder)
      ────────────────────────────────────────────── */}
      {selectedSection && (
        <SectionModal
          section={selectedSection}
          onClose={() => setSelectedSection(null)}
          isSwahili={isSwahili}
        />
      )}

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-subtle py-10 mt-10">
        <div className="ds-container">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
            
            {/* Left side: Brand */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
              <span className="headline text-forest-bright text-2xl font-bold tracking-tight" style={{ textShadow: '0 0 15px rgba(0, 106, 78, 0.8)' }}>
                KatiBar
              </span>
              <span className="text-ink-4 text-xs tracking-widest font-medium uppercase mt-1">Digital Sovereign</span>
            </div>

            {/* Center side: Support Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 flex-1">
              <a 
                href="https://gingerpay.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary group !bg-[#006A4E] flex items-center gap-2.5 px-6 py-2.5 font-bold transition-all hover:scale-105 active:scale-95"
                style={{ 
                  boxShadow: '0 0 15px rgba(0, 106, 78, 0.4)',
                  animation: 'pulse-glow-bg 2.5s infinite ease-in-out'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:scale-110 transition-transform">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                {isSwahili ? 'Changia kwa M-Pesa' : 'Donate via M-Pesa'}
              </a>

              <a 
                href="mailto:gingersketchy@gmail.com" 
                className="btn-secondary flex items-center gap-2.5 px-6 py-2.5 font-bold border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 transition-all hover:scale-105 active:scale-95"
                style={{ 
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
                  textShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10z" />
                  <polyline points="22,7 12,14 2,7" />
                </svg>
                {isSwahili ? 'Wasiliana na Dev' : 'Contact Dev'}
              </a>
            </div>

            {/* Right side: Credits and Warning */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right gap-3">
              <p className="text-xs font-semibold animate-pulse text-crimson-bright tracking-wide mb-1" style={{ textShadow: '0 0 10px rgba(200,16,46,0.6)' }}>
                {isSwahili ? 'Kwa madhumuni ya elimu tu • Sio ushauri wa kisheria' : 'Educational purposes only • Not legal advice'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium text-ink-3">
                <span>© {new Date().getFullYear()}</span>
                <span className="text-ink-5 mx-1 text-xs">•</span>
                <span>{isSwahili ? 'Imeundwa na' : 'Created by'}</span>
                <span className="text-blue-400 font-bold mx-0.5" style={{ textShadow: '0 0 10px rgba(59,130,246,0.4)' }}>Gingersketchy</span>
                <span>{isSwahili ? 'kwa Wakenya' : 'for Kenyans'}</span>
                <svg className="w-4 h-4 ml-1 text-crimson-bright animate-pulse" style={{ filter: 'drop-shadow(0 0 8px #C8102E)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
