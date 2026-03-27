import QuickScenarioCard from './QuickScenarioCard'
import { ShieldAlert, HeartPulse, Home, Briefcase, Baby, Megaphone, Scale, PhoneCall, Building2, ChevronRight, Phone, Gavel, Accessibility, ShieldCheck, Map, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const TOPICS = [
  { id: 'police',     icon: ShieldAlert, title: 'If You Are Stopped by Police', swTitle: 'Ukisimamishwa na Polisi', query: 'police arrest freedom',  color: '#C8102E', chipClass: 'chip-crimson', desc: 'Know your rights during arrest & detention', swDesc: 'Jua haki zako wakati wa kukamatwa na kuwekwa ndani' },
  { id: 'healthcare', icon: HeartPulse,  title: 'Healthcare Rights',             swTitle: 'Haki za Afya',             query: 'healthcare',              color: '#006A4E', chipClass: 'chip-forest',  desc: 'Your right to medical treatment', swDesc: 'Haki yako ya kupata matibabu' },
  { id: 'land',       icon: Home,        title: 'Land & Property Rights',        swTitle: 'Ardhi na Mali',            query: 'land',                    color: '#3b82f6', chipClass: 'chip-blue',    desc: 'Ownership, inheritance, and tenure', swDesc: 'Umiliki, urithi, na umiliki wa ardhi' },
  { id: 'employment', icon: Briefcase,   title: 'Worker Rights',                  swTitle: 'Haki za Wafanyakazi',       query: 'employment',              color: '#D4A017', chipClass: 'chip-gold',    desc: 'Fair wages, leave & working conditions', swDesc: 'Mishahara ya haki, likizo na mazingira ya kazi' },
  { id: 'children',   icon: Baby,        title: 'Children\'s Rights',             swTitle: 'Haki za Watoto',          query: 'children',                color: '#006A4E', chipClass: 'chip-forest',  desc: 'Protection, education & welfare', swDesc: 'Ulinzi, elimu na ustawi' },
  { id: 'expression', icon: Megaphone,   title: 'Freedom of Speech',            swTitle: 'Uhuru wa Kuzungumza',       query: 'expression',              color: '#C8102E', chipClass: 'chip-crimson', desc: 'Speak, protest & access information', swDesc: 'Kuzungumza, kuandamana na kupata habari' },
]

import { useMemo, useState } from 'react'

function QuickCards({ constitution, onTopicClick, isSwahili }) {
  const allSections = useMemo(() => {
    const sections = []
    constitution.chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        sections.push({ 
          ...section, 
          chapterTitle: chapter.title, 
          swChapterTitle: chapter.swTitle || chapter.title,
          chapterId: chapter.id, 
          chapterColor: chapter.color 
        })
      })
    })
    return sections
  }, [constitution])

  const topicMatches = useMemo(() => {
    const matchesMap = {}
    TOPICS.forEach(topic => {
      const keywords = topic.query.toLowerCase().split(' ')
      matchesMap[topic.id] = allSections.filter(section => {
        const titleL = section.title.toLowerCase()
        const simpleL = section.simplified.toLowerCase()
        const tagsL = section.tags.map(t => t.toLowerCase())
        const exL = section.examples ? section.examples.map(e => e.toLowerCase()) : []
        const swTitleL = (section.swTitle || "").toLowerCase()
        const swSimpleL = (section.swSimplified || "").toLowerCase()
        
        return keywords.some(k => 
          titleL.includes(k) ||
          simpleL.includes(k) ||
          swTitleL.includes(k) ||
          swSimpleL.includes(k) ||
          tagsL.some(t => t.includes(k)) ||
          exL.some(e => e.includes(k))
        )
      })
    })
    return matchesMap
  }, [allSections])

  const getTopicMatches = (topicId) => topicMatches[topicId] || []

  const handleDownloadPDF = async () => {
    const element = document.getElementById('emergency-card')
    if (!element) return
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#000000' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('KatiBar_Emergency_Contacts.pdf')
    } catch (e) { console.error('PDF export failed', e) }
  }

  return (
    <section aria-labelledby="cards-heading">
      {/* Intro */}
      <div className="mb-8 animate-fade-up">
        <span className="label text-ink-4 block mb-2">{isSwahili ? 'Rejeleo' : 'Reference'}</span>
        <h2 id="cards-heading" className="headline text-fluid-2xl text-ink-1 font-semibold mb-2">
          {isSwahili ? 'Kadi za Marejeleo ya Haraka' : 'Quick Reference Cards'}
        </h2>
        <p className="text-ink-3 max-w-xl">
          {isSwahili 
            ? 'Ufikiaji wa haraka wa haki zako muhimu za kikatiba kwa hali za kawaida.' 
            : 'One-tap access to your most important constitutional rights for common situations.'}
        </p>
      </div>

      {/* Topic cards — asymmetric bento */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {TOPICS.map((topic, idx) => {
          const matches = getTopicMatches(topic.id)
          const IconComponent = topic.icon
          return (
            <button
              key={topic.id}
              id={`card-${topic.id}`}
              onClick={() => onTopicClick(topic.query)}
              className={`bento-card text-left group animate-fade-up flex flex-col ${idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{
                animationDelay: `${idx * 60}ms`,
                borderLeft: `3px solid ${topic.color}`,
              }}
              aria-label={`${isSwahili ? topic.swTitle : topic.title} — ${matches.length} articles`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${topic.color}18`, color: topic.color }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`${topic.chipClass} mb-1.5 inline-flex`}>
                    {matches.length} {isSwahili ? 'Ibara' : 'article'}{matches.length !== 1 ? (isSwahili ? '' : 's') : ''}
                  </span>
                  <h3 className="headline text-ink-1 text-base font-semibold leading-snug group-hover:text-white transition-colors">
                    {isSwahili ? topic.swTitle : topic.title}
                  </h3>
                </div>
              </div>
              <p className="text-ink-4 text-sm leading-relaxed mb-3 flex-1">{isSwahili ? topic.swDesc : topic.desc}</p>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: topic.color }}>
                <span>{isSwahili ? 'Gusa ili ugundue' : 'Tap to explore'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Info + contacts */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Redesigned Glowing Emergency Contacts Card */}
        <div 
          id="emergency-card"
          className="relative overflow-hidden p-6 rounded-xl group hover:-translate-y-1 transition-transform"
          style={{
            background: 'linear-gradient(135deg, rgba(200,16,46,0.15) 0%, rgba(10,10,10,0.95) 100%)',
            border: '1px solid rgba(200,16,46,0.3)',
            boxShadow: '0 0 40px rgba(200,16,46,0.15), inset 0 0 20px rgba(200,16,46,0.05)'
          }}
        >
          {/* Animated glow background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-crimson rounded-full opacity-20 blur-3xl animate-pulse-glow pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-ink-1 font-semibold text-lg flex items-center gap-2">
                 <PhoneCall className="w-5 h-5 text-crimson animate-pulse" />
                 {isSwahili ? 'Nambari za Dharura' : 'Emergency Contacts'}
              </h4>
              <button 
                onClick={handleDownloadPDF} 
                className="p-1.5 rounded-full bg-surface-3 hover:bg-surface-4 text-ink-3 hover:text-white transition-colors border border-faint" 
                aria-label={isSwahili ? "Pakua kama PDF" : "Download as PDF"} 
                title={isSwahili ? "Hifadhi kama PDF" : "Save as PDF"}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: isSwahili ? 'Afisa wa Polisi' : 'Police Duty Officer', number: '999 / 112', primary: true },
                { label: isSwahili ? 'IPOA (Usimamizi wa Polisi)' : 'IPOA (Police Oversight)',  number: '0800 720 026' },
                { label: isSwahili ? 'Nambari ya Watoto' : 'Child Helpline',     number: '116' },
                { label: isSwahili ? 'KNCHR (Haki za Kibinadamu)' : 'KNCHR (Human Rights)', number: '020 271 3680' },
                { label: isSwahili ? 'EACC (Kupambana na Ufisadi)' : 'EACC (Anti-Corruption)', number: '0800 720 700' },
              ].map(c => (
                <div key={c.label} className="flex justify-between items-center bg-black bg-opacity-40 p-2.5 rounded-lg border border-subtle backdrop-blur-sm">
                  <span className="text-ink-3 text-sm">{c.label}</span>
                  <a 
                    href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                      c.primary 
                        ? 'bg-crimson text-white hover:bg-crimson-bright shadow-[0_0_15px_rgba(200,16,46,0.4)]'
                        : 'bg-surface-3 text-ink-2 hover:bg-surface-4'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="panel-forest p-6 rounded-xl flex flex-col justify-center">
          <div className="flex items-start gap-3">
            <Scale className="w-8 h-8 text-forest-bright flex-shrink-0" strokeWidth={1.5} />
            <div>
              <h4 className="text-ink-1 font-semibold text-base mb-2">{isSwahili ? 'Ilani Muhimu' : 'Important Notice'}</h4>
              <p className="text-ink-3 text-sm leading-relaxed">
                {isSwahili 
                  ? 'Kadi hizi ni kwa madhumuni ya elimu tu na sio badala ya ushauri wa kisheria. Haki za kikatiba zina mahitaji maalum na mapungufu kulingana na sheria zingine. Tafadhali wasiliana na wakili aliyehitimu kwa hali yako maalum ya maisha.' 
                  : 'These cards are for educational purposes only and not a substitute for legal advice. Constitutional rights have specific requirements and limitations based on other laws. Please consult a qualified lawyer for your specific life situation.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gov offices — Redesigned Bento */}
      <div 
        className="relative overflow-hidden p-6 mt-4 rounded-xl shadow-lg border border-subtle backdrop-blur-md"
        style={{
          background: 'linear-gradient(145deg, rgba(80,80,90,0.1) 0%, rgba(10,10,15,0.7) 100%)',
        }}
      >
        <h4 className="text-ink-1 font-semibold text-xl mb-5 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          {isSwahili ? 'Ofisi Kuu za Serikali' : 'Key Government Offices'}
        </h4>
        <div className="grid sm:grid-cols-2 gap-4 relative z-10">
          {[
            { label: 'ODPP',  icon: Gavel,         color: '#D4A017', tint: 'rgba(212,160,23,0.1)', desc: isSwahili ? 'Ofisi ya Mkurugenzi wa Mashtaka ya Umma' : 'Office of Director of Public Prosecutions' },
            { label: 'NCPWD', icon: Accessibility, color: '#006A4E', tint: 'rgba(0,106,78,0.1)',   desc: isSwahili ? 'Baraza la Kitaifa la Watu Wenye Ulemavu' : 'National Council for Persons with Disabilities' },
            { label: 'CAJ',   icon: ShieldCheck,   color: '#C8102E', tint: 'rgba(200,16,46,0.1)',  desc: isSwahili ? 'Tume ya Haki za Utawala (Ombudsman)' : 'Commission on Administrative Justice (Ombudsman)' },
            { label: 'NLC',   icon: Map,           color: '#3b82f6', tint: 'rgba(59,130,246,0.1)', desc: isSwahili ? 'Tume ya Kitaifa ya Ardhi' : 'National Land Commission' },
          ].map(o => {
            const IconComponent = o.icon
            return (
              <div 
                key={o.label} 
                className="flex gap-4 items-start p-4 bg-surface-1 bg-opacity-50 rounded-lg border border-transparent hover:border-subtle hover:bg-surface-2 transition-all duration-300 group hover:-translate-y-0.5"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                  style={{ background: o.tint, color: o.color }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-ink-1 tracking-wide mb-1 flex items-center gap-2">
                    {o.label}
                    <ChevronRight className="w-3 h-3 text-ink-5 group-hover:translate-x-1 group-hover:text-ink-2 transition-transform" />
                  </h5>
                  <p className="text-ink-3 text-sm leading-tight group-hover:text-ink-2 transition-colors">{o.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default QuickCards
