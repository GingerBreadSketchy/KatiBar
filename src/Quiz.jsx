import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'

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

const QUIZ_THEMES = [
  {
    accent: '#D4A017',
    strong: '#facc15',
    soft: 'rgba(212,160,23,0.14)',
    border: 'rgba(212,160,23,0.28)',
    glow: 'rgba(212,160,23,0.18)',
  },
  {
    accent: '#006A4E',
    strong: '#3ecfa0',
    soft: 'rgba(0,106,78,0.14)',
    border: 'rgba(62,207,160,0.24)',
    glow: 'rgba(0,106,78,0.18)',
  },
  {
    accent: '#3b82f6',
    strong: '#93c5fd',
    soft: 'rgba(59,130,246,0.13)',
    border: 'rgba(59,130,246,0.28)',
    glow: 'rgba(59,130,246,0.16)',
  },
  {
    accent: '#C8102E',
    strong: '#f47285',
    soft: 'rgba(200,16,46,0.13)',
    border: 'rgba(244,114,133,0.26)',
    glow: 'rgba(200,16,46,0.16)',
  },
]

function Quiz({ isSwahili }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState([])

  const q = QUESTIONS[step]
  const theme = QUIZ_THEMES[step % QUIZ_THEMES.length]
  const progress = ((step + (showFeedback ? 1 : 0)) / QUESTIONS.length) * 100
  const answeredCount = history.length
  const accuracy = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0
  const streak = useMemo(() => {
    let total = 0
    for (let index = history.length - 1; index >= 0; index -= 1) {
      if (!history[index].correct) break
      total += 1
    }
    return total
  }, [history])

  const pick = (idx) => {
    if (showFeedback) return
    const isCorrect = idx === q.correct
    setSelected(idx)
    setShowFeedback(true)
    if (isCorrect) setScore((current) => current + 1)
    setHistory((current) => [...current, { questionId: q.id, selectedIdx: idx, correct: isCorrect }])
  }

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((current) => current + 1)
      setSelected(null)
      setShowFeedback(false)
      return
    }

    setDone(true)
  }

  const restart = () => {
    setStep(0)
    setSelected(null)
    setShowFeedback(false)
    setScore(0)
    setDone(false)
    setHistory([])
  }

  const badge = BADGES.find((entry) => score >= entry.threshold) || BADGES[3]
  const BadgeIcon = badge.Icon
  const currentOptions = isSwahili ? q.swOptions : q.options

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

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <section className="max-w-5xl mx-auto" aria-labelledby="quiz-heading">
      <div className="mb-8 animate-fade-up">
        <span className="label text-ink-4 block mb-2 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-forest-bright" />
          {isSwahili ? 'Kujifunza kwa kushiriki' : 'Interactive Learning'}
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

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] mb-6">
        <div className="glass-card p-5 overflow-hidden relative">
          <div
            className="absolute inset-x-0 top-0 h-20"
            style={{ background: `linear-gradient(180deg, ${theme.soft} 0%, transparent 100%)` }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="label block mb-1" style={{ color: theme.strong }}>
                  {isSwahili ? `Jalada la kesi ${step + 1}` : `Case file ${step + 1}`}
                </span>
                <p className="text-ink-2 text-sm">
                  {isSwahili ? `Swali la ${step + 1} kati ya ${QUESTIONS.length}` : `Question ${step + 1} of ${QUESTIONS.length}`}
                </p>
              </div>
              <div className="chip-neutral bg-surface-3">
                {isSwahili ? `${score} sahihi hadi sasa` : `${score} correct so far`}
              </div>
            </div>

            <div className="progress-bar mb-4 h-2.5 bg-surface-3">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.strong})`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: isSwahili ? 'Usahihi' : 'Accuracy', value: `${accuracy}%`, icon: Target },
                { label: isSwahili ? 'Msururu' : 'Streak', value: String(streak), icon: Sparkles },
                { label: isSwahili ? 'Imejibiwa' : 'Answered', value: `${answeredCount}/${QUESTIONS.length}`, icon: ShieldCheck },
              ].map((stat) => {
                const StatIcon = stat.icon
                return (
                  <div key={stat.label} className="rounded-xl border border-faint bg-surface-2 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <StatIcon className="w-4 h-4" style={{ color: theme.strong }} />
                      <span className="text-ink-4 text-[11px] uppercase tracking-[0.16em]">{stat.label}</span>
                    </div>
                    <div className="ui-heading text-ink-1 text-lg">{stat.value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-gold" />
            <span className="label text-gold">{isSwahili ? 'Njia ya maswali' : 'Question Path'}</span>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {QUESTIONS.map((question, index) => {
              const reviewEntry = history[index]
              const isCurrent = index === step && !done

              let styles = {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#666',
              }

              if (reviewEntry?.correct) {
                styles = {
                  background: 'rgba(0,106,78,0.18)',
                  border: '1px solid rgba(0,106,78,0.28)',
                  color: '#3ecfa0',
                }
              } else if (reviewEntry && !reviewEntry.correct) {
                styles = {
                  background: 'rgba(200,16,46,0.15)',
                  border: '1px solid rgba(200,16,46,0.26)',
                  color: '#f47285',
                }
              } else if (isCurrent) {
                styles = {
                  background: theme.soft,
                  border: `1px solid ${theme.border}`,
                  color: theme.strong,
                }
              }

              return (
                <div
                  key={question.id}
                  className="h-10 rounded-xl flex items-center justify-center text-sm font-semibold"
                  style={styles}
                >
                  {index + 1}
                </div>
              )
            })}
          </div>
          <p className="text-ink-3 text-sm leading-relaxed">
            {showFeedback
              ? (isSwahili
                  ? 'Umefungua maelezo ya swali hili. Soma sababu na hatua zinazofuata kabla ya kuendelea.'
                  : 'You have unlocked the explanation for this question. Read the reason and the next steps before moving on.')
              : (isSwahili
                  ? 'Chagua jibu moja ili uone maelezo rahisi, hatua za kuchukua, na ibara zinazohusiana.'
                  : 'Pick one answer to reveal a plain explanation, next steps, and related articles.')}
          </p>
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card p-6 md:p-8 mb-4 animate-fade-up shadow-lg relative overflow-hidden" key={step}>
        <div
          className="absolute -top-16 right-[-40px] w-48 h-48 rounded-full blur-3xl"
          style={{ background: theme.glow }}
          aria-hidden="true"
        />

        <div
          className="p-5 rounded-xl mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.soft} 0%, rgba(255,255,255,0.02) 100%)`,
            borderLeft: `4px solid ${theme.accent}`,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="absolute top-0 right-0 -mt-2 -mr-2 text-6xl opacity-20 pointer-events-none" style={{ color: theme.accent }}>&ldquo;</div>
          <span className="label text-ink-4 block mb-2 tracking-widest" style={{ color: theme.strong }}>{isSwahili ? 'HALI' : 'SCENARIO'}</span>
          <p className="text-ink-1 text-base leading-relaxed italic relative z-10">{isSwahili ? q.swScenario : q.scenario}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {q.relatedArticles.map((article) => (
            <span key={article} className="tag-pill border border-faint bg-transparent">
              {article}
            </span>
          ))}
        </div>

        <h3 className="headline text-ink-1 text-xl font-semibold mb-6">{isSwahili ? q.swQuestion : q.question}</h3>

        {/* Options */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentOptions.map((opt, idx) => {
            const isSelected = selected === idx
            const isCorrect  = idx === q.correct
            let borderColor = 'rgba(255,255,255,0.07)'
            let bg = 'rgba(255,255,255,0.02)'
            let textColor = '#c0c0c0'
            let opacityValue = 1
            let shadow = 'none'

            if (showFeedback) {
              if (isCorrect) { 
                borderColor = '#006A4E'; bg = 'rgba(0,106,78,0.15)'; textColor = '#ecfdf5'; shadow = '0 12px 30px rgba(0,106,78,0.14)'
              } else if (isSelected) { 
                borderColor = '#C8102E'; bg = 'rgba(200,16,46,0.12)'; textColor = '#ffe4e6'; shadow = '0 12px 30px rgba(200,16,46,0.12)'
              } else {
                opacityValue = 0.5
              }
            } else if (isSelected) {
              borderColor = theme.accent
              bg = theme.soft
              textColor = '#f0f0f0'
              shadow = `0 16px 34px ${theme.glow}`
            }

            return (
              <button
                key={idx}
                onClick={() => pick(idx)}
                disabled={showFeedback}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 disabled:cursor-default 
                  ${!showFeedback && 'hover:bg-surface-3 hover:border-subtle hover:-translate-y-0.5'}
                `}
                style={{
                  background: bg,
                  borderColor: borderColor,
                  borderWidth: isSelected || (showFeedback && isCorrect) ? '2px' : '1px',
                  color: textColor,
                  opacity: opacityValue,
                  boxShadow: shadow,
                }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm"
                    style={{
                      background:
                        showFeedback && isCorrect
                          ? '#006A4E'
                          : showFeedback && isSelected
                            ? '#C8102E'
                            : isSelected
                              ? theme.accent
                              : 'rgba(255,255,255,0.06)',
                      color: showFeedback || isSelected ? '#fff' : '#888',
                    }}
                  >
                    {['A','B','C','D'][idx]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`block text-sm md:text-base leading-relaxed ${isSelected && !showFeedback ? 'font-medium' : ''}`}>{opt}</span>
                  </div>
                  {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-forest-bright flex-shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-crimson-bright flex-shrink-0" />}
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
                  ? (isSwahili ? 'Umeelewa vizuri' : 'You read it correctly') 
                  : (isSwahili ? 'Hapa ndipo haki ilikuwa' : 'Here is where the right really sits')}
              </span>
            </div>
            <p className="text-ink-1 text-base leading-relaxed">{isSwahili ? q.swExplanation : q.explanation}</p>
          </div>

          {/* Action steps */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h4 className="label text-blue-400">
                {isSwahili ? 'Unachoweza kufanya' : 'What you can do next'}
              </h4>
            </div>
            <ol className="space-y-3">
              {(isSwahili ? q.swActionSteps : q.actionSteps).map((step, idx) => (
                <li key={idx} className="flex items-start gap-4 text-sm text-ink-2">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans"
                    style={{
                      background: `${theme.accent}22`,
                      color: theme.strong,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

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
