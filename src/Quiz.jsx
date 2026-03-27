import { useState } from 'react'
import { CheckCircle2, XCircle, Trophy, Star, BookOpen, Sprout, ArrowRight, PlayCircle, RotateCcw } from 'lucide-react'

// All quiz questions
const QUESTIONS = [
  {
    id: 1,
    scenario: "You're walking home at night and police stop you, demanding to search your phone without showing a warrant.",
    swScenario: "Unatembea kuelekea nyumbani usiku na polisi wanakusimamisha, wakidai kupekua simu yako bila kuonyesha kibali.",
    question: "Which constitutional right protects you in this situation?",
    swQuestion: "Ni haki gani ya kikatiba inayokulinda katika hali hii?",
    options: [
      "Article 27 — Equality and Freedom from Discrimination",
      "Article 28 — Human Dignity",
      "Article 31 — Privacy",
      "Article 33 — Freedom of Expression",
    ],
    swOptions: [
      "Ibara ya 27 — Usawa na Uhuru dhidi ya Ubaguzi",
      "Ibara ya 28 — Utu wa Binadamu",
      "Ibara ya 31 — Faragha",
      "Ibara ya 33 — Uhuru wa Kujieleza",
    ],
    correct: 2,
    explanation: "Article 31 protects your right to privacy — police cannot search your phone, home, or communications without a warrant issued by a court. You may politely decline and ask them to produce a warrant.",
    swExplanation: "Ibara ya 31 inalinda haki yako ya faragha — polisi hawawezi kupekua simu yako, nyumba, au mawasiliano bila kibali kilichotolewa na mahakama. Unaweza kukataa kwa adabu na kuwaomba watoe kibali.",
    actionSteps: [
      "Politely refuse and ask for a warrant",
      "Ask the officer's name and badge number",
      "Report unlawful searches to IPOA: 0800 720 026",
    ],
    swActionSteps: [
      "Kataa kwa adabu na uombe kibali",
      "Uliza jina la afisa na nambari ya kitambulisho chake",
      "Ripoti upekuzi haramu kwa IPOA: 0800 720 026",
    ],
    relatedArticles: ["Article 28", "Article 49", "Article 50"],
  },
  {
    id: 2,
    scenario: "Your employer hasn't paid you for three months, despite you completing all your tasks.",
    swScenario: "Mwajiri wako hajakulipa kwa miezi mitatu, licha ya wewe kukamilisha kazi zako zote.",
    question: "Which constitutional right addresses your situation?",
    swQuestion: "Ni haki gani ya kikatiba inayozungumzia hali yako?",
    options: [
      "Article 41 — Labor Relations",
      "Article 43 — Economic and Social Rights",
      "Article 27 — Equality and Freedom from Discrimination",
      "Article 35 — Freedom of Movement",
    ],
    swOptions: [
      "Ibara ya 41 — Uhusiano wa Kazi",
      "Ibara ya 43 — Haki za Kiuchumi na Kijamii",
      "Ibara ya 27 — Usawa na Uhuru dhidi ya Ubaguzi",
      "Ibara ya 35 — Uhuru wa Kutembea",
    ],
    correct: 0,
    explanation: "Article 41 specifically guarantees labor rights — the right to fair remuneration, reasonable working conditions, and to form trade unions. Unpaid wages are a direct violation of this article.",
    swExplanation: "Ibara ya 41 inahakikisha haki za kazi — haki ya malipo ya haki, mazingira bora ya kazi, na kuanzisha vyama vya wafanyakazi. Mishahara isiyolipwa ni ukiukaji wa moja kwa moja wa ibara hii.",
    actionSteps: [
      "Document all work done and payments owed in writing",
      "Attempt internal resolution with your employer first",
      "File a complaint at the nearest Labour Office",
      "Pursue legal action through the Employment and Labour Relations Court",
    ],
    swActionSteps: [
      "Andika kazi zote zilizofanywa na malipo unayodai kwa maandishi",
      "Jaribu kusuluhisha ndani na mwajiri wako kwanza",
      "Wasilisha malalamiko katika Ofisi ya Kazi iliyo karibu nawe",
      "Chukua hatua za kisheria kupitia Mahakama ya Uhusiano wa Kazi na Ajira",
    ],
    relatedArticles: ["Article 43", "Article 46"],
  },
  {
    id: 3,
    scenario: "A developer plans to build on your community playground, but no public meeting was held.",
    swScenario: "Mendelezaji anapanga kujenga kwenye uwanja wa michezo wa jamii yako, lakini hakuna mkutano wa umma uliofanyika.",
    question: "Which constitutional principle requires community consultation?",
    swQuestion: "Ni kanuni gani ya kikatiba inayohitaji mashauriano na jamii?",
    options: [
      "Article 69 — Environment",
      "Article 10 — National Values and Principles of Governance",
      "Article 40 — Protection of Right to Property",
      "Article 60 — Principles of Land Policy",
    ],
    swOptions: [
      "Ibara ya 69 — Mazingira",
      "Ibara ya 10 — Maadili ya Kitaifa na Kanuni za Utawala",
      "Ibara ya 40 — Ulinzi wa Haki ya Mali",
      "Ibara ya 60 — Kanuni za Sera ya Ardhi",
    ],
    correct: 3,
    explanation: "Article 60 establishes that land must be managed through consultation, with transparent administration. Any development affecting community land must involve public participation — this is a constitutional requirement.",
    swExplanation: "Ibara ya 60 inaeleza kuwa ardhi lazima isimamiwe kupitia mashauriano, kwa utawala wa wazi. Maendeleo yoyote yanayoathiri ardhi ya jamii lazima yahusishe ushiriki wa umma — hili ni takwa la kikatiba.",
    actionSteps: [
      "Attend all public participation meetings",
      "Petition your County Assembly representative in writing",
      "Challenge the development in court if proper procedures weren't followed",
    ],
    swActionSteps: [
      "Hudhuria mikutano yote ya ushiriki wa umma",
      "Wasilisha ombi kwa mwakilishi wako wa Bunge la Kaunti kwa maandishi",
      "Pingapinga maendeleo hayo mahakamani ikiwa taratibu sahihi hazikufuatwa",
    ],
    relatedArticles: ["Article 61", "Article 62", "Article 66"],
  },
  {
    id: 4,
    scenario: "You want to organize a peaceful march to protest poor road conditions in your neighborhood.",
    swScenario: "Unataka kuandaa maandamano ya amani kupinga hali mbaya ya barabara katika mtaa wako.",
    question: "What must you do before the protest?",
    swQuestion: "Ni lazima ufanye nini kabla ya maandamano?",
    options: [
      "Get written permission from the police",
      "Notify the police 3–7 days in advance",
      "Get approval from the County Governor",
      "Nothing — protests need no notice at all",
    ],
    swOptions: [
      "Pata kibali cha maandishi kutoka kwa polisi",
      "Wajulishe polisi siku 3–7 kabla",
      "Pata idhini kutoka kwa Gavana wa Kaunti",
      "Hakuna — maandamano hayahitaji taarifa yoyote",
    ],
    correct: 1,
    explanation: "Article 37 guarantees your right to peaceful assembly and demonstration. You do NOT need police permission — but you must notify them 3–7 days before so they can make safety arrangements. They cannot stop a lawful peaceful protest.",
    swExplanation: "Ibara ya 37 inahakikisha haki yako ya kukusanyika kwa amani na kuandamana. HUHITAJI kibali cha polisi — lakini lazima uwajulishe siku 3-7 kabla ili waweze kufanya mipango ya usalama. Hawawezi kuzuia maandamano ya amani ya kisheria.",
    actionSteps: [
      "Write a notice letter to your local police station",
      "Include date, time, location, expected attendance, and purpose",
      "Keep a copy of your notice letter",
      "Ensure the protest remains peaceful and unarmed",
    ],
    swActionSteps: [
      "Andika barua ya taarifa kwa kituo chako cha polisi cha mtaa",
      "Jumuisha tarehe, wakati, eneo, mahudhurio yanayotarajiwa, na kusudi",
      "Weka nakala ya barua yako ya taarifa",
      "Hakikisha maandamano yanabaki ya amani na bila silaha",
    ],
    relatedArticles: ["Article 33", "Article 36"],
  },
  {
    id: 5,
    scenario: "You're denied treatment at a public hospital because you cannot pay the upfront fee.",
    swScenario: "Umekataliwa kupata matibabu katika hospitali ya umma kwa sababu huwezi kulipa ada ya awali.",
    question: "Which right is being violated?",
    swQuestion: "Ni haki gani inayokiukwa?",
    options: [
      "Article 26 — Right to Life",
      "Article 43 — Economic and Social Rights",
      "Article 30 — Freedom from Slavery",
      "Article 32 — Freedom from Inhumane Treatment",
    ],
    swOptions: [
      "Ibara ya 26 — Haki ya Kuishi",
      "Ibara ya 43 — Haki za Kiuchumi na Kijamii",
      "Ibara ya 30 — Uhuru dhidi ya Utumwa",
      "Ibara ya 32 — Uhuru dhidi ya Matibabu ya Kinyama",
    ],
    correct: 1,
    explanation: "Article 43 guarantees the right to the highest attainable standard of health. Public hospitals must provide emergency treatment regardless of ability to pay upfront. Refusing emergency care is a constitutional violation.",
    swExplanation: "Ibara ya 43 inahakikisha haki ya kiwango cha juu zaidi cha afya kinachoweza kupatikana. Hospitali za umma lazima zitoe matibabu ya dharura bila kujali uwezo wa kulipa mapema. Kukataa huduma ya dharura ni ukiukaji wa kikatiba.",
    actionSteps: [
      "Ask to see the hospital administrator or patient rights officer immediately",
      "Request a fee waiver or payment plan arrangement",
      "Report the incident to the County Health Office",
      "Contact health rights organizations like KNCHR: 020 271 3680",
    ],
    swActionSteps: [
      "Omba kumuona msimamizi wa hospitali au afisa wa haki za wagonjwa mara moja",
      "Omba msamaha wa ada au mpango wa malipo",
      "Ripoti tukio hilo kwa Ofisi ya Afya ya Kaunti",
      "Wasiliana na mashirika ya haki za afya kama KNCHR: 020 271 3680",
    ],
    relatedArticles: ["Article 26", "Article 27"],
  },
  {
    id: 6,
    scenario: "Your landlord wants to evict you immediately without any notice or court order.",
    swScenario: "Mwenye nyumba wako anataka kukufukuza mara moja bila taarifa yoyote au amri ya mahakama.",
    question: "What protects you from sudden, unlawful eviction?",
    swQuestion: "Ni nini kinakulinda dhidi ya kufukuzwa kwa ghafla na haramu?",
    options: [
      "Article 40 — Protection of Right to Property",
      "Article 60 — Principles of Land Policy",
      "Article 47 — Fair Administrative Action",
      "Both Article 40 and Article 47",
    ],
    swOptions: [
      "Ibara ya 40 — Ulinzi wa Haki ya Mali",
      "Ibara ya 60 — Kanuni za Sera ya Ardhi",
      "Ibara ya 47 — Hatua ya Haki ya Utawala",
      "Zote Ibara ya 40 na Ibara ya 47",
    ],
    correct: 3,
    explanation: "Article 40 protects your property rights (including tenancy), and Article 47 guarantees fair administrative action — meaning you must receive proper notice and a chance to respond. Landlords need a court order to evict you lawfully.",
    swExplanation: "Ibara ya 40 inalinda haki zako za mali (pamoja na upangaji), na Ibara ya 47 inahakikisha hatua ya haki ya utawala — ikimaanisha lazima upate taarifa sahihi na nafasi ya kujibu. Wenye nyumba wanahitaji amri ya mahakama ili kukufukuza kisheria.",
    actionSteps: [
      "Do not vacate without a formal court order",
      "Document all communication with your landlord",
      "Seek help from legal aid organizations or the Rent Tribunal",
    ],
    swActionSteps: [
      "Usiondoke bila amri rasmi ya mahakama",
      "Andika mawasiliano yote na mwenye nyumba wako",
      "Tafuta msaada kutoka kwa mashirika ya msaada wa kisheria au Mahakama ya Kodi ya Nyumba",
    ],
    relatedArticles: ["Article 28", "Article 50"],
  },
  {
    id: 7,
    scenario: "A school refuses to enroll a child with a physical disability, claiming they lack facilities.",
    swScenario: "Shule inakataa kuandikisha mtoto mwenye ulemavu wa mwili, ikidai kuwa haina vifaa.",
    question: "Which article is the most directly applicable?",
    swQuestion: "Ni ibara gani inayohusika moja kwa moja?",
    options: [
      "Article 43 — Economic and Social Rights (right to education)",
      "Article 54 — Rights of Persons with Disabilities",
      "Article 53 — Children's Rights",
      "All of the above equally apply",
    ],
    swOptions: [
      "Ibara ya 43 — Haki za Kiuchumi na Kijamii (haki ya elimu)",
      "Ibara ya 54 — Haki za Watu Wenye Ulemavu",
      "Ibara ya 53 — Haki za Watoto",
      "Zote hapo juu zinatumika sawasawa",
    ],
    correct: 3,
    explanation: "Articles 53 (children's right to education), 54 (rights of PWDs to access education and reasonable accommodation), and 43 (right to education) all apply. Schools have a constitutional duty to accommodate children with disabilities.",
    swExplanation: "Ibara za 53 (haki ya watoto ya elimu), 54 (haki za watu wenye ulemavu kupata elimu na makazi yanayofaa), na 43 (haki ya elimu) zote zinatumika. Shule zina wajibu wa kikatiba kuwahudumia watoto wenye ulemavu.",
    actionSteps: [
      "Document the refusal in writing (letter or email)",
      "Report to NCPWD and the County Education Office",
      "File a complaint with KNCHR for the disability discrimination",
    ],
    swActionSteps: [
      "Andika kukataliwa huko kwa maandishi (barua au barua pepe)",
      "Ripoti kwa NCPWD na Ofisi ya Elimu ya Kaunti",
      "Wasilisha malalamiko kwa KNCHR kwa ubaguzi wa walemavu",
    ],
    relatedArticles: ["Article 27", "Article 28"],
  },
]

