import { FileDown, History, ExternalLink, Globe, BookMarked, Download, CheckCircle2 } from 'lucide-react'

function Downloads({ isSwahili }) {
  const downloadUrl = "https://www.parliament.go.ke/sites/default/files/2017-05/The_Constitution_of_Kenya_2010.pdf"

  return (
    <div className="ds-container py-12 animate-fade-up">
      <header className="mb-12 md:text-center md:max-w-3xl md:mx-auto">
        <div className="flex items-center gap-2 mb-4 md:justify-center">
          <BookMarked className="w-5 h-5 text-blue-400" />
          <span className="label text-blue-400">{isSwahili ? 'Nyaraka' : 'Documents'}</span>
        </div>
        <h1 className="headline text-fluid-3xl text-ink-1 font-semibold mb-4">
          {isSwahili ? 'Maktaba ya Kikatiba' : 'The Constitutional Library'}
        </h1>
        <p className="text-ink-3 text-lg leading-relaxed">
          {isSwahili 
            ? 'Pata nakala rasmi ya Katiba ya Kenya ya 2010 kwa marejeleo zaidi ya kisheria.' 
            : 'Access official copies of the 2010 Kenyan Constitution for in-depth legal reference.'}
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 items-start mb-16">
        {/* Main Download Card */}
        <div className="lg:col-span-3">
          <div className="glass-card relative overflow-hidden group border-blue-500/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Globe className="w-32 h-32 text-blue-400" />
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg glow-shadow-blue">
                  <FileDown className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="headline text-2xl font-bold text-ink-1">
                    {isSwahili ? 'Katiba Kamili (2010)' : 'Full Constitution (2010)'}
                  </h2>
                  <span className="text-xs font-bold text-ink-4 uppercase tracking-widest">PDF • 1.2 MB • Official Gazette</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-ink-3 leading-relaxed">
                  {isSwahili 
                    ? 'Hii ni nakala rasmi ya kisheria ya Katiba ya Kenya, 2010 kama ilivyoandaliwa na Bunge la Kenya. Inajumuisha sura zote 18 na ratiba zote.' 
                    : 'This is the official legal copy of the Constitution of Kenya, 2010 as maintained by the Parliament of Kenya. Includes all 18 Chapters and all Schedules.'}
                </p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: isSwahili ? 'Sura Kamili 18' : 'Complete 18 Chapters' },
                    { label: isSwahili ? 'Nambari ya Gazeti' : 'Gazette Numbered' },
                    { label: isSwahili ? 'Muundo wa Kidijitali' : 'Digital Searchable' },
                    { label: isSwahili ? 'Marejeleo Rasmi' : 'Authentic Reference' },
                  ].map(feat => (
                    <li key={feat.label} className="flex items-center gap-2 text-sm text-ink-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-bright" /> {feat.label}
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href={downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 shadow-xl transition-all hover:scale-[1.02]"
                style={{ boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)' }}
              >
                <Download className="w-5 h-5" />
                {isSwahili ? 'Pakua Sasa (PDF)' : 'Download Now (PDF)'}
              </a>
            </div>
          </div>
        </div>

        {/* The Birth of the Constitution (History) */}
        <div className="lg:col-span-2">
          <div className="panel-forest p-8 h-full flex flex-col justify-between border-forest/30 bg-forest/5 backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-forest/20 flex items-center justify-center text-forest-bright shadow-inner">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="headline text-xl font-bold text-ink-1">
                  {isSwahili ? 'Kuzaliwa kwa Katiba' : 'Birth of the Constitution'}
                </h3>
              </div>

              <div className="space-y-4 text-sm text-ink-2 leading-relaxed">
                <p>
                  {isSwahili 
                    ? 'Katiba ya sasa ilizaliwa kutokana na harakati za muda mrefu za mageuzi ambazo zilifikia kilele baada ya mgogoro wa uchaguzi wa 2007/2008.' 
                    : 'The current Constitution was born from a long struggle for reform that peaked after the 2007/2008 electoral crisis.'}
                </p>
                <p>
                  {isSwahili 
                    ? 'Ilitiwa saini tarehe 27 Agosti, 2010 katika Hifadhi ya Uhuru (Uhuru Park), Nairobi, baada ya kupitishwa na 67% ya Wakenya katika kura ya maoni.' 
                    : 'It was promulgated on August 27, 2010 at Uhuru Park, Nairobi, after being approved by 67% of Kenyans in a historic referendum.'}
                </p>
                <div className="divider opacity-20 my-4" />
                <div className="flex flex-col gap-3">
                  <a href="https://www.klrc.go.ke/index.php/constitution-of-kenya" target="_blank" className="flex items-center justify-between group text-forest-bright font-semibold hover:text-white transition-colors">
                    <span>{isSwahili ? 'Tume ya Kurekebisha Sheria' : 'Law Reform Commission'}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://www.judiciary.go.ke/about-the-judiciary/" target="_blank" className="flex items-center justify-between group text-forest-bright font-semibold hover:text-white transition-colors">
                    <span>{isSwahili ? 'Historia ya Idara ya Mahakama' : 'Judiciary History'}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 italic text-xs text-ink-4">
              "Uwezo kuu wa taifa upo kwa wananchi." — Ibara ya 1
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources Section */}
      <section className="mt-20">
        <h4 className="headline text-2xl font-bold text-ink-1 mb-8 md:text-center">
           {isSwahili ? 'Rasilimali Zaidi za Kisheria' : 'Additional Legal Resources'}
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: isSwahili ? 'Bunge la Kenya' : 'Kenya Parliament', link: 'http://www.parliament.go.ke/', desc: isSwahili ? 'Sheria na mijadala ya serikali' : 'Official home of laws and debates' },
            { title: isSwahili ? 'Kenya Law' : 'Kenya Law Reports', link: 'http://kenyalaw.org/kl/', desc: isSwahili ? 'Kumbukumbu kamili za sheria' : 'Database of legal cases and gazettes' },
            { title: isSwahili ? 'Gazeti la Kenya' : 'National Gazette', link: 'http://www.kenyalaw.org/kenyagazette/', desc: isSwahili ? 'Matangazo rasmi ya serikali' : 'Official government announcements' },
          ].map(res => (
            <a 
              key={res.title} 
              href={res.link} 
              target="_blank" 
              className="glass-card p-6 border-transparent hover:border-blue-500/30 transition-all hover:-translate-y-1 block group"
            >
              <h5 className="font-bold text-ink-1 mb-2 group-hover:text-blue-400 transition-colors">{res.title}</h5>
              <p className="text-ink-4 text-sm">{res.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Downloads
