import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Search, Layout, Target, Menu, X, ShieldCheck, GitMerge, Languages, Download } from 'lucide-react'
import './Header.css'

// Redesigned Professional Logo - Modern Abstract Shield + Scales of Justice + K
function KatiBarLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="KatiBar Logo">
      <defs>
        <linearGradient id="shieldBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8102E" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#006A4E" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="kGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8102E" />
          <stop offset="100%" stopColor="#006A4E" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <path d="M50 5 L15 20 V45 C15 70 35 88 50 95 C65 88 85 70 85 45 V20 L50 5 Z" 
            fill="url(#shieldBg)" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="2" />
      
      <g filter="url(#glow)">
        <rect x="38" y="25" width="6" height="50" rx="3" fill="url(#kGradient)" />
        <path d="M44 50 L65 28" stroke="url(#kGradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M43 46 L65 72" stroke="url(#kGradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 40 Q50 60 70 40" stroke="#D4A017" strokeWidth="2" fill="none" opacity="0.8" />
      </g>
    </svg>
  )
}

const NAV_ICONS = {
  '/': BookOpen,
  '/find': Search,
  '/cards': Layout,
  '/map': GitMerge,
  '/quiz': Target,
  '/downloads': Download
}

function Header({ isSwahili, onToggleLanguage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const activeTab = location.pathname

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { id: '/',      label: isSwahili ? 'Gundua' : 'Explore' },
    { id: '/find',  label: isSwahili ? 'Pata Haki' : 'Find Rights' },
    { id: '/cards', label: isSwahili ? 'Kadi za Haraka' : 'Quick Cards' },
    { id: '/map',   label: isSwahili ? 'Ramania' : 'Flow Map' },
    { id: '/quiz',  label: isSwahili ? 'Jaribio' : 'Quiz' },
    { id: '/downloads', label: isSwahili ? 'Nyaraka' : 'Downloads' },
  ]

  return (
    <header
      className={`glass-nav sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-nav' : ''}`}
      role="banner"
    >
      <div className="ds-container">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 cursor-pointer">
            <KatiBarLogo size={36} />
            <div>
              <span className="headline text-ink-1 font-semibold text-lg leading-tight block">KatiBar</span>
              <span 
                className="text-xs leading-none tracking-wider uppercase flex items-center gap-1 mt-0.5"
                style={{ 
                  color: '#3ecfa0',
                  textShadow: '0 0 8px rgba(62, 207, 160, 0.5)',
                  animation: 'pulse-glow 2s infinite ease-in-out'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 3px rgba(62, 207, 160, 0.4))' }} />
                {isSwahili ? 'Jua Haki Zako' : 'Know Your Rights'}
              </span>
            </div>
          </Link>

          {/* Desktop nav tabs */}
          <nav className="hidden md:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
            {navLinks.map(link => {
              const Icon = NAV_ICONS[link.id];
              return (
                <Link
                  key={link.id}
                  to={link.id}
                  className={`tab-pill inline-flex items-center gap-1.5 px-3 ${activeTab === link.id ? 'active' : ''}`}
                  aria-current={activeTab === link.id ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            
            {/* Language Toggle */}
            <button 
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold bg-surface-3 hover:bg-surface-4 text-ink-2 transition-colors border border-faint"
              aria-label="Toggle language between English and Swahili"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              {isSwahili ? 'SW' : 'EN'}
            </button>

            {/* Disclaimer chip */}
            <span className="chip-neutral hidden xl:inline-flex items-center gap-1 border-opacity-30 border-blue-500 text-blue-400 bg-blue-500 bg-opacity-10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {isSwahili ? 'Elimu Tu' : 'Educational Only'}
            </span>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <nav
            className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="divider mb-3" />
            {navLinks.map(link => {
              const Icon = NAV_ICONS[link.id];
              return (
                <Link
                  key={link.id}
                  to={link.id}
                  onClick={() => setMenuOpen(false)}
                  className={`tab-pill w-full inline-flex justify-start rounded-lg ${activeTab === link.id ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
