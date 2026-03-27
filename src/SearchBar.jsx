import { useState, useRef, useEffect } from 'react'

function SearchBar({ onSearch, onClear, placeholder }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleChange = (e) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  const handleClear = () => {
    setValue('')
    onClear()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClear()
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto" role="search">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={value ? '#C8102E' : '#555'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-colors duration-200"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <input
        ref={inputRef}
        id="rights-search"
        type="search"
        className="search-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Search for your rights…'}
        aria-label="Search the constitution"
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-1 transition-colors"
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Keyboard hint */}
      {!value && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1" aria-hidden="true">
          <kbd className="text-ink-4 text-xs px-2 py-0.5 rounded bg-surface-3 border border-subtle font-sans">ESC</kbd>
        </div>
      )}
    </div>
  )
}

export default SearchBar