const BADGES = [
  { threshold: 7, Icon: Trophy, label: 'Constitution Master', swLabel: 'Bingwa wa Katiba', desc: 'Perfect score — you truly know your rights!', swDesc: 'Alama kamilifu — hakika unajua haki zako!' },
  { threshold: 5, Icon: Star, label: 'Rights Champion', swLabel: 'Shujaa wa Haki', desc: 'Impressive knowledge of Kenyan constitutional law.', swDesc: 'Maarifa ya kuvutia ya sheria ya kikatiba ya Kenya.' },
  { threshold: 3, Icon: BookOpen, label: 'Citizen Scholar', swLabel: 'Msomi Raia', desc: 'Good foundation — keep learning!', swDesc: 'Msingi mzuri — endelea kujifunza!' },
  { threshold: 0, Icon: Sprout, label: 'Rights Learner', swLabel: 'Mwanafunzi wa Haki', desc: 'Every journey starts here. Review the explanations and try again.', swDesc: 'Kila safari huanzia hapa. Pitia maelezo na ujaribu tena.' },
]

function Quiz({ constitution, isSwahili }) {
  const [step, setStep] = useState(0)          // current question index
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState([])   // { index, correct }

  const q = QUESTIONS[step]
  const progress = ((step + (showFeedback ? 1 : 0)) / QUESTIONS.length) * 100

  const pick = (idx) => {
    if (showFeedback) return
    const isCorrect = idx === q.correct
    setSelected(idx)
    setShowFeedback(true)
    if (isCorrect) setScore(s => s + 1)
    setHistory(h => [...h, { questionId: q.id, selectedIdx: idx, correct: isCorrect }])
  }

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
      setSelected(null)
      setShowFeedback(false)
    } else {
      setDone(true)
    }
  }

  const restart = () => {
    setStep(0); setSelected(null); setShowFeedback(false)
    setScore(0); setDone(false); setHistory([])
  }

  const badge = BADGES.find(b => score >= b.threshold) || BADGES[3]
  const BadgeIcon = badge.Icon

  // ── Completed Screen ──────────────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score / QUESTIONS.length) * 100)
    return (
      <section className="max-w-2xl mx-auto animate-fade-up" aria-labelledby="results-heading">
        <div className="glass-card p-8 text-center mb-6">
          <div className="flex justify-center mb-6 animate-float" aria-hidden="true">
            <BadgeIcon className={`w-20 h-20 ${pct >= 80 ? 'text-yellow-400' : pct >= 57 ? 'text-blue-400' : pct >= 40 ? 'text-forest-bright' : 'text-crimson-bright'}`} />
          </div>
          <h2 id="results-heading" className="headline text-fluid-2xl text-ink-1 font-semibold mb-1">
            {isSwahili ? 'Jaribio Limekamilika!' : 'Quiz Complete!'}
          </h2>
          <p className="text-ink-3 mb-6">
            {isSwahili 
              ? `Ulijibu maswali ${score} ya ${QUESTIONS.length} kwa usahihi (${pct}%)` 
              : `You answered ${score} of ${QUESTIONS.length} questions correctly (${pct}%)`}
          </p>

          {/* Score gauge */}
          <div className="mb-6">
            <div className="progress-bar mb-2 h-3 overflow-hidden rounded-full bg-surface-3">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${pct >= 80 ? 'bg-yellow-400' : pct >= 57 ? 'bg-blue-400' : pct >= 40 ? 'bg-forest-bright' : 'bg-crimson-bright'}`}
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-4 px-6 py-4 rounded-xl mb-8 bg-surface-2 border border-subtle shadow-md"
          >
            <BadgeIcon className="w-10 h-10 text-crimson-bright mb-1" />
            <div className="text-left border-l-2 border-subtle pl-4">
              <div className="text-ink-1 font-semibold text-lg">{isSwahili ? badge.swLabel : badge.label}</div>
              <div className="text-ink-4 text-sm max-w-sm">{isSwahili ? badge.swDesc : badge.desc}</div>
            </div>
          </div>

          {/* Results breakdown */}
          <div className="text-left mb-8 glass-card p-6 bg-surface-1">
            <h3 className="label text-ink-4 mb-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              {isSwahili ? 'Mapitio ya Maswali' : 'Question Review'}
            </h3>
            <div className="space-y-3">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                  style={{ 
                    background: h.correct ? 'rgba(0,106,78,0.06)' : 'rgba(200,16,46,0.06)',
                    borderColor: h.correct ? 'rgba(0,106,78,0.2)' : 'rgba(200,16,46,0.2)'
                  }}
                >
                  {h.correct 
                    ? <CheckCircle2 className="w-6 h-6 text-forest-bright flex-shrink-0 mt-0.5" /> 
                    : <XCircle className="w-6 h-6 text-crimson-bright flex-shrink-0 mt-0.5" />
                  }
                  <p className="text-ink-2 text-sm leading-relaxed font-medium">
                    {isSwahili 
                      ? QUESTIONS[idx].swScenario.substring(0, 100)
                      : QUESTIONS[idx].scenario.substring(0, 100)}…
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={restart} className="btn-primary w-full justify-center py-4 text-lg group">
            <RotateCcw className="w-5 h-5 group-hover:-rotate-90 transition-transform" />
            {isSwahili ? 'Fanya Jaribio Tena' : 'Take Quiz Again'}
          </button>
        </div>
      </section>
    )
  }

  const currentOptions = isSwahili ? q.swOptions : q.options

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <section className="max-w-2xl mx-auto" aria-labelledby="quiz-heading">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <span className="label text-ink-4 block mb-2 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-forest-bright" />
          {isSwahili ? 'Kujifunza kwa Kushiriki' : 'Interactive Learning'}
        </span>
        <h2 id="quiz-heading" className="headline text-fluid-2xl text-ink-1 font-semibold mb-2">
          {isSwahili ? 'Jaribio la Haki Zako' : 'Know Your Rights Quiz'}
        </h2>
        <p className="text-ink-3 max-w-xl">
          {isSwahili 
            ? 'Pima maarifa yako na matukio halisi ya maisha ya Kenya.' 
            : 'Test your knowledge with real-life Kenyan scenarios.'}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs text-ink-4 mb-2">
          <span className="font-semibold text-ink-3">
            {isSwahili ? `Swali la ${step + 1} kati ya ${QUESTIONS.length}` : `Question ${step + 1} of ${QUESTIONS.length}`}
          </span>
          <span className="bg-surface-3 px-2 py-1 rounded-md">
            {isSwahili ? `${score} sahihi hadi sasa` : `${score} correct so far`}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card p-6 md:p-8 mb-4 animate-fade-up shadow-lg" key={step}>
        {/* Scenario */}
        <div
          className="p-5 rounded-xl mb-6 relative overflow-hidden"
          style={{ background: 'rgba(212,160,23,0.08)', borderLeft: '4px solid #D4A017' }}
        >
          <div className="absolute top-0 right-0 -mt-2 -mr-2 text-6xl text-gold-muted opacity-20 pointer-events-none">"</div>
          <span className="label text-gold text-ink-4 block mb-2 tracking-widest" style={{ color: '#D4A017' }}>{isSwahili ? 'HALI' : 'SCENARIO'}</span>
          <p className="text-ink-1 text-base leading-relaxed italic relative z-10">{isSwahili ? q.swScenario : q.scenario}</p>
        </div>

        {/* Question */}
        <h3 className="headline text-ink-1 text-xl font-semibold mb-6">{isSwahili ? q.swQuestion : q.question}</h3>

        {/* Options */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentOptions.map((opt, idx) => {
            const isSelected = selected === idx
            const isCorrect  = idx === q.correct
            let borderColor = 'rgba(255,255,255,0.07)'
            let bg = 'rgba(255,255,255,0.02)'
            let textColor = '#aaa'
            let opacityValue = 1

            if (showFeedback) {
              if (isCorrect) { 
                borderColor = '#006A4E'; bg = 'rgba(0,106,78,0.15)'; textColor = '#3ecfa0' 
              } else if (isSelected) { 
                borderColor = '#C8102E'; bg = 'rgba(200,16,46,0.12)'; textColor = '#f47285' 
              } else {
                opacityValue = 0.5
              }
            } else if (isSelected) {
              borderColor = '#C8102E'
              bg = 'rgba(200,16,46,0.08)'
              textColor = '#f0f0f0'
            }

            return (
              <button
                key={idx}
                onClick={() => pick(idx)}
                disabled={showFeedback}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 disabled:cursor-default 
                  ${!showFeedback && 'hover:bg-surface-3 hover:border-subtle'}
                `}
                style={{
                  background: bg,
                  borderColor: borderColor,
                  borderWidth: isSelected || (showFeedback && isCorrect) ? '2px' : '1px',
                  color: textColor,
                  opacity: opacityValue
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{
                      background: showFeedback && isCorrect ? '#006A4E' : showFeedback && isSelected ? '#C8102E' : 'rgba(255,255,255,0.06)',
                      color: showFeedback && (isCorrect || isSelected) ? '#fff' : '#888'
                    }}
                  >
                    {['A','B','C','D'][idx]}
                  </span>
                  <span className={`flex-1 text-sm md:text-base leading-relaxed ${isSelected && !showFeedback ? 'font-medium' : ''}`}>{opt}</span>
                  {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-forest-bright" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-crimson-bright" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback panel */}
      {showFeedback && (
        <div className="animate-fade-up space-y-4">
          {/* Explanation */}
          <div
            className="p-6 rounded-xl shadow-lg border-l-4"
            style={selected === q.correct
              ? { background: 'rgba(0,106,78,0.12)', borderLeftColor: '#006A4E' }
              : { background: 'rgba(200,16,46,0.10)', borderLeftColor: '#C8102E' }
            }
          >
            <div className="flex items-center gap-2 mb-3">
              {selected === q.correct ? <CheckCircle2 className="w-6 h-6 text-forest-bright" /> : <XCircle className="w-6 h-6 text-crimson-bright" />}
              <span className="label text-sm tracking-wide" style={{ color: selected === q.correct ? '#3ecfa0' : '#f47285' }}>
                {selected === q.correct 
                  ? (isSwahili ? 'Ufahamu Sahihi!' : 'Correct Insight!') 
                  : (isSwahili ? 'Sio kabisa — hii hapa ni sababu:' : 'Not quite — here\'s why:')}
              </span>
            </div>
            <p className="text-ink-1 text-base leading-relaxed">{isSwahili ? q.swExplanation : q.explanation}</p>
          </div>

          {/* Action steps */}
          <div className="glass-card p-6">
            <h4 className="label text-ink-4 mb-4" style={{ color: selected === q.correct ? '#3ecfa0' : '#f47285' }}>
              {isSwahili ? 'Unachoweza kufanya' : 'What you can do'}
            </h4>
            <ol className="space-y-3">
              {(isSwahili ? q.swActionSteps : q.actionSteps).map((step, idx) => (
                <li key={idx} className="flex items-start gap-4 text-sm text-ink-2">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {idx + 1}
                  </span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Related articles */}
          {q.relatedArticles?.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-surface-2 p-3 rounded-lg border border-subtle">
              <BookOpen className="w-4 h-4 text-ink-4 mx-2" />
              <span className="text-ink-4 text-sm font-medium mr-2">{isSwahili ? 'Soma pia:' : 'Also read:'}</span>
              {q.relatedArticles.map(a => (
                <span key={a} className="chip-neutral bg-surface-3">{a}</span>
              ))}
            </div>
          )}

          {/* Next button */}
          <div className="text-center pt-6 pb-10">
            <button onClick={next} className="btn-primary py-3 px-8 text-base group">
              {step < QUESTIONS.length - 1 
                ? (isSwahili ? 'Swali Jipya' : 'Next Question') 
                : (isSwahili ? 'Ona Matokeo Yangu' : 'See My Results')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default Quiz