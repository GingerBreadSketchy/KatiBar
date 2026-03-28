import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const sourceHtmlPath = path.join(rootDir, 'constitution-source.html');
const legacyExplainersPath = path.join(rootDir, 'src', 'data', 'constitution.json');
const scenarioBankPath = path.join(rootDir, 'src', 'data', 'constitution.scenario-bank.json');
const canonicalOutPath = path.join(rootDir, 'src', 'data', 'constitution.canonical.json');
const explainersOutPath = path.join(rootDir, 'src', 'data', 'constitution.explainers.json');
const appOutPath = path.join(rootDir, 'src', 'data', 'constitution.app.json');
const validationOutPath = path.join(rootDir, 'src', 'data', 'constitution.validation.json');

const chapterColors = [
  'green',
  'gold',
  'red',
  'purple',
  'teal',
  'black',
  'orange',
  'blue',
  'red',
  'gold',
  'teal',
  'green',
  'orange',
  'black',
  'blue',
  'purple',
  'gold',
  'red',
];

const swahiliFallback = 'Tazama maandishi rasmi ya Katiba hapa chini kwa lugha halisi ya sheria. Maelezo rahisi ya ibara hii yanaandaliwa.';
const englishFallback = 'Read the official constitutional text below for the exact legal wording. A plain-language explanation for this Article is being prepared.';
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getScriptJson(html, scriptId) {
  const match = html.match(new RegExp(`<script id="${scriptId}"[^>]*>([\\s\\S]*?)<\\/script>`));
  if (!match) throw new Error(`Could not find script tag: ${scriptId}`);
  return JSON.parse(match[1]);
}

function extractBalancedBlock(html, startIndex, tagName) {
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startIndex;

  let depth = 0;
  let started = false;
  let match;

  while ((match = tokenPattern.exec(html))) {
    const token = match[0];
    const isClosing = token.startsWith(`</${tagName}`);
    const isSelfClosing = token.endsWith('/>');

    if (!started) {
      if (match.index !== startIndex || isClosing) {
        continue;
      }
      started = true;
    }

    if (!isClosing && !isSelfClosing) depth += 1;
    if (isClosing) depth -= 1;

    if (started && depth === 0) {
      return html.slice(startIndex, tokenPattern.lastIndex);
    }
  }

  throw new Error(`Unbalanced <${tagName}> block starting at ${startIndex}`);
}

function findTagStartById(html, tagName, id) {
  const idNeedle = `id="${id}"`;
  const idIndex = html.indexOf(idNeedle);
  if (idIndex === -1) return -1;
  return html.lastIndexOf(`<${tagName}`, idIndex);
}

function getArticleBlock(html, articleId) {
  const sectionStart = findTagStartById(html, 'section', articleId);
  if (sectionStart === -1) throw new Error(`Could not find article block for ${articleId}`);
  return extractBalancedBlock(html, sectionStart, 'section');
}

function getAttachmentBlocks(html) {
  const blocks = [];
  const regex = /<div class="akn-attachment" id="([^"]+)"/g;
  let match;

  while ((match = regex.exec(html))) {
    const startIndex = match.index;
    const block = extractBalancedBlock(html, startIndex, 'div');
    blocks.push({ id: match[1], block });
  }

  return blocks;
}

function stripSectionHeading(articleBlock) {
  return articleBlock.replace(/^<section\b[^>]*>\s*<h3[^>]*>[\s\S]*?<\/h3>/i, '').replace(/<\/section>\s*$/i, '');
}

function htmlToText(fragment) {
  return decodeHtmlEntities(
    fragment
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:h1|h2|h3|h4|h5|h6|p|section|div|li|ul|ol)>/gi, '\n')
      .replace(/<span class="akn-num"[^>]*>([\s\S]*?)<\/span>/gi, '$1 ')
      .replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, '$1')
      .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/ \./g, '.')
    .replace(/ ,/g, ',')
    .trim();
}

function getLegacyExplainersMap(legacyData) {
  const map = new Map();

  for (const chapter of legacyData.chapters ?? []) {
    for (const section of chapter.sections ?? []) {
      const articleNumber = Number.parseInt(String(section.article ?? '').replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(articleNumber)) continue;

      map.set(articleNumber, {
        articleNumber,
        title: section.title ?? '',
        swTitle: section.swTitle ?? '',
        simplified: section.simplified ?? '',
        swSimplified: section.swSimplified ?? '',
        tags: Array.isArray(section.tags) ? section.tags : [],
        examples: Array.isArray(section.examples) ? section.examples : [],
        swExamples: Array.isArray(section.swExamples) ? section.swExamples : [],
        whatToDoIfViolated: section.whatToDoIfViolated ?? null,
        relatedArticles: Array.isArray(section.relatedArticles) ? section.relatedArticles : [],
      });
    }
  }

  return map;
}

function getLegacyChapterMap(legacyData) {
  const map = new Map();

  for (const chapter of legacyData.chapters ?? []) {
    const chapterNumber = Number.parseInt(String(chapter.number ?? chapter.swNumber ?? chapter.id ?? '').replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(chapterNumber)) continue;

    map.set(chapterNumber, {
      title: chapter.title ?? '',
      swTitle: chapter.swTitle ?? '',
      description: chapter.description ?? '',
      swDescription: chapter.swDescription ?? '',
      color: chapter.color ?? null,
    });
  }

  return map;
}

function getScenarioBankMap(scenarioBank) {
  const sourceMap = new Map((scenarioBank.sources || []).map(source => [source.id, source]));
  const entryMap = new Map();

  for (const entry of scenarioBank.entries || []) {
    for (const articleNumber of entry.articleNumbers || []) {
      entryMap.set(articleNumber, {
        ...entry,
        sources: (entry.sourceIds || []).map(sourceId => sourceMap.get(sourceId)).filter(Boolean),
      });
    }
  }

  return entryMap;
}

function flattenSections(node, context = {}) {
  const results = [];

  for (const child of node.children ?? []) {
    const nextContext = { ...context };

    if (child.type === 'part') {
      nextContext.part = {
        id: child.id,
        number: child.num,
        title: child.title,
        heading: child.heading,
      };
    }

    if (child.type === 'section' && child.basic_unit) {
      results.push({
        ...child,
        part: nextContext.part ?? null,
      });
    }

    results.push(...flattenSections(child, nextContext));
  }

  return results;
}

function getSimpleContext(canonicalArticle, chapterTitle) {
  const heading = canonicalArticle.heading.toLowerCase();
  const chapter = String(chapterTitle || '').toLowerCase();

  if (heading.includes('national assembly') || heading.includes('senate') || heading.includes('parliament') || chapter.includes('legislature')) {
    return { subject: 'what Parliament should do', place: 'a law-making debate or public issue in Parliament' };
  }
  if (heading.includes('life')) return { subject: 'your life', place: 'hospital, road accident, or dangerous attack' };
  if (heading.includes('privacy')) return { subject: 'your private life', place: 'your phone, home, or messages' };
  if (heading.includes('expression') || heading.includes('media') || heading.includes('information')) return { subject: 'speaking and sharing ideas', place: 'school, work, online, or a public meeting' };
  if (heading.includes('assembly') || heading.includes('petition')) return { subject: 'meeting, protesting, or petitioning', place: 'a street march or community protest' };
  if (heading.includes('property') || heading.includes('land')) return { subject: 'land, house, or property', place: 'home, farm, or plot dispute' };
  if (heading.includes('labour') || heading.includes('worker') || heading.includes('employment')) return { subject: 'work and pay', place: 'job, workplace, or salary problem' };
  if (heading.includes('health') || heading.includes('social')) return { subject: 'health and basic needs', place: 'hospital, clinic, school, or home' };
  if (heading.includes('children')) return { subject: 'children and their safety', place: 'home, school, or hospital' };
  if (heading.includes('disabilities') || heading.includes('disability')) return { subject: 'access for people with disabilities', place: 'school, office, or public building' };
  if (heading.includes('citizenship') || chapter.includes('citizenship')) return { subject: 'who is a Kenyan citizen', place: 'ID, passport, birth, or family papers' };
  if (heading.includes('president') || heading.includes('executive') || chapter.includes('executive')) return { subject: 'what the President or Executive can do', place: 'big national decisions' };
  if (heading.includes('judiciary') || heading.includes('court') || heading.includes('justice') || heading.includes('hearing')) return { subject: 'how courts should work', place: 'a case, hearing, or public complaint' };
  if (heading.includes('county') || chapter.includes('devolution')) return { subject: 'how county government should work', place: 'county services, local leaders, or county law' };
  if (heading.includes('finance') || heading.includes('revenue') || heading.includes('tax') || chapter.includes('finance')) return { subject: 'public money', place: 'tax, budget, or government spending' };
  if (heading.includes('security') || chapter.includes('security')) return { subject: 'national safety and security forces', place: 'police, military, or emergencies' };
  if (heading.includes('amendment')) return { subject: 'changing the Constitution', place: 'a vote, public debate, or Parliament process' };
  if (heading.includes('interpretation')) return { subject: 'what words in the Constitution mean', place: 'a court case or legal disagreement' };

  return { subject: heading || 'this rule', place: 'a real-life problem in Kenya' };
}

function normalizeHeading(input) {
  return String(input || '').toLowerCase();
}

function splitSentences(text) {
  if (!text) return [];
  return String(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.?!])\s+(?=[A-Z0-9(“"])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function clauseToYouSentence(clause) {
  if (!clause) return '';
  let s = clause;
  s = s.replace(/\b[Ee]very\s+person\b/g, 'You');
  s = s.replace(/\b[Aa]ny\s+person\b/g, 'You');
  s = s.replace(/\b[Aa]\s+person\b/g, 'You');
  s = s.replace(/\b[Yy]our\s+person\b/g, 'your body');
  s = s.replace(/\bshall\s+not\b/gi, 'must not');
  s = s.replace(/\bshall\b/gi, 'must');
  s = s.replace(/\bmay\b/gi, 'can');
  s = s.replace(/\bhis\s+or\s+her\b/gi, 'your');
  s = s.replace(/\btheir\b/gi, 'your');
  s = s.replace(/\bthe\s+State\b/gi, 'the State');
  return ensurePeriod(s);
}

function ensurePeriod(text) {
  if (!text) return '';
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

function buildWhatThisMeans(canonicalArticle) {
  const sentences = splitSentences(canonicalArticle.officialText);
  const picked = sentences.slice(0, 3).map(clauseToYouSentence);
  if (picked.length === 0) {
    const context = getSimpleContext(canonicalArticle, canonicalArticle.part?.heading || '');
    return ensurePeriod(`You have protections about ${context.subject}. It explains what should happen for you in ${context.place}.`);
  }
  while (picked.length < 2) picked.push('It also guides what officials must or must not do for you.');
  return picked.join(' ');
}

function buildTailoredExamples(canonicalArticle) {
  const articleNumber = canonicalArticle.number;
  const heading = normalizeHeading(canonicalArticle.heading);
  const chapter = normalizeHeading(canonicalArticle.part?.heading || '');

  const make = (a, b, swA = a, swB = b) => ({ examples: [a, b], swExamples: [swA, swB] });

  const articleSpecific = {
    60: make(
      'Land should be shared and used in a fair way, not in a way that harms people or nature.',
      'Women and men should be treated fairly in land matters, whether in law or in local practice.'
    ),
    61: make(
      'Land in Kenya falls into three groups: public land, community land, and private land.',
      'If people argue about what kind of land a place is, this Article gives the starting categories.'
    ),
    62: make(
      'Some land belongs to the public, like certain government land, roads, forests, rivers, and beaches.',
      'If someone tries to grab land that belongs to everyone, this Article helps explain why that is wrong.'
    ),
    63: make(
      'Some land belongs to a community and should be held for that community, not taken by outsiders unfairly.',
      'If a community has always used or managed certain land, this Article helps explain why that land matters to them.'
    ),
    64: make(
      'Some land belongs to private people or families.',
      'If a person owns land by title or lease, this Article helps explain that it is private land.'
    ),
    65: make(
      'A person who is not Kenyan can only hold land by lease, not forever.',
      'If a non-citizen is given land for longer than the law allows, this Article helps explain the limit.'
    ),
    66: make(
      'Government can make land-use rules for health, safety, planning, and the public good.',
      'If a dangerous building, quarry, or project needs control, this Article helps explain why rules can be made.'
    ),
    68: make(
      'Parliament can make more laws to protect land rights and fix land problems.',
      'If Kenya needs clearer land rules on things like family land or land size, this Article shows Parliament can make them.'
    ),
    69: make(
      'If a factory dirties a river or smoke makes an area unsafe, people and government should help protect the environment.',
      'If trees are being destroyed carelessly or land is being damaged, this shows the environment must be looked after.'
    ),
    70: make(
      'If a river, forest, or neighbourhood is being damaged, people can go to court or complain to help protect the environment.',
      'If pollution is harming a community, this shows citizens do not have to stay quiet.'
    ),
    71: make(
      'If leaders want to sign a big oil, gas, or mining deal, the deal should follow the Constitution.',
      'If natural resources are being used, people should not be cheated by secret or unfair agreements.'
    ),
    72: make(
      'If Kenya needs clearer rules on forests, pollution, or natural resources, Parliament can make those laws.',
      'If people want stronger environmental protection, this shows laws can be passed to support it.'
    ),
    73: make(
      'If a leader uses office to help themselves instead of the public, this shows that is the wrong way to lead.',
      'If people expect honesty, fairness, and service from leaders, this explains why.'
    ),
    74: make(
      'If a State officer takes office, they must promise to serve Kenya honestly.',
      'If a leader breaks the promise they made when taking office, this reminds us that oath matters.'
    ),
    75: make(
      'If a State officer lies, abuses power, or behaves badly in office, this shows that conduct is not acceptable.',
      'If people expect leaders to act honestly and fairly, this explains why that matters.'
    ),
    77: make(
      'If a State officer wants to mix public office with private business in a way the law does not allow, this shows there are limits.',
      'If a leader tries to use office for personal gain, this helps explain why some activities are restricted.'
    ),
    78: make(
      'If someone wants a top State job, their citizenship may matter because some offices are for Kenyan citizens only.',
      'If a person holds another citizenship and wants a leadership office, this Article helps explain why extra rules may apply.'
    ),
    80: make(
      'If Kenya needs stronger rules to keep leaders honest, Parliament can make those laws.',
      'If people want clear rules on leadership and integrity, this shows the law can provide them.'
    ),
    85: make(
      'If you want to run for office without joining a political party, you must still meet the legal rules for an independent candidate.',
      'If someone says independent candidates can run without any rules, this shows that is not true.'
    ),
    86: make(
      'If you vote, your vote should be secret, free, and counted fairly.',
      'If people are forced, threatened, or cheated during voting, this shows that is against the rules.'
    ),
    100: make(
      'If women, youth, persons with disabilities, or other marginalised groups are left out, Parliament should help make representation fairer.',
      'If one kind of person fills nearly every seat, this shows why representation should include groups that are often left out.'
    ),
    104: make(
      'If voters feel an MP has failed badly, the law may allow them to start a recall process.',
      'If people ask whether they must wait until the next election no matter what, this shows there can be a legal way to remove an MP.'
    ),
    105: make(
      'If people argue about whether someone was properly elected as an MP, a court can decide that question.',
      'If there is a dispute about membership in Parliament, this shows who helps settle it.'
    ),
    108: make(
      'If a political party has members in Parliament, its leader can have a formal place in parliamentary business.',
      'If people ask why party leaders matter inside Parliament, this Article helps explain it.'
    ),
    109: make(
      'If Parliament wants to make a new law, it must use the steps the Constitution sets out.',
      'If someone tries to make a law by skipping the right process, this shows that is not enough.'
    ),
    116: make(
      'If Parliament passes a law, people still need to know when that law actually starts working.',
      'If someone asks whether a new law starts immediately or on a later date, this Article helps explain that.'
    ),
    117: make(
      'If MPs are speaking or debating in Parliament, they need protection so they can do their work properly.',
      'If Parliament is to check government well, its members need certain powers and protections while doing official work.'
    ),
    118: make(
      'If Parliament is discussing laws that affect people, the public should be able to follow and take part.',
      'If leaders try to hide parliamentary work from citizens, this shows openness and public participation matter.'
    ),
    125: make(
      'If Parliament is checking a serious matter, it can call people to answer questions and bring documents.',
      'If a committee needs proof before making a decision, this shows it can ask for evidence.'
    ),
    139: make(
      'If a President-elect dies before being sworn in, the country still needs a clear legal next step.',
      'If people ask what happens when tragedy comes before a new President takes office, this Article gives the rule.'
    ),
    143: make(
      'If someone wants to sue the President for official acts while the President is in office, this Article explains the legal protection involved.',
      'If people ask whether the President can face every kind of court case while serving, this Article helps explain the limit.'
    ),
    160: make(
      'If judges are pushed by politicians or other powerful people, this shows why the Judiciary must be independent.',
      'If courts are to be fair, judges must be free to decide cases without fear or pressure.'
    ),
    168: make(
      'If someone wants a judge removed, there must be a proper process and a serious legal reason.',
      'If powerful people are unhappy with a judge’s decision, this shows they cannot just remove that judge anyhow.'
    ),
    175: make(
      'If county government is working well, people should be heard and services should come closer to them.',
      'If county leaders act secretly or forget the people, this shows devolved government should still stay open and answerable.'
    ),
    187: make(
      'If a job like health, roads, or another service needs to move from one level of government to another, there must be a lawful process.',
      'If the national and county governments agree to shift a function, this Article helps explain how that can happen.'
    ),
    188: make(
      'If people want to change a county boundary, it cannot be done carelessly or in secret.',
      'If a boundary change will affect communities, this shows the law must guide that process.'
    ),
    200: make(
      'If Kenya needs more laws to make devolution work well, Parliament can pass them.',
      'If county government needs clearer legal support, this Article shows laws can be made for that chapter.'
    ),
    214: make(
      'If government borrows a lot of money, people should know that debt must still be handled carefully and lawfully.',
      'If today’s leaders borrow carelessly, this shows public debt can affect everyone later.'
    ),
    219: make(
      'If counties are waiting for their fair share of national money, it should not be delayed without reason.',
      'If a county cannot run services because its money has not been sent on time, this Article helps explain why that matters.'
    ),
    232: make(
      'If you go to a public office, you should be served fairly, politely, and honestly.',
      'If public workers are rude, corrupt, or unfair, this shows public service should be better than that.'
    ),
    236: make(
      'If a public officer refuses to do something illegal, they should not be punished for doing the right thing.',
      'If a worker in government speaks up or acts lawfully, this Article helps protect them from unfair punishment.'
    ),
    247: make(
      'If Kenya ever needs another police service by law, it must still be created properly.',
      'If people hear about another police service being proposed, this Article explains that the law must guide it.'
    ),
    248: make(
      'If people ask which commissions and independent offices are covered in this chapter, this Article gives the list.',
      'If someone wants to know whether a certain commission belongs under these rules, this is where they start.'
    ),
    251: make(
      'If someone wants a commissioner removed, there must be a proper process and a serious reason.',
      'If powerful people dislike a commissioner’s work, this shows they cannot simply push that person out without following the law.'
    ),
    252: make(
      'If a commission needs to investigate, advise, or protect the public, this Article explains that it has real powers to do its work.',
      'If people ask what commissions and independent offices are allowed to do, this Article gives the basic answer.'
    ),
    258: make(
      'If someone is breaking the Constitution, any person can go to court to help defend it.',
      'If leaders misuse power and people want the Constitution protected, this Article shows court action is possible.'
    ),
    259: make(
      'If a part of the Constitution is hard to understand, it should be read in a way that supports justice, rights, and its real purpose.',
      'If leaders try to read the Constitution in a narrow way that defeats its spirit, this Article explains why that is wrong.'
    ),
    261: make(
      'If the 2010 Constitution needed extra laws to make new systems work, Parliament had to pass them in time.',
      'If people ask why some follow-up laws were needed after the new Constitution began, this Article helps explain that.'
    ),
    262: make(
      'If Kenya was moving from the old Constitution to the new one, there had to be temporary rules to help that change happen smoothly.',
      'If people ask how old systems were replaced by new ones after 2010, this Article points to those transition rules.'
    ),
  };

  Object.assign(articleSpecific, {
    7: make(
      'Kiswahili is the national language, and Kenya also uses English officially.',
      'Local languages, Kenyan Sign Language, and Braille should also be respected and developed.'
    ),
    11: make(
      'Culture is part of who Kenyans are and should be protected.',
      'Music, art, traditions, and cultural knowledge should not be ignored or lost.'
    ),
    19: make(
      'Rights belong to every person and help protect dignity and justice.',
      'Rights are not gifts from leaders. They are part of how Kenya should be run.'
    ),
    21: make(
      'The State must respect, protect, and fulfil rights, not just talk about them.',
      'If people are suffering and government does nothing, this Article helps explain that leaders still have a duty.'
    ),
    25: make(
      'Some rights can never be taken away, even in very hard times.',
      'Freedom from torture, slavery, and unfair trial are examples of rights that must stay protected.'
    ),
    30: make(
      'No one should be held as a slave or forced to work against their will.',
      'If a person is made to work through fear, force, or control, this Article helps explain why that is wrong.'
    ),
    41: make(
      'Workers should get fair pay, safe conditions, and the freedom to join a union.',
      'If workers are underpaid, mistreated, or blocked from striking lawfully, this Article can matter.'
    ),
    44: make(
      'Every person can use their own language and take part in their culture.',
      'A cultural or language community can keep its traditions and associations alive.'
    ),
    76: make(
      'State officers should handle money honestly and should not take secret gifts or benefits.',
      'If a leader uses office to get private financial favours, this Article helps explain why that is wrong.'
    ),
    120: make(
      'Parliament uses Kiswahili, English, and Kenyan Sign Language in its work.',
      'If people ask which languages Parliament should use, this Article gives the basic rule.'
    ),
    136: make(
      'The President is elected by voters in a national election.',
      'If people ask when a presidential election is held, this Article helps explain the timing.'
    ),
    137: make(
      'This Article says who can or cannot run for President.',
      'If a person wants to be President, this Article helps explain the basic rules they must meet.'
    ),
    138: make(
      'This Article explains how the presidential vote is carried out and counted.',
      'If people ask what must happen for someone to win the presidency, this Article helps explain it.'
    ),
    140: make(
      'A presidential election can be challenged in the Supreme Court.',
      'If people say a presidential election was not valid, this Article helps explain how that dispute is handled.'
    ),
    148: make(
      'The Deputy President is chosen together with the President and sworn in with them.',
      'If people ask how the Deputy President gets office, this Article helps explain that it is tied to the presidential election.'
    ),
    180: make(
      'County voters elect a governor and deputy governor.',
      'If people ask how county leaders are chosen, this Article helps explain the basic election path.'
    ),
    193: make(
      'This Article says who can or cannot run for county assembly.',
      'If a person wants to become an MCA, this Article helps explain the basic rules they must meet.'
    ),
    12: make(
      'If you are Kenyan, you should be able to get an ID card or passport.',
      'If an office refuses to give you citizen papers for no good reason, this shows that is wrong.'
    ),
    15: make(
      'If you marry a Kenyan, you may be able to apply for citizenship.',
      'If you want to become Kenyan by application, this helps explain that path.'
    ),
    27: make(
      'If a school or job treats you badly because of who you are, this shows that is wrong.',
      'If two people need the same service, they should be treated fairly.'
    ),
    39: make(
      'If you want to move to another town or county, you should be free to do that.',
      'If someone is chased away just because of who they are, this shows that is wrong.'
    ),
    52: make(
      'If a word in this part is hard, this Article helps explain it.',
      'If people argue about what a word here means, this Article helps.'
    ),
    16: make(
      'If a Kenyan also belongs to another country, this helps explain when that is allowed.',
      'If a family has ties to Kenya and another country, this Article can matter.'
    ),
    17: make(
      'If someone got citizenship by lying, the government may take it away by law.',
      'If people ask when registered citizenship can be cancelled, this Article helps explain it.'
    ),
    18: make(
      'If people want to know the detailed rules on citizenship, Parliament can make those laws.',
      'If an office is handling citizenship papers, this helps explain where some rules come from.'
    ),
    43: make(
      'If a family has no food, clean water, health care, housing, or school, this shows why these basics matter.',
      'If a hospital or school fails people badly, this Article helps show the promise in the Constitution.'
    ),
    47: make(
      'If a public office ignores you or delays your matter for too long, this shows that is not fair.',
      'If an office keeps your records wrong and refuses to fix them, this Article can help.'
    ),
    49: make(
      'If police arrest you, they must tell you why and treat you fairly.',
      'If you are arrested, you can ask for a lawyer and should be taken to court on time.'
    ),
    51: make(
      'If a person is in jail or police cells, they still have rights.',
      'If a prisoner is treated cruelly or denied basic dignity, this shows that is wrong.'
    ),
    54: make(
      'If a child with a disability is blocked from school, this shows that is wrong.',
      'If a building, bus stop, or office shuts out a person with a disability, this Article matters.'
    ),
    56: make(
      'If a small community is always left out, this shows that is unfair.',
      'If roads, schools, or jobs never reach some groups, this Article explains why they should not be forgotten.'
    ),
    59: make(
      'If people are treated unfairly and need help, this office can speak up about rights.',
      'If unfair treatment keeps happening, this shows why Kenya needs this office.'
    ),
    67: make(
      'If people ask which public office handles land matters, this Article points to that office.',
      'If public land is being managed badly, this helps explain why a land office exists.'
    ),
    79: make(
      'If leaders steal or take bribes, this shows why Kenya needs a body to fight corruption.',
      'If people want a public office to check dishonest leaders, this Article helps explain that.'
    ),
    100: make(
      'If women, youth, or other left-out groups never get seats, this shows something is wrong.',
      'If one kind of person fills almost every seat, this Article explains why more groups should be included.'
    ),
    102: make(
      'If people ask how long Parliament stays before the next election, this Article gives the basic rule.',
      'If Parliament ends early in a way the law allows, this Article helps explain that too.'
    ),
    149: make(
      'If the Deputy President seat becomes empty, this Article says what happens next.',
      'If people ask who fills that seat, this Article helps explain it.'
    ),
    151: make(
      'If people ask who decides the pay of the President and Deputy President, this Article helps explain it.',
      'If leaders want to change that pay, this shows it must follow the law.'
    ),
    115: make(
      'If Parliament passes a Bill, the President can sign it or send it back with concerns.',
      'If people ask why a Bill has not become law yet, this may be one reason.'
    ),
    127: make(
      'If Parliament needs staff and offices to do its work, this office helps make that happen.',
      'If people ask who helps Parliament run day by day, this Article points to that office.'
    ),
    133: make(
      'If the law allows mercy, the President may forgive or reduce a punishment.',
      'If people ask how mercy can be shown lawfully, this Article helps explain it.'
    ),
    134: make(
      'If the President is away or cannot act for a short time, another leader acts until the President returns.',
      'If people ask who takes over for a short while, this Article gives the answer.'
    ),
    143: make(
      'If someone wants to take the President to court while the President is still serving, this Article explains the limit.',
      'If people ask when a President is protected from some court cases, this Article helps explain it.'
    ),
    157: make(
      'If police arrest someone, this office helps decide whether that person should go to criminal court.',
      'If people ask who decides on many criminal cases, this Article points to that office.'
    ),
    158: make(
      'If people ask when the DPP can resign or be removed, this Article gives the rule.',
      'If a public office must not be pushed out unfairly, this Article helps explain the protection.'
    ),
    171: make(
      'If judges need an office to help choose and support them, this Article sets up that office.',
      'If people ask who helps the courts run well behind the scenes, this Article points to that office.'
    ),
    172: make(
      'If judges are being chosen or court staff are being managed, this office helps with that work.',
      'If people ask what the judges office does, this Article gives the answer.'
    ),
    173: make(
      'If courts need money to do their work, this fund helps provide it.',
      'If people ask how court work is paid for, this Article helps explain it.'
    ),
    181: make(
      'If a county governor seriously breaks the law, there is a legal way to remove them.',
      'If people ask whether a governor can just stay no matter what, this Article shows there are limits.'
    ),
    182: make(
      'If a county governor dies, resigns, or leaves office, this Article says what happens next.',
      'If a county suddenly has no governor, this helps explain the next step.'
    ),
    187: make(
      'If health, roads, or another service needs to move between national and county government, it must follow the law.',
      'If the two levels of government agree to shift a job, this Article helps explain how.'
    ),
    191: make(
      'If a county law says one thing and a national law says another, this Article helps show which one wins.',
      'If leaders argue over which law should guide people, this Article helps sort it out.'
    ),
    200: make(
      'If county government needs more laws to work well, Parliament can make them.',
      'If counties need clearer rules, this Article shows that more laws can be passed.'
    ),
    215: make(
      'If people ask who helps decide how public money should be shared, this office helps with that work.',
      'If counties and the national government need fair advice on money sharing, this office matters.'
    ),
    216: make(
      'If leaders are sharing national money, this office helps advise what is fair.',
      'If people ask why some places should get more help, this office helps explain the money side.'
    ),
    219: make(
      'If county money is delayed, services like health or roads can suffer.',
      'If a county is waiting for its fair share of money, this Article says it should not be kept waiting for no good reason.'
    ),
    221: make(
      'If government wants to spend public money, it must first prepare a yearly budget and spending Bill.',
      'If people ask where planned government spending is written down, this Article helps explain it.'
    ),
    223: make(
      'If government needs to spend more money than planned, it must go back for approval.',
      'If leaders want extra public money after the budget is set, this Article shows they cannot just spend it anyhow.'
    ),
    224: make(
      'If a county wants to spend public money, it also needs its own spending law.',
      'If people ask how county spending is approved, this Article helps explain it.'
    ),
    230: make(
      'If leaders want to set their own pay, this office helps stop that from being unfair.',
      'If people ask who helps decide pay for top State jobs, this Article points to that office.'
    ),
    233: make(
      'If people ask who helps manage public workers fairly, this Article points to that office.',
      'If public jobs are being handled unfairly, this office can matter.'
    ),
    234: make(
      'If people ask what the public service office actually does, this Article gives the answer.',
      'If workers are being hired, promoted, or disciplined in public service, this office can matter.'
    ),
    236: make(
      'If a public worker refuses to do something illegal, they should not be punished for that.',
      'If a worker speaks up for what is right, this Article helps protect them.'
    ),
    237: make(
      'If teachers need an office to handle their work matters, this Article sets it up.',
      'If a teacher is treated unfairly at work, this office can matter.'
    ),
    246: make(
      'If police jobs, discipline, or hiring need to be handled fairly, this office helps with that.',
      'If people ask who helps manage police service matters, this Article points to that office.'
    ),
    248: make(
      'If people ask which offices are in this chapter, this Article gives the list.',
      'If someone wants to know whether an office is covered here, this is where they start.'
    ),
    249: make(
      'If leaders misuse power, these offices help question them and protect the public.',
      'If people ask why Kenya has independent offices, this Article gives the reason.'
    ),
    250: make(
      'If people ask how members of these offices are picked, this Article explains it.',
      'If someone wants to know how long they stay in office, this Article helps.'
    ),
    251: make(
      'If someone wants a commissioner removed, there must be a real reason and a fair process.',
      'If powerful people dislike a commissioner, this shows they cannot just throw them out.'
    ),
    252: make(
      'If these offices need to investigate, advise, or protect people, this Article says they can do that work.',
      'If people ask what these offices are allowed to do, this Article gives the basic answer.'
    ),
    253: make(
      'If one of these offices needs to sign papers, own property, or go to court, this Article says it can act officially.',
      'If people ask whether these offices can act like real legal bodies, this Article says yes.'
    ),
    254: make(
      'If these offices do important work, they should also tell the country what they have done.',
      'If people ask where to see what these offices have been doing, this Article points to reporting.'
    ),
    259: make(
      'If a part of the Constitution is hard to understand, it should be read in a fair way that protects people.',
      'If leaders try to twist the Constitution, this Article reminds us to read it by its true purpose.'
    ),
    260: make(
      'If a word in the Constitution is hard, this Article helps explain it.',
      'If people argue about what a word means here, this Article helps sort it out.'
    ),
    262: make(
      'If Kenya was changing from the old Constitution to the new one, temporary rules were needed for that change.',
      'If people ask how the country moved from the old system to the new one, this Article helps explain it.'
    ),
  });

  Object.assign(articleSpecific, {
    33: make(
      'You can speak, share ideas, and question leaders, but there are still limits against harmful speech.',
      'If someone is silenced for speaking about a public problem, this Article can matter.'
    ),
    34: make(
      'News and media should be free to report without unfair control.',
      'If government tries to control what journalists say, this Article helps explain why that is wrong.'
    ),
    35: make(
      'You can ask for important public information.',
      'If a public office hides information people need, this Article helps explain why that is a problem.'
    ),
    37: make(
      'People can gather, protest, and present petitions in a peaceful way.',
      'If citizens march or deliver a petition peacefully, this Article helps explain that right.'
    ),
    70: make(
      'If a river, forest, or neighbourhood is being damaged, people can complain or go to court.',
      'If pollution is harming a community, this shows citizens do not have to stay quiet.'
    ),
    73: make(
      'If a leader uses office to help themselves, this shows that is wrong.',
      'If people expect honesty and fairness from leaders, this explains why.'
    ),
    77: make(
      'If a State officer mixes public office with private business wrongly, this shows there are limits.',
      'If a leader uses office for personal gain, this helps explain why some activities are restricted.'
    ),
    85: make(
      'If you want to run without a political party, you must still follow the rules.',
      'If someone says you can run with no rules at all, this shows that is not true.'
    ),
    81: make(
      'Elections should be free, fair, peaceful, and honest.',
      'If votes are stolen, people are threatened, or counting is unfair, this Article helps explain what should not happen.'
    ),
    82: make(
      'Parliament can make election laws to keep voting fair and orderly.',
      'If Kenya needs clearer election rules, this Article shows Parliament can make them.'
    ),
    83: make(
      'An adult Kenyan citizen can register as a voter if the law allows it.',
      'If someone is blocked from voter registration for no good legal reason, this Article can matter.'
    ),
    84: make(
      'Candidates and political parties must follow election rules and a code of conduct.',
      'If a candidate breaks campaign rules badly, this Article helps explain why rules still matter.'
    ),
    87: make(
      'Election disputes should be settled quickly and fairly.',
      'If people argue that an election was not fair, this Article helps explain that the law must deal with it.'
    ),
    88: make(
      'This office runs elections and handles boundaries work.',
      'If people ask who manages voting, voter lists, and some election boundaries, this Article points to that office.'
    ),
    89: make(
      'Voting areas should be drawn in a fair way.',
      'If one area is drawn unfairly to favour some people, this Article helps explain why that is a problem.'
    ),
    90: make(
      'Party list seats should be shared by clear rules.',
      'If special seats are being given out after an election, this Article helps explain how that should be done.'
    ),
    91: make(
      'Political parties should be democratic and should not divide Kenyans unfairly.',
      'If a party spreads hate or only serves one small group unfairly, this Article helps explain why that is wrong.'
    ),
    92: make(
      'Parliament can make more laws about political parties.',
      'If Kenya needs clearer party rules, this Article shows Parliament can make them.'
    ),
    93: make(
      'Parliament has two Houses: the National Assembly and the Senate.',
      'If people ask how Parliament is set up, this Article gives the basic shape.'
    ),
    94: make(
      'Parliament makes laws and speaks for the people.',
      'If another office tries to make laws without Parliament, this Article helps explain why that is not the normal path.'
    ),
    95: make(
      'The National Assembly makes laws and watches over public money.',
      'If taxes, spending, or national government oversight are being discussed, this Article helps explain the Assembly role.'
    ),
    96: make(
      'The Senate protects counties and their interests.',
      'If county concerns are being discussed at national level, this Article helps explain why the Senate matters.'
    ),
    97: make(
      'This Article says who sits in the National Assembly.',
      'If people ask how many kinds of members are in the National Assembly, this Article helps explain it.'
    ),
    98: make(
      'This Article says who sits in the Senate.',
      'If people ask how the Senate includes county and special interest seats, this Article helps explain it.'
    ),
    99: make(
      'This Article says who can or cannot run for Parliament.',
      'If someone wants to be an MP, this Article helps explain the basic rules they must meet.'
    ),
    101: make(
      'This Article says how members of Parliament are elected.',
      'If people ask when and how MPs are chosen, this Article helps explain it.'
    ),
    103: make(
      'An MP can lose their seat in some situations set by law.',
      'If an MP resigns, dies, or stops meeting the rules, this Article helps explain what happens.'
    ),
    106: make(
      'Parliament chooses Speakers and Deputy Speakers to lead its sittings.',
      'If people ask who leads debates in Parliament, this Article helps explain it.'
    ),
    107: make(
      'Parliament must be led by the right person during a sitting.',
      'If the Speaker is away, this Article helps explain who can take over the chair.'
    ),
    108: make(
      'Party leaders have a formal place in Parliament.',
      'If people ask why party leaders matter inside Parliament, this Article helps explain it.'
    ),
    110: make(
      'Some Bills must be treated as county government Bills.',
      'If a new law affects counties, this Article helps explain that it must follow the right path.'
    ),
    111: make(
      'Some county Bills are special Bills and follow special rules.',
      'If a Bill about counties is especially important, this Article helps explain why extra steps may apply.'
    ),
    112: make(
      'Some county Bills are ordinary Bills and follow their own path.',
      'If a Bill affects counties but is not a special Bill, this Article helps explain that route.'
    ),
    113: make(
      'If the two Houses disagree on a Bill, a mediation committee can help them try to agree.',
      'If a law is stuck because the Houses do not agree, this Article helps explain one way forward.'
    ),
    114: make(
      'Money Bills deal with taxes, spending, and public money.',
      'If a Bill is mainly about raising or spending public money, this Article helps explain that kind of Bill.'
    ),
    119: make(
      'People can take their concerns to Parliament by petition.',
      'If citizens want Parliament to act on an issue, this Article helps explain that they can petition it.'
    ),
    121: make(
      'Parliament needs enough members present to do official work.',
      'If too few members are in the House, this Article helps explain why business may have to stop.'
    ),
    122: make(
      'Members vote by rules when Parliament makes decisions.',
      'If there is a disagreement in Parliament, this Article helps explain how a vote should be done.'
    ),
    123: make(
      'The Senate follows voting rules when making decisions.',
      'If people ask how the Senate reaches a final decision, this Article helps explain it.'
    ),
    124: make(
      'Parliament works through committees and its own rules.',
      'If a Bill or public issue is being studied closely, this Article helps explain why committees matter.'
    ),
    126: make(
      'Parliament usually sits in Nairobi unless the law allows otherwise.',
      'If people ask where Parliament normally meets, this Article gives the basic answer.'
    ),
    128: make(
      'Parliament has clerks and staff to help it work.',
      'If people ask who keeps Parliament running behind the scenes, this Article helps explain it.'
    ),
    131: make(
      'The President has major powers, but those powers come with limits.',
      'If people ask what the President is allowed to do, this Article gives the basic starting point.'
    ),
    132: make(
      'This Article lists the main jobs of the President.',
      'If people ask what the President is supposed to do for the country, this Article helps explain it.'
    ),
    135: make(
      'Important presidential decisions should be put in writing.',
      'If a major presidential decision is only passed by word of mouth, this Article helps explain why writing matters.'
    ),
    141: make(
      'This Article says when and how a President takes office.',
      'If a new President has been elected, this Article helps explain the swearing-in step.'
    ),
    142: make(
      'A President serves for a set term and cannot stay forever.',
      'If people ask how long a President stays in office, this Article gives the basic rule.'
    ),
    144: make(
      'A President can be removed if unable to do the job.',
      'If a President cannot continue because of incapacity, this Article helps explain the legal path.'
    ),
    145: make(
      'A President can be removed for serious wrongdoing.',
      'If leaders say a President broke the law badly, this Article helps explain the impeachment path.'
    ),
    146: make(
      'This Article says what happens if the office of President becomes empty.',
      'If a President dies, resigns, or leaves office, this Article helps explain the next step.'
    ),
    147: make(
      'The Deputy President helps the President and can take over when needed.',
      'If the President is away or unable to act, this Article helps explain the Deputy President role.'
    ),
    150: make(
      'The Deputy President can be removed through the legal process.',
      'If people ask whether the Deputy President can be removed, this Article helps explain how.'
    ),
    152: make(
      'The Cabinet helps run the national government.',
      'If people ask who works with the President to run government, this Article helps explain the Cabinet role.'
    ),
    153: make(
      'Cabinet members should act responsibly and answer for their work.',
      'If a Cabinet decision goes badly wrong, this Article helps explain why accountability still matters.'
    ),
    154: make(
      'The Secretary to the Cabinet helps organise Cabinet work.',
      'If people ask who keeps Cabinet business moving properly, this Article points to that office.'
    ),
    155: make(
      'Principal Secretaries help run ministries.',
      'If people ask who supports ministries under Cabinet Secretaries, this Article helps explain it.'
    ),
    156: make(
      'The Attorney-General is the main lawyer for the national government.',
      'If government needs legal advice or representation, this Article helps explain who does that work.'
    ),
    159: make(
      'Courts should do justice for everyone.',
      'If a case is being decided, this Article helps explain the values that should guide the courts.'
    ),
    161: make(
      'This Article says the main judicial offices and officers.',
      'If people ask who the main court officers are, this Article helps explain it.'
    ),
    162: make(
      'Kenya has different courts for different kinds of cases.',
      'If people ask why not every case goes to the same court, this Article helps explain the court system.'
    ),
    163: make(
      'The Supreme Court is the top court in Kenya.',
      'If a case reaches the highest court, this Article helps explain the place of the Supreme Court.'
    ),
    164: make(
      'The Court of Appeal hears appeals from lower courts.',
      'If someone wants a High Court decision reviewed, this Article helps explain the next court level.'
    ),
    165: make(
      'The High Court handles many important cases and has wide powers.',
      'If a case involves major rights or serious legal questions, this Article helps explain why the High Court matters.'
    ),
    166: make(
      'Judges should be chosen through the proper process.',
      'If people ask how top judges are appointed, this Article helps explain that path.'
    ),
    167: make(
      'Judges serve under rules that protect independence and set retirement.',
      'If people ask how long judges serve, this Article helps explain the basic rule.'
    ),
    169: make(
      'Subordinate courts handle many cases below the higher courts.',
      'If a case starts in a magistrates court or another lower court, this Article helps explain that level.'
    ),
    170: make(
      'Kadhi courts handle some Muslim personal law matters.',
      'If a Muslim family dispute about marriage, divorce, or inheritance goes to a Kadhi court, this Article helps explain why.'
    ),
    174: make(
      'County government should bring power and services closer to the people.',
      'If people in a county want more say in local services, this Article helps explain why devolution matters.'
    ),
    176: make(
      'Each county has its own government.',
      'If people ask who runs a county under the Constitution, this Article helps explain the basic setup.'
    ),
    177: make(
      'This Article says who sits in a county assembly.',
      'If people ask how county assemblies include elected and special seats, this Article helps explain it.'
    ),
    178: make(
      'A county assembly chooses a Speaker to lead its sittings.',
      'If people ask who leads debate in a county assembly, this Article helps explain it.'
    ),
    179: make(
      'County executive committees help run county government.',
      'If people ask who works with the governor to run county affairs, this Article helps explain it.'
    ),
    183: make(
      'County executive committees help carry out county work and decisions.',
      'If people ask what the county executive is supposed to do, this Article helps explain it.'
    ),
    184: make(
      'Parliament can make laws about urban areas and cities.',
      'If people ask how towns and cities should be managed under the law, this Article helps explain that Parliament can set rules.'
    ),
    185: make(
      'County assemblies can make laws for their counties.',
      'If a county needs its own law on a local matter, this Article helps explain where that power comes from.'
    ),
    186: make(
      'National and county governments have different jobs and powers.',
      'If people ask whether a matter belongs to national or county government, this Article helps explain that split.'
    ),
    189: make(
      'National and county governments should work together.',
      'If the two levels of government disagree, this Article helps explain that they should still cooperate.'
    ),
    190: make(
      'County governments can get support so they can do their work well.',
      'If a county is struggling to provide services, this Article helps explain why support can be given.'
    ),
    192: make(
      'A county government can only be suspended in rare serious situations.',
      'If people ask whether the national government can just shut down a county, this Article helps explain the limit.'
    ),
    194: make(
      'An MCA can lose their seat in some situations set by law.',
      'If an MCA resigns, dies, or stops meeting the rules, this Article helps explain what happens.'
    ),
    195: make(
      'A county assembly can call witnesses and evidence.',
      'If a county assembly is checking a serious issue, this Article helps explain that it can summon people and documents.'
    ),
    196: make(
      'County assemblies should work openly and involve the public.',
      'If people are shut out of county assembly work, this Article helps explain why public participation matters.'
    ),
    197: make(
      'County assemblies should reflect gender balance and diversity.',
      'If one kind of group fills almost all county assembly seats, this Article helps explain why balance matters.'
    ),
    198: make(
      'Special rules helped county governments start during the transition period.',
      'If people ask how counties were helped when devolution began, this Article gives part of that answer.'
    ),
    199: make(
      'County laws should be published so people can know them.',
      'If a county tries to enforce a law people cannot even find, this Article helps explain why publication matters.'
    ),
    202: make(
      'National money should be shared fairly.',
      'If people ask how national money should reach both levels of government, this Article helps explain the basic idea.'
    ),
    203: make(
      'Sharing national money should consider fairness and people needs.',
      'If one area has greater need or has been left behind, this Article helps explain why that matters in sharing money.'
    ),
    204: make(
      'The Equalisation Fund helps areas that have been left behind.',
      'If some parts of Kenya still lack basic services, this Article helps explain why extra support can go there.'
    ),
    205: make(
      'Counties should be consulted on money laws that affect them.',
      'If Parliament is making a financial law that will affect counties, this Article helps explain why counties should be heard.'
    ),
    206: make(
      'Public money should be kept in the right public funds.',
      'If people ask where government money is supposed to be kept, this Article helps explain the main funds.'
    ),
    207: make(
      'Each county should keep its money in its own revenue fund.',
      'If county money is being handled, this Article helps explain where that money should go.'
    ),
    208: make(
      'The Contingencies Fund is emergency public money.',
      'If there is an urgent need before normal budget steps can happen, this Article helps explain one emergency fund.'
    ),
    209: make(
      'National and county governments can charge taxes and fees in the way the Constitution allows.',
      'If people ask who is allowed to tax or charge fees, this Article helps explain the basic split.'
    ),
    210: make(
      'No tax should be charged unless the law allows it.',
      'If someone is forced to pay a tax that has no legal basis, this Article helps explain why that is wrong.'
    ),
    211: make(
      'The national government can borrow only under the law.',
      'If leaders want to borrow money for the country, this Article helps explain that they must follow legal rules.'
    ),
    212: make(
      'Counties can borrow only in the way the law allows.',
      'If a county wants to borrow money, this Article helps explain that it cannot do so anyhow.'
    ),
    213: make(
      'The national government can guarantee loans only under clear rules.',
      'If government wants to promise to cover another loan, this Article helps explain that legal limits still apply.'
    ),
    217: make(
      'National money should be divided fairly between national and county governments.',
      'If people ask how money is split between the two levels of government, this Article helps explain that process.'
    ),
    218: make(
      'Every year, Parliament passes laws to divide and allocate revenue.',
      'If people ask how annual revenue sharing becomes law, this Article helps explain that step.'
    ),
    220: make(
      'Budgets should be clear, complete, and prepared on time.',
      'If government hides important spending plans, this Article helps explain why budget details matter.'
    ),
    222: make(
      'Government can spend a limited amount before the full budget is passed.',
      'If the budget is not yet ready but urgent spending is needed, this Article helps explain that limited window.'
    ),
    225: make(
      'Public money must be controlled and used lawfully.',
      'If an office spends public money carelessly, this Article helps explain why financial control matters.'
    ),
    226: make(
      'Public bodies must keep proper accounts and be audited.',
      'If public money is used, this Article helps explain why records and audits are required.'
    ),
    243: make(
      'This Article sets up the National Police Service.',
      'If people ask where the police service comes from under the Constitution, this Article gives the answer.'
    ),
    244: make(
      'Police should protect people, keep order, and act lawfully.',
      'If police misuse power or fail to protect people, this Article helps explain what their job is supposed to be.'
    ),
    245: make(
      'This Article says who commands the police service.',
      'If people ask who leads the police and gives lawful directions, this Article helps explain it.'
    ),
    255: make(
      'Some parts of the Constitution can only be changed through a tougher process.',
      'If leaders want to change major parts of the Constitution, this Article helps explain why extra steps are needed.'
    ),
    256: make(
      'Parliament can start some changes to the Constitution.',
      'If leaders want to change the Constitution through Parliament, this Article helps explain that path.'
    ),
    257: make(
      'Ordinary people can also start some changes to the Constitution.',
      'If citizens want constitutional change through a popular initiative, this Article helps explain that path.'
    ),
    104: make(
      'If voters feel an MP has failed badly, the law may allow them to start a recall process.',
      'If people do not want to wait for the next election, this shows there can be a legal way to remove an MP.'
    ),
    160: make(
      'If judges are pushed by politicians or other powerful people, this shows why courts must stay free.',
      'If courts are to be fair, judges must be free to decide cases without fear or pressure.'
    ),
    219: make(
      'If county money is delayed, services like health or roads can suffer.',
      'If a county is waiting for its fair share of money, it should not be kept waiting for no good reason.'
    ),
    249: make(
      'If leaders misuse power, these offices help question them and protect the public.',
      'If people ask why Kenya has these offices, this Article gives the reason.'
    ),
    251: make(
      'If someone wants a member of this office removed, there must be a real reason and a fair process.',
      'If powerful people dislike that person, this shows they cannot just throw them out.'
    ),
    253: make(
      'If one of these offices needs to sign papers, own property, or go to court, this Article says it can do that.',
      'If people ask whether these offices can act like real legal bodies, this Article says yes.'
    ),
    259: make(
      'If a part of the Constitution is hard to understand, it should be read in a fair way that protects people.',
      'If leaders try to twist the meaning, this Article reminds us to read it by its true purpose.'
    ),
  });

  if (articleSpecific[articleNumber]) return articleSpecific[articleNumber];

  if (heading.includes('sovereignty of the people')) return make(
    'If a leader acts like power belongs to them alone, this reminds us power belongs to the people.',
    'If Kenyans vote, speak out, or demand better leadership, this shows why their voice matters.'
  );
  if (heading.includes('supremacy of this constitution')) return make(
    'If a leader or law goes against the Constitution, the Constitution still comes first.',
    'If people ask which rule is highest in Kenya, this gives the answer.'
  );
  if (heading.includes('defence of this constitution')) return make(
    'If someone tries to break the Constitution, people should not just keep quiet.',
    'If leaders misuse power, this reminds everyone to stand up for the Constitution.'
  );
  if (heading.includes('declaration of the republic')) return make(
    'If a child asks what kind of country Kenya is, this gives the simple answer.',
    'If people talk about Kenya as one country with one republic, this is the rule behind it.'
  );
  if (heading.includes('territory of kenya')) return make(
    'If people argue about Kenya’s land, coast, or waters, this helps show what belongs to Kenya.',
    'If there is a border question, this is one place to start.'
  );
  if (heading.includes('devolution and access to services')) return make(
    'If people in a village are far from health care or government services, this shows services should come closer.',
    'If a county office is meant to bring help near the people, this helps explain why.'
  );
  if (heading.includes('languages')) return make(
    'If a child asks why English and Kiswahili are used in many public places, this helps explain it.',
    'If people want local languages respected too, this shows language matters in Kenya.'
  );
  if (heading.includes('state and religion')) return make(
    'If one religion tries to act like it is Kenya’s official religion, this says Kenya does not have one.',
    'If people pray in different ways, this helps explain why the State should treat them equally.'
  );
  if (heading.includes('national symbols')) return make(
    'If a child asks why the flag, anthem, and coat of arms matter, this helps explain it.',
    'If people want to know why Kenya has special national days, this gives the starting idea.'
  );
  if (heading.includes('national values')) return make(
    'If a leader lies, steals, or treats people badly, this reminds us Kenya should be led with honesty and fairness.',
    'If people ask what values should guide public life, this gives the basic list.'
  );
  if (heading.includes('entitlements of citizens')) return make(
    'If you are Kenyan and need an ID or passport, this helps explain why you should be able to get one.',
    'If an office refuses to treat you like a citizen for no good reason, this shows why that is wrong.'
  );
  if (heading.includes('retention and acquisition of citizenship')) return make(
    'If a person wants to know when they keep Kenyan citizenship, this helps explain it.',
    'If someone is trying to become Kenyan in a lawful way, this gives a starting point.'
  );
  if (heading.includes('citizenship by birth')) return make(
    'If a child is born and one parent is Kenyan, this helps explain when that child is Kenyan from birth.',
    'If a family asks why their child is Kenyan from birth, this gives the basic answer.'
  );
  if (heading.includes('dual citizenship')) return make(
    'If a Kenyan also has citizenship of another country, this helps explain when that is allowed.',
    'If a family is linked to Kenya and another country, this can matter.'
  );
  if (heading.includes('rights and fundamental freedoms') && !heading.includes('limitation')) return make(
    'If someone asks why rights matter in everyday life, this shows rights are there to protect every person.',
    'If a leader treats rights like a small favour, this reminds us rights must be taken seriously.'
  );
  if (heading.includes('application of bill of rights')) return make(
    'If someone says rights are only for rich people or court cases, this shows rights are for everyone.',
    'If a child, worker, patient, or prisoner needs protection, this helps explain why the Bill of Rights still matters.'
  );
  if (heading.includes('implementation of rights and fundamental freedoms')) return make(
    'If leaders know people are suffering and do nothing, this shows the State must work to protect rights.',
    'If rights exist on paper but no one acts, this explains why government must do more than talk.'
  );
  if (heading.includes('enforcement of bill of rights')) return make(
    'If your rights are broken, this shows you can go to court.',
    'If a parent, friend, or group wants to help someone whose rights were broken, this helps explain that too.'
  );
  if (heading.includes('authority of courts to uphold and enforce the bill of rights')) return make(
    'If a court finds that your rights were broken, this shows the court can make orders to help fix it.',
    'If leaders ignore rights, this helps explain why courts can step in.'
  );
  if (heading.includes('limitation of rights and fundamental freedoms')) return make(
    'If government wants to limit a right, it must have a real law and a very good reason.',
    'If leaders try to restrict rights too much, this shows the limit must still be fair and necessary.'
  );
  if (heading.includes('equality and freedom from discrimination')) return make(
    'If a school, job, or office treats you badly because of tribe, sex, disability, religion, or another personal reason, this shows why that is wrong.',
    'If two people need the same service but one is pushed away unfairly, this reminds us everyone should be treated equally.'
  );
  if (heading.includes('human dignity')) return make(
    'If someone is insulted, shamed, or treated like they do not matter, this reminds us every person deserves respect.',
    'If a public officer or employer humiliates someone, this shows why dignity matters.'
  );
  if (heading.includes('freedom and security of the person')) return make(
    'If someone is beaten, threatened, or treated cruelly, this shows that is not okay under the Constitution.',
    'If a person is taken away or hurt violently, this explains why people must be safe.'
  );
  if (heading.includes('freedom of conscience, religion, belief and opinion')) return make(
    'If a student or worker is punished for their religion or belief, this shows why that is wrong.',
    'If a person chooses to pray, not pray, or believe differently, this explains that they still have rights.'
  );
  if (heading.includes('freedom of association')) return make(
    'If workers, parents, or neighbours want to form a lawful group, this shows they can join together.',
    'If someone is punished for joining a union or another lawful group, this explains why that is wrong.'
  );
  if (heading.includes('political rights')) return make(
    'If you want to vote, join politics, or stand for office, this shows those are your political rights.',
    'If someone is blocked from political participation for no good legal reason, this explains why that is a problem.'
  );
  if (heading.includes('freedom of movement and residence')) return make(
    'If you want to move to another town or county in Kenya, this shows you should be free to do that.',
    'If someone is chased away from a place just because of who they are, this explains why that is wrong.'
  );
  if (heading.includes('environment') && !heading.includes('legislation') && !heading.includes('obligations') && !heading.includes('enforcement')) return make(
    'If dirty water, smoke, or waste is making an area unsafe, this shows why a clean environment matters.',
    'If children are growing up near pollution, this helps explain why people can complain.'
  );
  if (heading.includes('family')) return make(
    'If people want to marry and build a family freely, this shows family is important under the Constitution.',
    'If family life is controlled unfairly, this helps explain why respect in family matters.'
  );
  if (heading.includes('consumer rights')) return make(
    'If you buy food, medicine, or another product that is unsafe, this shows buyers should be protected.',
    'If a company lies about what it is selling or cheats customers, this explains why consumers have rights.'
  );
  if (heading.includes('fair administrative action')) return make(
    'If a public office delays, ignores you, or makes a decision without hearing you fairly, this shows that is a problem.',
    'If an office keeps your name or records wrong and refuses to fix them, this explains why public offices should act fairly.'
  );
  if (heading.includes('youth')) return make(
    'If young people are left out of jobs, education, or chances to grow, this shows why youth should be supported.',
    'If leaders ignore the needs of young people, this explains why youth still deserve real opportunities.'
  );
  if (heading.includes('minorities and marginalised groups')) return make(
    'If a small community is always left out of roads, schools, clinics, or leadership, this shows why that is unfair.',
    'If a marginalised group is ignored again and again, this explains why they should get a fair share of chances and services.'
  );
  if (heading.includes('older members of society')) return make(
    'If an older person is neglected or treated like they no longer matter, this shows older people still have rights.',
    'If grandparents need care, respect, and dignity, this helps explain why that matters.'
  );
  if (heading.includes('state of emergency')) return make(
    'If there is a big national emergency, this shows leaders still must follow rules.',
    'If government says there is an emergency and wants extra power, this explains why people still need protection.'
  );
  if (heading.includes('human rights and equality commission')) return make(
    'If people need a public body to speak up about rights and unfair treatment, this shows why that commission exists.',
    'If rights problems keep happening, this helps explain why citizens need such a commission.'
  );
  if (heading.includes('auditor-general')) return make(
    'If people ask who checks whether county or national money was spent honestly, this points to that office.',
    'If public money goes missing, this office helps check the books.'
  );
  if (heading.includes('principles of public finance')) return make(
    'If leaders collect taxes, they should use that money fairly and carefully.',
    'If people ask where public money went, this shows the rules should be clear and honest.'
  );
  if (heading.includes('procurement')) return make(
    'If a county buys desks, medicine, or roads at a fake high price, this shows public buying should be fair.',
    'If leaders give contracts to friends unfairly, this helps explain why that is wrong.'
  );
  if (heading.includes('controller of budget')) return make(
    'If people ask who checks money before it is spent, this points to that office.',
    'If government wants to release public money, this office helps watch that process.'
  );
  if (heading.includes('salaries and remuneration')) return make(
    'If people ask who helps set pay for State officers, this gives the answer.',
    'If leaders try to set their own pay unfairly, this shows there should be an independent body.'
  );
  if (heading.includes('central bank')) return make(
    'If people ask who helps manage Kenya’s money system, this points to that bank.',
    'If the country needs a trusted bank for big money matters, this helps explain why it exists.'
  );
  if (heading.includes('public service commission')) return make(
    'If people ask who helps manage public service jobs fairly, this points to that commission.',
    'If public workers are hired or treated unfairly, this body can matter.'
  );
  if (heading.includes('teachers service commission')) return make(
    'If teachers need a body that handles their work matters, this helps explain why it exists.',
    'If a teacher is treated unfairly at work, this commission can matter.'
  );
  if (heading.includes('principles of national security')) return make(
    'If police, soldiers, or intelligence officers use power, they should still follow the law.',
    'If people want safety without abuse, this helps explain that balance.'
  );
  if (heading.includes('national police service')) return make(
    'If people ask what the police are supposed to do, this helps explain their job.',
    'If police misuse power, this helps show they are meant to protect people, not frighten them.'
  );
  if (heading.includes('national intelligence service')) return make(
    'If people ask which body gathers intelligence for national safety, this points to it.',
    'If security work is being discussed, this helps explain one of the main bodies involved.'
  );
  if (heading.includes('kenya defence forces')) return make(
    'If people ask who defends Kenya from serious threats, this points to the Defence Forces.',
    'If national defence is being discussed, this helps explain which force is involved.'
  );
  if (heading.includes('amendment')) return make(
    'If people want to change the Constitution, they cannot do it any old way.',
    'If citizens ask whether change can start in Parliament or from the people, this helps explain that path.'
  );
  if (heading.includes('effective date')) return make(
    'If people ask when this Constitution started working, this gives the date idea.',
    'If someone wants to know when the new rules began, this answers that.'
  );
  if (heading.includes('repeal of previous constitution')) return make(
    'If people ask whether the old Constitution still applies, this says it does not.',
    'If someone wants to know which Constitution now guides Kenya, this gives the answer.'
  );
  if (heading.includes('interpretation')) return make(
    'If a word in the Constitution is hard to understand, this helps explain its meaning.',
    'If people argue about what a constitutional word means, this matters.'
  );
  if (heading.includes('election') || heading.includes('electoral') || heading.includes('voter') || heading.includes('political parties') || heading.includes('party list') || heading.includes('delimitation')) return make(
    'If people are voting, counting votes, or choosing candidates, this helps show how that part should work.',
    'If an election is unfair or confusing, this helps explain one of the rules that should guide it.'
  );
  if (heading.includes('parliament') || heading.includes('senate') || heading.includes('national assembly') || heading.includes('bill') || heading.includes('petition') || heading.includes('speaker') || heading.includes('quorum') || heading.includes('committee') || heading.includes('parliamentary')) return make(
    'If Parliament is debating a law or doing its work, this helps show how that part should happen.',
    'If people want Parliament to listen, vote properly, or follow the right steps, this can matter.'
  );
  if (heading.includes('president') || heading.includes('deputy president') || heading.includes('cabinet') || heading.includes('principal secretaries') || heading.includes('attorney-general') || heading.includes('public prosecutions') || heading.includes('mercy')) return make(
    'If the President or top national leaders are using power, this helps show how that part should work.',
    'If people ask who is allowed to do what at the top of government, this can matter.'
  );
  if (heading.includes('judicial') || heading.includes('court') || heading.includes('judge') || heading.includes('kadhi')) return make(
    'If a case goes to court, this helps show how that part of the court system should work.',
    'If people ask which judges, courts, or judicial bodies are involved, this can matter.'
  );
  if (heading.includes('county') || heading.includes('governor') || heading.includes('devolution') || heading.includes('urban areas') || heading.includes('city')) return make(
    'If people ask how county leaders or county services should work, this helps explain that part.',
    'If a county service fails or county leaders disagree, this can matter.'
  );
  if (heading.includes('revenue') || heading.includes('tax') || heading.includes('budget') || heading.includes('appropriation') || heading.includes('fund') || heading.includes('financial') || heading.includes('borrow') || heading.includes('loan') || heading.includes('audit')) return make(
    'If public money is being collected, shared, borrowed, or spent, this helps show one of the rules.',
    'If people ask where tax money went or who is checking the books, this can matter.'
  );
  if (heading.includes('commission') || heading.includes('independent office') || heading.includes('reporting by commissions') || heading.includes('composition, appointment')) return make(
    'If an independent public body needs to do its work fairly, this helps show how that part should work.',
    'If people ask how a commission is formed, protected, or made to report, this can matter.'
  );

  if (chapter.includes('legislature')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} works in Parliament, this helps explain it.`,
    'If a law, seat, debate, or petition is involved, this can help show the rule.'
  );
  if (chapter.includes('executive')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} works in the top national government, this helps explain it.`,
    'If the President, Deputy President, or Cabinet is involved, this can matter.'
  );
  if (chapter.includes('judiciary')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} works in the courts, this helps explain it.`,
    'If a case, judge, or court process is involved, this can matter.'
  );
  if (chapter.includes('devolution')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} works in county government, this helps explain it.`,
    'If a county service is failing or county leaders disagree, this can matter.'
  );
  if (chapter.includes('finance')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} affects public money, this helps explain it.`,
    'If taxes, budgets, loans, or public spending are involved, this can matter.'
  );
  if (chapter.includes('security')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} affects Kenya’s safety, this helps explain it.`,
    'If police or other security officers are involved, this can matter.'
  );
  if (chapter.includes('commissions')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} works in an independent office, this helps explain it.`,
    'If a public body needs to work without political pressure, this can matter.'
  );
  if (chapter.includes('transition')) return make(
    `If people ask how ${canonicalArticle.heading.toLowerCase()} helped Kenya move to the new Constitution, this helps explain it.`,
    'If someone wants to understand the change from the old system, this can matter.'
  );

  return buildCitizenExamples(canonicalArticle, canonicalArticle.part?.heading || '');
}

function buildCitizenExamples(canonicalArticle, chapterTitle) {
  const heading = canonicalArticle.heading.toLowerCase();
  const chapter = String(chapterTitle || '').toLowerCase();

  if (heading.includes('citizenship by registration')) {
    return {
      examples: [
        'If you are married to a Kenyan and have met the time required by law, you can apply to become a citizen.',
        'If you have lived in Kenya lawfully for many years and meet the legal rules, this Article helps explain your path to citizenship.',
      ],
      swExamples: [
        'Ikiwa umeolewa au umeoa Mkenya na umetimiza muda unaotakiwa na sheria, unaweza kuomba kuwa raia.',
        'Ikiwa umeishi Kenya kihalali kwa miaka mingi na umetimiza masharti ya sheria, ibara hii husaidia kueleza njia yako ya kupata uraia.',
      ],
    };
  }

  if (heading.includes('citizenship by birth')) {
    return {
      examples: [
        'If a child is born and one parent is Kenyan, this Article helps explain when that child is a citizen by birth.',
        'If someone asks why you are Kenyan from birth, this Article gives the basic answer.',
      ],
      swExamples: [
        'Mtoto akizaliwa na mzazi mmoja akiwa Mkenya, ibara hii husaidia kueleza mtoto huyo anakuwa raia kwa kuzaliwa lini.',
        'Mtu akiuliza kwa nini wewe ni Mkenya kwa kuzaliwa, ibara hii hutoa jibu la msingi.',
      ],
    };
  }

  if (heading.includes('retention and acquisition of citizenship')) {
    return {
      examples: [
        'If you already have Kenyan citizenship and want to know when you keep it, this Article helps explain that.',
        'If you are trying to become a citizen, this Article gives the starting rule.',
      ],
      swExamples: [
        'Ikiwa tayari una uraia wa Kenya na unataka kujua wakati unaendelea nao, ibara hii husaidia kueleza hilo.',
        'Ikiwa unajaribu kuwa raia, ibara hii hutoa kanuni ya kuanzia.',
      ],
    };
  }

  if (heading.includes('entitlements of citizens')) {
    return {
      examples: [
        'If you are a Kenyan and need an ID, passport, or protection from the State, this Article helps explain what you are entitled to.',
        'If an office refuses to treat you as a citizen without good reason, this Article matters.',
      ],
      swExamples: [
        'Ikiwa wewe ni Mkenya na unahitaji kitambulisho, pasipoti, au ulinzi wa serikali, ibara hii husaidia kueleza unachostahili.',
        'Ofisi ikikataa kukutambua kama raia bila sababu nzuri, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('dual citizenship')) {
    return {
      examples: [
        'If you are Kenyan and also have citizenship of another country, this Article helps explain when that is allowed.',
        'If a family has children linked to Kenya and another country, this Article can matter.',
      ],
      swExamples: [
        'Ikiwa wewe ni Mkenya na pia una uraia wa nchi nyingine, ibara hii husaidia kueleza wakati hilo linaruhusiwa.',
        'Familia ikiwa na watoto wanaohusishwa na Kenya na nchi nyingine, ibara hii inaweza kuwa muhimu.',
      ],
    };
  }

  if (heading.includes('revocation of citizenship')) {
    return {
      examples: [
        'If someone became a citizen by lying in their application, this Article helps explain when that citizenship can be taken away.',
        'If the government wants to cancel citizenship that was given by registration, this Article explains when that can happen.',
      ],
      swExamples: [
        'Mtu akipata uraia kwa kusema uongo katika ombi lake, ibara hii husaidia kueleza uraia huo unaweza kuondolewa lini.',
        'Serikali ikitaka kufuta uraia uliotolewa kwa usajili, ibara hii hueleza hilo linaweza kutokea lini.',
      ],
    };
  }

  if (heading.includes('legislation on citizenship')) {
    return {
      examples: [
        'If you want to know what law explains citizenship forms, registration, or other citizenship procedures, this Article points to that law.',
        'If a person is applying for citizenship, an ID, or a passport and needs the rules used, this Article helps explain where those rules come from.',
      ],
      swExamples: [
        'Ukitaka kujua sheria inayozungumzia fomu za uraia, usajili, au taratibu nyingine za uraia, ibara hii inaelekeza kwa sheria hiyo.',
        'Mtu akiomba uraia, kitambulisho, au pasipoti na anahitaji kujua sheria zinazotumika, ibara hii husaidia kueleza sheria hizo zinatoka wapi.',
      ],
    };
  }

  if (heading.includes('territory')) {
    return {
      examples: [
        'If there is a question about what land or waters are part of Kenya, this Article gives the basic rule.',
        'If leaders or courts are discussing the borders of Kenya, this Article matters.',
      ],
      swExamples: [
        'Kukiwa na swali kuhusu ardhi au maji gani ni sehemu ya Kenya, ibara hii hutoa kanuni ya msingi.',
        'Viongozi au mahakama wakijadili mipaka ya Kenya, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('culture')) {
    return {
      examples: [
        'If a community wants its language, traditions, or way of life respected, this Article helps explain why that matters.',
        'If school, media, or leaders ignore Kenyan cultures completely, this Article gives an important reminder.',
      ],
      swExamples: [
        'Jamii ikitaka lugha yake, mila zake, au maisha yake yaheshimiwe, ibara hii husaidia kueleza kwa nini hilo ni muhimu.',
        'Shule, vyombo vya habari, au viongozi wakipuuza kabisa tamaduni za Kenya, ibara hii hutoa ukumbusho muhimu.',
      ],
    };
  }

  if (heading.includes('fundamental rights and freedoms that may not be limited')) {
    return {
      examples: [
        'If the State tries to torture someone or deny them a fair trial, this Article helps explain that some rights are too important to remove.',
        'Even in hard times, some basic rights must still be respected. This Article says which ones are that important.',
      ],
      swExamples: [
        'Serikali ikijaribu kumtesa mtu au kumnyima kesi ya haki, ibara hii husaidia kueleza kuwa baadhi ya haki ni muhimu sana haziwezi kuondolewa.',
        'Hata nyakati ngumu zikiwepo, baadhi ya haki za msingi lazima ziheshimiwe. Ibara hii inaonyesha zipi ni muhimu hivyo.',
      ],
    };
  }

  if (heading.includes('national assembly')) {
    return {
      examples: [
        'If people want to know what the National Assembly is supposed to do for them, this Article gives the basic job description.',
        'If Parliament is debating taxes, budgets, or new laws, this Article helps explain the Assembly’s role.',
      ],
      swExamples: [
        'Wananchi wakitaka kujua Bunge la Kitaifa linapaswa kuwafanyia nini, ibara hii hutoa maelezo ya kazi yake ya msingi.',
        'Bunge likijadili kodi, bajeti, au sheria mpya, ibara hii husaidia kueleza nafasi ya Bunge la Kitaifa.',
      ],
    };
  }

  if (heading.includes('conflict of laws')) {
    return {
      examples: [
        'If a county law says one thing and a national law says another, this Article helps explain which rule should guide people.',
        'If local leaders and national leaders disagree about the law, this Article helps sort out the conflict.',
      ],
      swExamples: [
        'Sheria ya kaunti ikisema jambo moja na sheria ya kitaifa ikasema jambo jingine, ibara hii husaidia kueleza ni kanuni ipi ifuate.',
        'Viongozi wa eneo na viongozi wa kitaifa wakitofautiana kuhusu sheria, ibara hii husaidia kutatua mgongano huo.',
      ],
    };
  }

  if (heading.includes('interpretation')) {
    return {
      examples: [
        'If people do not understand a word used in the Constitution, this Article helps explain what that word means.',
        'If a court or lawyer is arguing about the meaning of a constitutional word, this Article matters.',
      ],
      swExamples: [
        'Watu wasipoelewa neno lililotumika katika Katiba, ibara hii husaidia kueleza maana ya neno hilo.',
        'Mahakama au wakili wakibishana kuhusu maana ya neno la kikatiba, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('life')) {
    return {
      examples: [
        'If a person is in serious danger or needs emergency treatment, this Article matters because life must be protected.',
        'If someone dies because others acted carelessly or violently, this Article helps explain why life is a basic right.',
      ],
      swExamples: [
        'Mtu akiwa hatarini sana au akihitaji matibabu ya dharura, ibara hii ni muhimu kwa sababu maisha lazima yalindwe.',
        'Mtu akifa kwa sababu wengine walitenda kwa uzembe au vurugu, ibara hii husaidia kueleza kwa nini maisha ni haki ya msingi.',
      ],
    };
  }

  if (heading.includes('privacy')) {
    return {
      examples: [
        'If someone wants to search your phone, enter your house, or read your messages without good reason, this Article matters.',
        'If your private information is shared carelessly, this Article helps explain why that is wrong.',
      ],
      swExamples: [
        'Mtu akitaka kupekua simu yako, kuingia nyumbani kwako, au kusoma ujumbe wako bila sababu nzuri, ibara hii ni muhimu.',
        'Taarifa zako za siri zikisambazwa ovyo, ibara hii husaidia kueleza kwa nini hilo ni kosa.',
      ],
    };
  }

  if (heading.includes('arrested persons') || heading.includes('detained') || heading.includes('custody')) {
    return {
      examples: [
        'If police arrest you, this Article helps explain what they must tell you and what rights you still have.',
        'If you are arrested and want a lawyer, to stay silent, or to know the reason for your arrest, this Article matters.',
      ],
      swExamples: [
        'Polisi wakikukamata, ibara hii husaidia kueleza wanapaswa kukuambia nini na bado una haki gani.',
        'Ukikamatwa na unataka wakili, kubaki kimya, au kujua sababu ya kukamatwa kwako, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('fair hearing') || heading.includes('fair trial')) {
    return {
      examples: [
        'If your case goes to court, this Article helps explain what a fair hearing should look like.',
        'If a person is judged without being heard properly, this Article helps explain why that is wrong.',
      ],
      swExamples: [
        'Kesi yako ikienda mahakamani, ibara hii husaidia kueleza kusikilizwa kwa haki kunapaswa kufanana na nini.',
        'Mtu akihukumiwa bila kusikilizwa vizuri, ibara hii husaidia kueleza kwa nini hilo si haki.',
      ],
    };
  }

  if (heading.includes('expression') || heading.includes('media') || heading.includes('information')) {
    return {
      examples: [
        'If you want to speak about a public problem, ask questions, or share ideas, this Article helps explain your freedom.',
        'If a journalist, student, or citizen is silenced unfairly, this Article matters.',
      ],
      swExamples: [
        'Ukitaka kuzungumzia tatizo la umma, kuuliza maswali, au kushiriki mawazo, ibara hii husaidia kueleza uhuru wako.',
        'Mwandishi wa habari, mwanafunzi, au raia akinyamazishwa bila haki, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('assembly') || heading.includes('petition')) {
    return {
      examples: [
        'If people in your area want to protest peacefully or give a petition to leaders, this Article helps explain that right.',
        'If police try to stop a peaceful public action without good reason, this Article matters.',
      ],
      swExamples: [
        'Watu wa eneo lenu wakitaka kuandamana kwa amani au kupeleka ombi kwa viongozi, ibara hii husaidia kueleza haki hiyo.',
        'Polisi wakijaribu kuzuia hatua ya umma ya amani bila sababu nzuri, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('property') || heading.includes('land') || chapter.includes('land')) {
    return {
      examples: [
        'If someone wants to take your land, house, or property unfairly, this Article helps explain your protection.',
        'If there is a family land dispute, eviction issue, or community land problem, this Article can matter.',
      ],
      swExamples: [
        'Mtu akitaka kuchukua ardhi, nyumba, au mali yako bila haki, ibara hii husaidia kueleza ulinzi wako.',
        'Kukiwa na mgogoro wa ardhi ya familia, kufukuzwa, au shida ya ardhi ya jamii, ibara hii inaweza kuwa muhimu.',
      ],
    };
  }

  if (heading.includes('labour') || heading.includes('employment') || heading.includes('worker')) {
    return {
      examples: [
        'If your boss refuses to pay you fairly or treats workers badly, this Article helps explain what is fair.',
        'If workers want safe conditions, fair pay, or a union, this Article matters.',
      ],
      swExamples: [
        'Boss wako akikataa kukulipa kwa haki au kuwatendea wafanyakazi vibaya, ibara hii husaidia kueleza kilicho cha haki.',
        'Wafanyakazi wakitaka mazingira salama, malipo ya haki, au chama, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('health') || heading.includes('social')) {
    return {
      examples: [
        'If a family cannot get clean water, food, housing, education, or medical care, this Article helps explain why those needs matter.',
        'If a public hospital or school fails people badly, this Article can help show the basic promise in the Constitution.',
      ],
      swExamples: [
        'Familia isipopata maji safi, chakula, makazi, elimu, au huduma za afya, ibara hii husaidia kueleza kwa nini mahitaji hayo ni muhimu.',
        'Hospitali au shule ya umma ikiwafeli watu vibaya, ibara hii inaweza kusaidia kuonyesha ahadi ya msingi ya Katiba.',
      ],
    };
  }

  if (heading.includes('children')) {
    return {
      examples: [
        'If a child is denied school, food, shelter, or safety, this Article helps explain the child’s rights.',
        'If adults make a decision that harms a child, this Article reminds us that the child should come first.',
      ],
      swExamples: [
        'Mtoto akinyimwa shule, chakula, makazi, au usalama, ibara hii husaidia kueleza haki za mtoto.',
        'Watu wazima wakifanya uamuzi unaomdhuru mtoto, ibara hii hutukumbusha kuwa mtoto anapaswa kupewa nafasi ya kwanza.',
      ],
    };
  }

  if (heading.includes('disabilities') || heading.includes('disability')) {
    return {
      examples: [
        'If a child with a disability is blocked from school or a public building, this Article helps explain why that is unfair.',
        'If a person with a disability is ignored when services are being planned, this Article matters.',
      ],
      swExamples: [
        'Mtoto mwenye ulemavu akizuiwa kuingia shule au jengo la umma, ibara hii husaidia kueleza kwa nini hilo si haki.',
        'Mtu mwenye ulemavu akipuuzwa wakati huduma zinapopangwa, ibara hii ni muhimu.',
      ],
    };
  }

  if (heading.includes('court') || heading.includes('justice') || heading.includes('hearing') || chapter.includes('judiciary')) {
    return {
      examples: [
        'If your case is delayed, hidden, or handled unfairly, this Article helps explain what a fair process should look like.',
        'If someone is taken to court, they should be heard properly. This Article helps explain that basic idea.',
      ],
      swExamples: [
        'Kesi yako ikicheleweshwa, kufichwa, au kushughulikiwa bila haki, ibara hii husaidia kueleza mchakato wa haki unapaswa kufanana na nini.',
        'Mtu akipelekwa mahakamani, anapaswa kusikilizwa vizuri. Ibara hii husaidia kueleza wazo hilo la msingi.',
      ],
    };
  }

  if (chapter.includes('executive')) {
    return {
      examples: [
        'If people want to know what the President or top national leaders can do, this Article helps explain it.',
        'If there is a question about how executive power should be used, this Article matters.',
      ],
      swExamples: [
        'Wananchi wakitaka kujua Rais au viongozi wakuu wa kitaifa wanaweza kufanya nini, ibara hii husaidia kueleza hilo.',
        'Kukiwa na swali kuhusu jinsi mamlaka ya utendaji yanapaswa kutumiwa, ibara hii ni muhimu.',
      ],
    };
  }

  if (chapter.includes('devolution')) {
    return {
      examples: [
        'If people want to know what county government should do and what national government should do, this Article helps explain the difference.',
        'If a county service is failing and people are asking who is responsible, this Article can matter.',
      ],
      swExamples: [
        'Watu wakitaka kujua serikali ya kaunti inapaswa kufanya nini na serikali ya kitaifa inapaswa kufanya nini, ibara hii husaidia kueleza tofauti hiyo.',
        'Huduma ya kaunti ikifeli na watu wakitaka kujua nani anawajibika, ibara hii inaweza kuwa muhimu.',
      ],
    };
  }

  if (chapter.includes('finance')) {
    return {
      examples: [
        'If people ask where tax money goes or how public money should be used, this Article helps explain the rule.',
        'If leaders spend public money carelessly, this Article matters.',
      ],
      swExamples: [
        'Watu wakiuliza pesa za kodi zinaenda wapi au pesa za umma zinapaswa kutumika vipi, ibara hii husaidia kueleza kanuni.',
        'Viongozi wakitumia pesa za umma ovyo, ibara hii ni muhimu.',
      ],
    };
  }

  if (chapter.includes('security')) {
    return {
      examples: [
        'If police, soldiers, or security officers are using power, this Article helps explain what their job should be.',
        'If people are worried about safety but also want the law followed, this Article matters.',
      ],
      swExamples: [
        'Polisi, wanajeshi, au maafisa wa usalama wakitumia mamlaka, ibara hii husaidia kueleza kazi yao inapaswa kuwa nini.',
        'Watu wakihofia usalama lakini pia wanataka sheria ifuatwe, ibara hii ni muhimu.',
      ],
    };
  }

  const simpleContext = getSimpleContext(canonicalArticle, chapterTitle);
  return {
    examples: [
      `If there is a problem about ${simpleContext.subject}, this Article helps you know the basic rule.`,
      `For example, if something happens in ${simpleContext.place}, this Article helps explain what should happen next.`,
    ],
    swExamples: [
      `Kukiwa na tatizo kuhusu ${canonicalArticle.heading}, ibara hii husaidia ujue kanuni ya msingi.`,
      `Kwa mfano, jambo likitokea katika ${simpleContext.place} chini ya ${chapterTitle || 'Katiba'}, ibara hii husaidia kueleza kinachopaswa kufuata.`,
    ],
  };
}

function buildDraftSimplified(canonicalArticle, legacyExplainer) {
  return {
    simplified: legacyExplainer?.simplified || buildWhatThisMeans(canonicalArticle),
    swSimplified: `Ibara hii inahusu ${legacyExplainer?.swTitle || canonicalArticle.heading}. Kwa maneno rahisi, inaeleza kile Katiba inalinda, inaruhusu, au inahitaji katika eneo hili.`,
    status: legacyExplainer?.simplified ? 'seeded-from-legacy' : 'draft-generated',
    reviewStatus: legacyExplainer?.simplified ? 'reviewed' : 'draft',
  };
}

function buildArticleSpecificExamples(canonicalArticle, chapterTitle) {
  return {
    ...buildCitizenExamples(canonicalArticle, chapterTitle),
    exampleStatus: 'generated-article-specific',
    exampleSources: [],
  };
}

function looksEnglishHeavy(text) {
  return /(?:\bthe\b|\bthis\b|\bthese\b|\bthose\b|\bpeople\b|\bright(?:s)?\b|\bgovernment\b|\bparliament\b|\bconstitution\b|\barticle\b|\bpresident\b|\bcourt(?:s)?\b|\boffice(?:s)?\b|\bis\b|\bare\b|\band\b|\bone\b|\bcountry\b|\bmust\b|\bshould\b|\bcan\b|\bmay\b|\bwhen\b|\bwhere\b|\bwho\b|\bwhat\b|\bwhy\b|\bhow\b|\bapplication\b|\bimplementation\b|\benforcement\b|\blegislation\b|\brevocation\b|\bterritory\b|\bculture\b|\bauthority\b|\blimitation\b|\bequality\b|\bfreedom\b|\bhuman\b|\bdignity\b|\bprivacy\b|\bworker(?:s)?\b|\bconsumer\b|\binformation\b|\bassociation\b|\bmovement\b|\bresidence\b|\bfamily\b|\byouth\b|\bolder\b|\bemergency\b|\bservice\b|\bservices\b)/i.test(text || '');
}

function lowerFirst(value) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function translateSharedPhrasesToSwahili(text) {
  const replacements = [
    ['Territory of Kenya', 'Eneo la Kenya'],
    ['Declaration of the Republic', 'Tamko la Jamhuri'],
    ['National values and principles of governance', 'Maadili ya kitaifa na kanuni za utawala'],
    ['Entitlements of citizens', 'Haki za raia'],
    ['Retention and acquisition of citizenship', 'Kubaki na kupata uraia'],
    ['Citizenship by birth', 'Uraia kwa kuzaliwa'],
    ['Citizenship by registration', 'Uraia kwa usajili'],
    ['Dual citizenship', 'Uraia wa nchi mbili'],
    ['Revocation of citizenship', 'Kuondolewa kwa uraia'],
    ['Legislation on citizenship', 'Sheria kuhusu uraia'],
    ['Rights and fundamental freedoms', 'Haki na uhuru wa msingi'],
    ['Application of Bill of Rights', 'Matumizi ya Muswada wa Haki'],
    ['Implementation of rights and fundamental freedoms', 'Utekelezaji wa haki na uhuru wa msingi'],
    ['Enforcement of Bill of Rights', 'Utekelezaji wa Muswada wa Haki'],
    ['Authority of courts to uphold and enforce the Bill of Rights', 'Mamlaka ya mahakama kulinda na kutekeleza Muswada wa Haki'],
    ['Limitation of rights and fundamental freedoms', 'Kuweka mipaka kwa haki na uhuru wa msingi'],
    ['Fundamental Rights and freedoms that may not be limited', 'Haki na uhuru wa msingi ambao hauwezi kupunguzwa'],
    ['Right to life', 'Haki ya maisha'],
    ['Equality and freedom from discrimination', 'Usawa na uhuru dhidi ya ubaguzi'],
    ['Human dignity', 'Utu wa binadamu'],
    ['Freedom and security of the person', 'Uhuru na usalama wa mtu'],
    ['Slavery, servitude and forced labour', 'Utumwa, utumishi na kazi ya kulazimishwa'],
    ['Freedom of conscience, religion, belief and opinion', 'Uhuru wa dhamiri, dini, imani na maoni'],
    ['Freedom of expression', 'Uhuru wa kujieleza'],
    ['Freedom of the media', 'Uhuru wa vyombo vya habari'],
    ['Access to information', 'Kupata habari'],
    ['Freedom of association', 'Uhuru wa kujumuika'],
    ['Assembly, demonstration, picketing and petition', 'Mikusanyiko, maandamano, piketi na malalamiko'],
    ['Political rights', 'Haki za kisiasa'],
    ['Freedom of movement and residence', 'Uhuru wa kutembea na kuishi'],
    ['Labour relations', 'Mahusiano ya kazi'],
    ['Consumer rights', 'Haki za watumiaji'],
    ['Fair administrative action', 'Hatua ya kiutawala ya haki'],
    ['Rights of arrested persons', 'Haki za waliokamatwa'],
    ['Rights of persons detained, held in custody or imprisoned', 'Haki za waliozuiliwa au kufungwa'],
    ['Persons with disabilities', 'Watu wenye ulemavu'],
    ['Older members of society', 'Wazee katika jamii'],
    ['State of emergency', 'Hali ya hatari'],
    ['Principles of land policy', 'Kanuni za sera ya ardhi'],
    ['Community land', 'Ardhi ya jamii'],
    ['Private land', 'Ardhi ya kibinafsi'],
    ['Regulation of land use and property', 'Udhibiti wa matumizi ya ardhi na mali'],
    ['Legislation on land', 'Sheria kuhusu ardhi'],
    ['Obligations in respect of the environment', 'Wajibu kuhusu mazingira'],
    ['Enforcement of environmental rights', 'Utekelezaji wa haki za mazingira'],
    ['Legislation relating to the environment', 'Sheria kuhusu mazingira'],
    ['Responsibilities of leadership', 'Majukumu ya uongozi'],
    ['Conduct of State officers', 'Maadili ya maafisa wa Serikali'],
    ['Financial probity of State officers', 'Uaminifu wa kifedha wa maafisa wa Serikali'],
    ['Restriction on activities of State officers', 'Vizuizi kwa shughuli za maafisa wa Serikali'],
    ['Citizenship and leadership', 'Uraia na uongozi'],
    ['Legislation to establish the ethics and anti-corruption commission', 'Sheria ya kuanzisha tume ya maadili na kupambana na ufisadi'],
    ['Legislation on leadership', 'Sheria kuhusu uongozi'],
    ['General principles for the electoral system', 'Kanuni za jumla za mfumo wa uchaguzi'],
    ['Legislation on elections', 'Sheria kuhusu uchaguzi'],
    ['Eligibility to stand as an independent candidate', 'Sifa za kugombea kama mgombea huru'],
    ['Voting', 'Kupiga kura'],
    ['Electoral disputes', 'Migogoro ya uchaguzi'],
    ['Independent Electoral and Boundaries Commission', 'Tume Huru ya Uchaguzi na Mipaka'],
    ['Role of the National Assembly', 'Kazi ya Bunge la Taifa'],
    ['Role of the Senate', 'Kazi ya Seneti'],
    ['Membership of the National Assembly', 'Uanachama wa Bunge la Taifa'],
    ['Membership of the Senate', 'Uanachama wa Seneti'],
    ['Deputy President', 'Naibu wa Rais'],
    ['Bill of Rights', 'Muswada wa Haki'],
    ['National Assembly', 'Bunge la Taifa'],
    ['Supreme Court', 'Mahakama ya Juu'],
    ['Court of Appeal', 'Mahakama ya Rufaa'],
    ['High Court', 'Mahakama Kuu'],
    ['Judicial Service Commission', 'Tume ya Huduma za Mahakama'],
    ['Public Service Commission', 'Tume ya Utumishi wa Umma'],
    ['National Police Service Commission', 'Tume ya Huduma ya Polisi ya Kitaifa'],
    ['National Police Service', 'Huduma ya Polisi ya Kitaifa'],
    ['National Security Council', 'Baraza la Usalama la Kitaifa'],
    ['Kenya Defence Forces', 'Vikosi vya Ulinzi vya Kenya'],
    ['Central Bank of Kenya', 'Benki Kuu ya Kenya'],
    ['Auditor-General', 'Mdhibiti Mkuu wa Hesabu'],
    ['Controller of Budget', 'Mdhibiti wa Bajeti'],
    ['Commission on Revenue Allocation', 'Tume ya Ugavi wa Mapato'],
    ['Salaries and Remuneration Commission', 'Tume ya Mishahara na Marupurupu'],
    ['Teachers Service Commission', 'Tume ya Huduma za Walimu'],
    ['Kenya National Human Rights and Equality Commission', 'Tume ya Kitaifa ya Haki za Kibinadamu na Usawa Kenya'],
    ['Parliamentary Service Commission', 'Tume ya Huduma za Bunge'],
    ['Director of Public Prosecutions', 'Mkurugenzi wa Mashtaka ya Umma'],
    ['Attorney-General', 'Mwanasheria Mkuu'],
    ['Cabinet Secretary', 'Waziri wa Baraza la Mawaziri'],
    ['Principal Secretary', 'Katibu Mkuu'],
    ['State officer', 'afisa wa Serikali'],
    ['State officers', 'maafisa wa Serikali'],
    ['State office', 'ofisi ya Serikali'],
    ['public office', 'ofisi ya umma'],
    ['public offices', 'ofisi za umma'],
    ['public money', 'pesa za umma'],
    ['public workers', 'wafanyakazi wa umma'],
    ['public worker', 'mfanyakazi wa umma'],
    ['public service', 'utumishi wa umma'],
    ['national government', 'serikali ya kitaifa'],
    ['county government', 'serikali ya kaunti'],
    ['county governments', 'serikali za kaunti'],
    ['county assembly', 'bunge la kaunti'],
    ['county assemblies', 'mabunge ya kaunti'],
    ['county governor', 'gavana wa kaunti'],
    ['county governors', 'magavana wa kaunti'],
    ['county boundary', 'mpaka wa kaunti'],
    ['county boundaries', 'mipaka ya kaunti'],
    ['county law', 'sheria ya kaunti'],
    ['county laws', 'sheria za kaunti'],
    ['public debt', 'deni la umma'],
    ['tax money', 'pesa za kodi'],
    ['taxes', 'kodi'],
    ['tax', 'kodi'],
    ['budget', 'bajeti'],
    ['budgets', 'bajeti'],
    ['law', 'sheria'],
    ['laws', 'sheria'],
    ['court', 'mahakama'],
    ['courts', 'mahakama'],
    ['judge', 'jaji'],
    ['judges', 'majaji'],
    ['justice', 'haki'],
    ['rights and fundamental freedoms', 'haki na uhuru wa msingi'],
    ['fundamental freedoms', 'uhuru wa msingi'],
    ['rights', 'haki'],
    ['right', 'haki'],
    ['Constitution', 'Katiba'],
    ['constitution', 'katiba'],
    ['Parliament', 'Bunge'],
    ['parliament', 'bunge'],
    ['President', 'Rais'],
    ['president', 'rais'],
    ['Senate', 'Seneti'],
    ['senate', 'seneti'],
    ['Cabinet', 'Baraza la Mawaziri'],
    ['cabinet', 'baraza la mawaziri'],
    ['government', 'serikali'],
    ['Government', 'Serikali'],
    ['county', 'kaunti'],
    ['County', 'Kaunti'],
    ['office', 'ofisi'],
    ['Office', 'Ofisi'],
    ['offices', 'ofisi'],
    ['Office', 'Ofisi'],
    ['people', 'watu'],
    ['People', 'Watu'],
    ['person', 'mtu'],
    ['Person', 'Mtu'],
    ['child', 'mtoto'],
    ['Child', 'Mtoto'],
    ['children', 'watoto'],
    ['Children', 'Watoto'],
    ['leader', 'kiongozi'],
    ['leaders', 'viongozi'],
    ['police', 'polisi'],
    ['Police', 'Polisi'],
    ['citizenship', 'uraia'],
    ['citizen', 'raia'],
    ['citizens', 'raia'],
    ['Kenyan', 'Mkenya'],
    ['Kenyan', 'Mkenya'],
    ['Kenyans', 'Wakenya'],
    ['Kenya', 'Kenya'],
    ['land', 'ardhi'],
    ['property', 'mali'],
    ['services', 'huduma'],
    ['service', 'huduma'],
    ['money', 'pesa'],
    ['power', 'mamlaka'],
    ['vote', 'kura'],
    ['voting', 'kupiga kura'],
    ['election', 'uchaguzi'],
    ['elections', 'uchaguzi'],
  ];

  let result = text;
  for (const [from, to] of replacements.sort((a, b) => b[0].length - a[0].length)) {
    result = result.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
  }

  return result;
}

function translateToSimpleSwahili(text) {
  if (!text) return '';

  let value = String(text)
    .replace(/\. it\./gi, '.')
    .replace(/\. them\./gi, '.')
    .replace(/\. this\./gi, '.')
    .replace(/\. when /gi, ' when ')
    .replace(/\. why /gi, ' why ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const exact = new Map([
    ['People are the real owners of power in Kenya.', 'Wananchi ndio wenye mamlaka ya kweli nchini Kenya.'],
    ['The Constitution is above every other law.', 'Katiba iko juu ya kila sheria nyingine.'],
    ['Everyone must respect and protect the Constitution.', 'Kila mtu lazima aheshimu na alinde Katiba.'],
    ['Kenya is one republic.', 'Kenya ni jamhuri moja.'],
    ['This says what land and water belong to Kenya.', 'Hii inaeleza ardhi na maji yanayohesabiwa kuwa ya Kenya.'],
    ['Government should bring services closer to people.', 'Serikali inapaswa kuleta huduma karibu na watu.'],
    ['This says which languages Kenya uses officially.', 'Hii inaeleza lugha ambazo Kenya hutumia rasmi.'],
    ['Kenya does not have an official religion.', 'Kenya haina dini rasmi.'],
    ['This says the main symbols and special days of Kenya.', 'Hii inaeleza alama kuu na siku maalum za Kenya.'],
    ['Culture matters and should be respected.', 'Utamaduni ni muhimu na unapaswa kuheshimiwa.'],
    ['Kenyans can get an ID and passport.', 'Wakenya wanaweza kupata kitambulisho na pasipoti.'],
    ['This says when a person keeps or gets Kenyan citizenship.', 'Hii inaeleza mtu anabaki au anapataje uraia wa Kenya.'],
    ['This says when a person is Kenyan from birth.', 'Hii inaeleza mtu anakuwa Mkenya kwa kuzaliwa katika hali zipi.'],
    ['You can apply to become Kenyan in some cases.', 'Unaweza kuomba kuwa Mkenya katika hali fulani.'],
    ['A Kenyan can also belong to another country.', 'Mkenya anaweza pia kuwa raia wa nchi nyingine.'],
    ['Citizenship can be taken away in some cases.', 'Uraia unaweza kuondolewa katika hali fulani.'],
    ['Parliament can make citizenship rules.', 'Bunge linaweza kutunga sheria za uraia.'],
    ['Rights protect every person.', 'Haki hulinda kila mtu.'],
    ['The Bill of Rights is for everyone.', 'Muswada wa Haki ni wa kila mtu.'],
    ['You can go to court if your rights are broken.', 'Unaweza kwenda mahakamani haki zako zikivunjwa.'],
    ['Courts can act when rights are broken.', 'Mahakama zinaweza kuchukua hatua haki zikivunjwa.'],
    ['A right can only be limited for a good legal reason.', 'Haki inaweza kupunguzwa tu kwa sababu nzuri ya kisheria.'],
    ['Some rights are too important to be taken away.', 'Baadhi ya haki ni muhimu mno kuondolewa.'],
    ['The Constitution is the highest rule in Kenya.', 'Katiba ndiyo sheria kuu nchini Kenya.'],
  ]);

  if (exact.has(value)) return exact.get(value);

  value = translateSharedPhrasesToSwahili(value);

  const sentenceRules = [
    [/^This Article says (.+)\.$/i, 'Ibara hii inaeleza $1.'],
    [/^This Article shows (.+)\.$/i, 'Ibara hii inaonyesha $1.'],
    [/^This Article explains (.+)\.$/i, 'Ibara hii inaeleza $1.'],
    [/^This Article helps explain (.+)\.$/i, 'Ibara hii husaidia kueleza $1.'],
    [/^This Article helps sort out (.+)\.$/i, 'Ibara hii husaidia kufafanua $1.'],
    [/^This office helps (.+)\.$/i, 'Ofisi hii husaidia $1.'],
    [/^This office can matter (.+)\.$/i, 'Ofisi hii inaweza kuwa muhimu $1.'],
    [/^These offices (.+)\.$/i, 'Ofisi hizi $1.'],
    [/^People should not (.+)\.$/i, 'Watu hawapaswi $1.'],
    [/^People should (.+)\.$/i, 'Watu wanapaswa $1.'],
    [/^People can (.+)\.$/i, 'Watu wanaweza $1.'],
    [/^People need (.+)\.$/i, 'Watu wanahitaji $1.'],
    [/^A person should (.+)\.$/i, 'Mtu anapaswa $1.'],
    [/^A person can (.+)\.$/i, 'Mtu anaweza $1.'],
    [/^A person (.+)\.$/i, 'Mtu $1.'],
    [/^A child (.+)\.$/i, 'Mtoto $1.'],
    [/^A county (.+)\.$/i, 'Kaunti $1.'],
    [/^Police must (.+)\.$/i, 'Polisi lazima $1.'],
    [/^Police (.+)\.$/i, 'Polisi $1.'],
    [/^Parliament must (.+)\.$/i, 'Bunge lazima $1.'],
    [/^Parliament can (.+)\.$/i, 'Bunge linaweza $1.'],
    [/^Parliament (.+)\.$/i, 'Bunge $1.'],
    [/^Government must (.+)\.$/i, 'Serikali lazima $1.'],
    [/^Government can (.+)\.$/i, 'Serikali inaweza $1.'],
    [/^Government (.+)\.$/i, 'Serikali $1.'],
    [/^Rights (.+)\.$/i, 'Haki $1.'],
    [/^Judges (.+)\.$/i, 'Majaji $1.'],
    [/^MPs (.+)\.$/i, 'Wabunge $1.'],
    [/^The Constitution (.+)\.$/i, 'Katiba $1.'],
    [/^The public (.+)\.$/i, 'Umma $1.'],
    [/^The President (.+)\.$/i, 'Rais $1.'],
    [/^The Deputy President (.+)\.$/i, 'Naibu wa Rais $1.'],
    [/^The State (.+)\.$/i, 'Serikali $1.'],
    [/^Your vote (.+)\.$/i, 'Kura yako $1.'],
    [/^Your rights (.+)\.$/i, 'Haki zako $1.'],
  ];

  for (const [pattern, replacement] of sentenceRules) {
    if (pattern.test(value)) {
      value = value.replace(pattern, replacement);
      break;
    }
  }

  const fragmentReplacements = [
    [' should not be ', ' haipaswi kuwa '],
    [' should not ', ' hawapaswi '],
    [' should be able to ', ' wanapaswa kuweza '],
    [' should be ', ' inapaswa kuwa '],
    [' should ', ' inapaswa '],
    [' must not ', ' lazima isifanye '],
    [' must be ', ' lazima iwe '],
    [' must ', ' lazima '],
    [' can be ', ' inaweza kuwa '],
    [' can ', ' inaweza '],
    [' may be able to ', ' anaweza kuweza '],
    [' may be ', ' inaweza kuwa '],
    [' may ', ' inaweza '],
    [' helps explain ', ' husaidia kueleza '],
    [' helps show ', ' husaidia kuonyesha '],
    [' helps sort out ', ' husaidia kufafanua '],
    [' matters because ', ' ni muhimu kwa sababu '],
    [' matters when ', ' ni muhimu wakati '],
    [' matters.', ' ni muhimu.'],
    [' come closer to ', ' kusogea karibu na '],
    [' go to court ', ' kwenda mahakamani '],
    [' go to court.', ' kwenda mahakamani.'],
    [' taken to court', ' kupelekwa mahakamani'],
    [' treated fairly', ' kutendewa kwa haki'],
    [' treated unfairly', ' kutendewa bila haki'],
    [' protect people', ' kulinda watu'],
    [' protect every person', ' kulinda kila mtu'],
    [' by law', ' kwa sheria'],
    [' in some cases', ' katika hali fulani'],
    [' in some situations', ' katika hali fulani'],
    [' in hard times', ' katika nyakati ngumu'],
    [' without good reason', ' bila sababu nzuri'],
    [' for no good reason', ' bila sababu nzuri'],
    [' the people', ' wananchi'],
    [' people', ' watu'],
    [' everyone', ' kila mtu'],
    [' every person', ' kila mtu'],
    [' a fair process', ' mchakato wa haki'],
    [' fair process', ' mchakato wa haki'],
    [' fair hearing', ' kusikilizwa kwa haki'],
    [' fair pay', ' malipo ya haki'],
    [' safe conditions', ' mazingira salama'],
    [' clean water', ' maji safi'],
    [' medical care', ' huduma za afya'],
    [' health care', ' huduma za afya'],
    [' hospital', ' hospitali'],
    [' schools', ' shule'],
    [' school', ' shule'],
    [' food', ' chakula'],
    [' housing', ' makazi'],
    [' home', ' nyumbani'],
    [' family', ' familia'],
    [' lawfully', ' kisheria'],
    [' honestly', ' kwa uaminifu'],
    [' fairly', ' kwa haki'],
    [' unfairly', ' bila haki'],
    [' properly', ' ipasavyo'],
    [' clearly', ' waziwazi'],
    [' quickly', ' haraka'],
    [' safely', ' kwa usalama'],
  ];

  for (const [from, to] of fragmentReplacements.sort((a, b) => b[0].length - a[0].length)) {
    value = value.split(from).join(to);
  }

  value = value
    .replace(/\bthis\b/gi, 'hii')
    .replace(/\bis above\b/gi, 'iko juu ya')
    .replace(/\bis one republic\b/gi, 'ni jamhuri moja')
    .replace(/\bis for everyone\b/gi, 'ni wa kila mtu')
    .replace(/\bbelongs to\b/gi, 'ni ya')
    .replace(/\bcome first\b/gi, 'huja kwanza')
    .replace(/\bstand up for\b/gi, 'kutetea')
    .replace(/\bkeep quiet\b/gi, 'kukaa kimya')
    .replace(/\bbreak\b/gi, 'kuvunja')
    .replace(/\brespect and protect\b/gi, 'heshimu na ulinde')
    .replace(/\bprotect\b/gi, 'linda')
    .replace(/\bfollow the law\b/gi, 'kufuata sheria')
    .replace(/\bfollow the rules\b/gi, 'kufuata sheria')
    .replace(/\bfinds?\b/gi, 'inapata')
    .replace(/\bstarts working\b/gi, 'inaanza kufanya kazi')
    .replace(/\bcome[s]? closer\b/gi, 'zinakuja karibu')
    .replace(/\bworks?\b/gi, 'hufanya kazi')
    .replace(/\bwho\b/gi, 'nani')
    .replace(/\bwhat\b/gi, 'nini')
    .replace(/\bwhen\b/gi, 'wakati')
    .replace(/\bwhere\b/gi, 'wapi')
    .replace(/\bwhy\b/gi, 'kwa nini')
    .replace(/\bhow\b/gi, 'jinsi gani')
    .replace(/\bget\b/gi, 'kupata')
    .replace(/\bgets\b/gi, 'anapata')
    .replace(/\bmake\b/gi, 'kutunga')
    .replace(/\bmakes\b/gi, 'hutunga')
    .replace(/\buse\b/gi, 'kutumia')
    .replace(/\bused\b/gi, 'kutumika')
    .replace(/\bshare\b/gi, 'kugawa')
    .replace(/\bshared\b/gi, 'kugawanywa')
    .replace(/\bspend\b/gi, 'kutumia')
    .replace(/\bspending\b/gi, 'matumizi')
    .replace(/\bmanage\b/gi, 'kusimamia')
    .replace(/\bcheck\b/gi, 'kukagua')
    .replace(/\bprotect\b/gi, 'kulinda')
    .replace(/\bvote\b/gi, 'kura')
    .replace(/\bsecret\b/gi, 'ya siri')
    .replace(/\bfree\b/gi, 'huru')
    .replace(/\bcounted\b/gi, 'kuhesabiwa')
    .replace(/\barrested\b/gi, 'kukamatwa')
    .replace(/\barrest\b/gi, 'kamata')
    .replace(/\blawyer\b/gi, 'wakili')
    .replace(/\bjail\b/gi, 'jela')
    .replace(/\bprison\b/gi, 'gerezani')
    .replace(/\bmessages\b/gi, 'ujumbe');

  value = value
    .replace(/\s{2,}/g, ' ')
    .replace(/\bna and\b/gi, 'na')
    .replace(/\bna na\b/gi, 'na')
    .replace(/\bya ya\b/gi, 'ya')
    .replace(/\bwa wa\b/gi, 'wa')
    .replace(/\.\s+\./g, '.')
    .trim();

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildSwTitle(legacySwTitle, englishTitle) {
  if (legacySwTitle && !looksEnglishHeavy(legacySwTitle)) return legacySwTitle;

  const translated = translateSharedPhrasesToSwahili(englishTitle || '').trim();
  if (translated && !looksEnglishHeavy(translated)) return translated;

  if (legacySwTitle && legacySwTitle.trim() && !looksEnglishHeavy(legacySwTitle)) return legacySwTitle;
  return 'Ibara hii';
}

function buildSwSimplified(canonicalArticle, englishSimplified, swTitle) {
  const translated = translateToSimpleSwahili(englishSimplified);
  if (translated && !looksEnglishHeavy(translated)) return translated;

  const topic = lowerFirst(swTitle || canonicalArticle.heading || 'ibara hii');
  return `Ibara hii inaeleza kwa ufupi kuhusu ${topic}. Soma maandishi rasmi hapa chini kwa maelezo kamili.`;
}

const exampleNames = ['Kamau', 'Achieng', 'Wanjiku', 'Hassan', 'Chebet', 'Mwangi', 'Atieno', 'Kiptoo'];

function enforcePromptExamples(examples, canonicalArticle) {
  const sentences = splitSentences(canonicalArticle.officialText);
  const baseClauses = sentences.slice(0, 2);
  while (baseClauses.length < 2) baseClauses.push(canonicalArticle.heading);

  return baseClauses.map((clause, idx) => {
    const name = exampleNames[idx % exampleNames.length];
    const youClause = clauseToYouSentence(clause);
    const hasLimit = /\b(not|no|without|except|unless|prohibit|prevent|deny)\b/i.test(clause);
    const story = ensurePeriod(`${name} is in a real situation: ${youClause.replace(/^You\b/, name)}`);
    const outcome = hasLimit
      ? 'That would break this protection, and they can challenge it.'
      : 'That fits this protection and should happen without being stopped.';
    const close = ensurePeriod(`Under this part on ${canonicalArticle.heading}, that is how it should be handled.`);
    return `${story} ${outcome} ${close}`;
  });
}

function buildSwExamples(canonicalArticle, englishExamples, providedSwExamples, swTitle) {
  if (Array.isArray(providedSwExamples) && providedSwExamples.length > 0 && providedSwExamples.every(example => !looksEnglishHeavy(example))) {
    return providedSwExamples;
  }

  const translated = (englishExamples || []).map(translateToSimpleSwahili);
  if (translated.length > 0 && translated.every(example => !looksEnglishHeavy(example))) {
    return translated;
  }

  const topic = lowerFirst(swTitle || canonicalArticle.heading || 'ibara hii');
  return [
    `Ibara hii inaonyesha sheria ya msingi kuhusu ${topic}.`,
    `Mfano wa maisha ya kila siku: sheria hii inatumika unapoona tatizo linalohusu ${topic}.`,
  ];
}

function normalizeExampleVoice(text) {
  const sentenceCase = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  const exact = new Map([
    ['If people ask which rule is highest in Kenya, this gives the answer.', 'The Constitution is the highest rule in Kenya.'],
    ['If a child asks what kind of country Kenya is, this gives the simple answer.', 'Kenya is one republic.'],
    ['If a child asks why English and Kiswahili are used in many public places, this helps explain it.', 'English and Kiswahili are used in many public places for a reason.'],
    ['If a child asks why the flag, anthem, and coat of arms matter, this helps explain it.', 'The flag, anthem, and coat of arms matter because they are national symbols.'],
    ['If people ask what values should guide public life, this gives the basic list.', 'Honesty, fairness, and respect should guide public life.'],
    ['If a family asks why their child is Kenyan from birth, this gives the basic answer.', 'A child can be Kenyan from birth in the cases the Constitution allows.'],
    ['If someone asks why rights matter in everyday life, this shows rights are there to protect every person.', 'Rights matter because they protect every person.'],
    ['If people ask who is allowed to do what at the top of government, this can matter.', 'This Article helps show who can do what at the top of government.'],
    ['If people ask which judges, courts, or judicial bodies are involved, this can matter.', 'This Article helps show which court or judge is involved.'],
    ['If people ask how county leaders or county services should work, this helps explain that part.', 'This Article helps explain how county leaders or county services should work.'],
    ['If people ask where tax money went or who is checking the books, this can matter.', 'This Article helps explain where tax money goes and who checks the books.'],
    ['If people ask how a commission is formed, protected, or made to report, this can matter.', 'This Article helps explain how such an office is formed, protected, and made to report.'],
    ['If people ask where public money went, this shows the rules should be clear and honest.', 'Public money should be used in a clear and honest way.'],
    ['If people ask who checks money before it is spent, this points to that office.', 'This office checks money before it is spent.'],
    ['If people ask who helps set pay for State officers, this gives the answer.', 'This office helps set pay for State officers.'],
    ['If people ask who helps manage Kenya’s money system, this points to that bank.', 'This bank helps manage Kenya’s money system.'],
    ['If people ask who helps manage public service jobs fairly, this points to that commission.', 'This office helps manage public service jobs fairly.'],
    ['If people ask what the police are supposed to do, this helps explain their job.', 'This Article helps explain what the police are supposed to do.'],
    ['If people ask which body gathers intelligence for national safety, this points to it.', 'This body gathers intelligence for national safety.'],
    ['If people ask who defends Kenya from serious threats, this points to the Defence Forces.', 'The Defence Forces help defend Kenya from serious threats.'],
    ['If people ask when this Constitution started working, this gives the date idea.', 'This Article shows when the Constitution started working.'],
    ['If people ask whether the old Constitution still applies, this says it does not.', 'The old Constitution no longer applies.'],
    ['If someone asks whether a new law starts immediately or on a later date, this Article helps explain that.', 'This Article explains when a new law starts working.'],
    ['If people ask why party leaders matter inside Parliament, this Article helps explain it.', 'Party leaders also matter in how Parliament works.'],
    ['If people ask what happens when tragedy comes before a new President takes office, this Article gives the rule.', 'This Article explains what happens if a President-elect dies before taking office.'],
    ['If people ask whether the President can face every kind of court case while serving, this Article helps explain the limit.', 'This Article explains the limit on some court cases against a serving President.'],
    ['If people ask which commissions and independent offices are covered in this chapter, this Article gives the list.', 'This Article lists the offices covered in this chapter.'],
    ['If people ask what commissions and independent offices are allowed to do, this Article gives the basic answer.', 'This Article gives the basic powers of these offices.'],
    ['If people ask why some follow-up laws were needed after the new Constitution began, this Article helps explain that.', 'Some follow-up laws were needed after the new Constitution began.'],
    ['If people ask how old systems were replaced by new ones after 2010, this Article points to those transition rules.', 'These transition rules helped replace old systems after 2010.'],
    ['If people ask when registered citizenship can be cancelled, this Article helps explain it.', 'This Article explains when registered citizenship can be cancelled.'],
    ['If people ask which public office handles land matters, this Article points to that office.', 'The land office named here handles those matters.'],
    ['If people ask how long Parliament stays before the next election, this Article gives the basic rule.', 'Parliament stays for the period set here unless the law ends it earlier.'],
    ['If people ask who fills that seat, this Article helps explain it.', 'This Article explains who fills that seat.'],
    ['If people ask who decides the pay of the President and Deputy President, this Article helps explain it.', 'This Article explains who decides the pay of the President and Deputy President.'],
    ['If people ask why a Bill has not become law yet, this may be one reason.', 'This may explain why a Bill has not become law yet.'],
    ['If people ask who helps Parliament run day by day, this Article points to that office.', 'This office helps Parliament run day by day.'],
    ['If people ask how mercy can be shown lawfully, this Article helps explain it.', 'This Article explains how mercy can be shown lawfully.'],
    ['If people ask who takes over for a short while, this Article gives the answer.', 'This Article shows who takes over for a short while.'],
    ['If people ask when a President is protected from some court cases, this Article helps explain it.', 'This Article explains when a President is protected from some court cases.'],
    ['If people ask who decides on many criminal cases, this Article points to that office.', 'This office decides on many criminal cases.'],
    ['If people ask when the DPP can resign or be removed, this Article gives the rule.', 'This Article says when the DPP can resign or be removed.'],
    ['If people ask who helps the courts run well behind the scenes, this Article points to that office.', 'This office helps the courts run well behind the scenes.'],
    ['If people ask what the judges office does, this Article gives the answer.', 'This Article explains what the judges office does.'],
    ['If people ask how court work is paid for, this Article helps explain it.', 'This Article explains how court work is paid for.'],
    ['If people ask whether a governor can just stay no matter what, this Article shows there are limits.', 'There are legal limits on whether a governor can stay in office.'],
    ['If people ask who helps decide how public money should be shared, this office helps with that work.', 'This office helps decide how public money should be shared.'],
    ['If people ask why some places should get more help, this office helps explain the money side.', 'This office helps explain why some places should get more help.'],
    ['If people ask where planned government spending is written down, this Article helps explain it.', 'Planned government spending is written down in the budget named here.'],
    ['If people ask how county spending is approved, this Article helps explain it.', 'County spending must be approved in the way set out here.'],
    ['If people ask who helps decide pay for top State jobs, this Article points to that office.', 'This office helps decide pay for top State jobs.'],
    ['If people ask who helps manage public workers fairly, this Article points to that office.', 'This office helps manage public workers fairly.'],
    ['If people ask what the public service office actually does, this Article gives the answer.', 'This Article says what the public service office does.'],
    ['If people ask who helps manage police service matters, this Article points to that office.', 'This office helps manage police service matters.'],
    ['If people ask which offices are in this chapter, this Article gives the list.', 'This chapter lists the offices covered here.'],
    ['If people ask why Kenya has independent offices, this Article gives the reason.', 'This Article explains why Kenya has these offices.'],
    ['If people ask why Kenya has these offices, this Article gives the reason.', 'This Article explains why Kenya has these offices.'],
    ['If people ask how members of these offices are picked, this Article explains it.', 'This Article says how members of these offices are picked.'],
    ['If people ask what these offices are allowed to do, this Article gives the basic answer.', 'This Article says what these offices can do.'],
    ['If people ask whether these offices can act like real legal bodies, this Article says yes.', 'These offices can act like real legal bodies.'],
    ['If people ask where to see what these offices have been doing, this Article points to reporting.', 'These offices must report what they have been doing.'],
    ['If people ask how the country moved from the old system to the new one, this Article helps explain it.', 'This Article shows how the country moved from the old system to the new one.'],
    ['If someone asks why you are Kenyan from birth, this Article gives the basic answer.', 'This Article says why a person is Kenyan from birth.'],
    ['If people ask where tax money goes or how public money should be used, this Article helps explain the rule.', 'This Article says where tax money goes and how public money should be used.'],
    ['If people ask who checks whether county or national money was spent honestly, this points to that office.', 'This office checks whether county or national money was spent honestly.'],
    ['If someone tries to break the Constitution, people should not just keep quiet.', 'People should not keep quiet when someone tries to break the Constitution.'],
    ['If leaders misuse power, this reminds everyone to stand up for the Constitution.', 'Everyone should stand up for the Constitution when leaders misuse power.'],
    ['If people talk about Kenya as one country with one republic, this is the rule behind it.', 'Kenya is one country and one republic.'],
    ['If people argue about Kenya’s land, coast, or waters, this helps show what belongs to Kenya.', 'Kenya land, coast, and waters belong to Kenya as the law says here.'],
    ['If there is a border question, this is one place to start.', 'This Article is one place to start on a border question.'],
    ['If one religion tries to act like it is Kenya’s official religion, this says Kenya does not have one.', 'Kenya does not have an official religion.'],
    ['If you marry a Kenyan, you may be able to apply for citizenship.', 'A person married to a Kenyan may be able to apply for citizenship.'],
    ['If someone got citizenship by lying, the government may take it away by law.', 'Citizenship gained by lying may be taken away by law.'],
    ['If a person is in serious danger or needs emergency treatment, this Article matters because life must be protected.', 'Life must be protected, including when a person is in serious danger or needs emergency treatment.'],
    ['If two people need the same service, they should be treated fairly.', 'Two people who need the same service should be treated fairly.'],
    ['If a hospital or school fails people badly, this Article helps show the promise in the Constitution.', 'Hospitals and schools should meet the basic promise the Constitution makes to people.'],
    ['If an office keeps your records wrong and refuses to fix them, this Article can help.', 'This Article can help when an office keeps your records wrong and refuses to fix them.'],
    ['If someone is taken to court, they should be heard properly. This Article helps explain that basic idea.', 'A person taken to court should be heard properly.'],
    ['If police arrest you, they must tell you why and treat you fairly.', 'Police must tell you why they arrested you and must treat you fairly.'],
    ['If a person is in jail or police cells, they still have rights.', 'A person in jail or police cells still has rights.'],
    ['If people argue about what a word here means, this Article helps.', 'This Article helps when people argue about what a word here means.'],
    ['If adults make a decision that harms a child, this Article reminds us that the child should come first.', 'A child should come first when adults make a decision that affects that child.'],
    ['If people are treated unfairly and need help, this office can speak up about rights.', 'This office can speak up about rights when people are treated unfairly and need help.'],
    ['If a factory dirties a river or smoke makes an area unsafe, people and government should help protect the environment.', 'People and government should help protect the environment when a factory dirties a river or smoke makes an area unsafe.'],
    ['If natural resources are being used, people should not be cheated by secret or unfair agreements.', 'People should not be cheated by secret or unfair agreements on natural resources.'],
    ['If a State officer takes office, they must promise to serve Kenya honestly.', 'A State officer must promise to serve Kenya honestly before taking office.'],
    ['If someone wants a top State job, their citizenship may matter because some offices are for Kenyan citizens only.', 'Some top State jobs are only for Kenyan citizens.'],
    ['If you want to run without a political party, you must still follow the rules.', 'A person running without a political party must still follow the rules.'],
    ['If you vote, your vote should be secret, free, and counted fairly.', 'Your vote should be secret, free, and counted fairly.'],
    ['If people ask who manages voting, voter lists, and some election boundaries, this Article points to that office.', 'This office manages voting, voter lists, and some election boundaries.'],
    ['If Parliament wants to make a new law, it must use the steps the Constitution sets out.', 'Parliament must use the steps the Constitution sets out when making a new law.'],
    ['If the two Houses disagree on a Bill, a mediation committee can help them try to agree.', 'A mediation committee can help the two Houses try to agree on a Bill.'],
    ['If Parliament passes a law, people still need to know when that law actually starts working.', 'People need to know when a law starts working after Parliament passes it.'],
    ['If MPs are speaking or debating in Parliament, they need protection so they can do their work properly.', 'MPs need protection while speaking or debating in Parliament so they can do their work properly.'],
    ['If Parliament is to check government well, its members need certain powers and protections while doing official work.', 'Parliament members need certain powers and protections to check government well.'],
    ['If Parliament is discussing laws that affect people, the public should be able to follow and take part.', 'The public should be able to follow and take part when Parliament discusses laws that affect people.'],
    ['If Parliament is checking a serious matter, it can call people to answer questions and bring documents.', 'Parliament can call people to answer questions and bring documents when checking a serious matter.'],
    ['If Parliament needs staff and offices to do its work, this office helps make that happen.', 'This office helps Parliament get the staff and offices it needs to do its work.'],
    ['If the law allows mercy, the President may forgive or reduce a punishment.', 'The President may forgive or reduce a punishment where the law allows mercy.'],
    ['If a President-elect dies before being sworn in, the country still needs a clear legal next step.', 'The country still needs a clear legal next step if a President-elect dies before being sworn in.'],
    ['If the Deputy President seat becomes empty, this Article says what happens next.', 'This Article says what happens next when the Deputy President seat becomes empty.'],
    ['If police arrest someone, this office helps decide whether that person should go to criminal court.', 'This office helps decide whether a person arrested by police should go to criminal court.'],
    ['If courts are to be fair, judges must be free to decide cases without fear or pressure.', 'Judges must be free to decide cases without fear or pressure for courts to be fair.'],
    ['If someone wants a judge removed, there must be a proper process and a serious legal reason.', 'A judge can only be removed through a proper process and for a serious legal reason.'],
    ['If judges need an office to help choose and support them, this Article sets up that office.', 'This Article sets up the office that helps choose and support judges.'],
    ['If judges are being chosen or court staff are being managed, this office helps with that work.', 'This office helps choose judges and manage court staff.'],
    ['If courts need money to do their work, this fund helps provide it.', 'This fund helps provide money for courts to do their work.'],
    ['If county government is working well, people should be heard and services should come closer to them.', 'People should be heard and services should come closer to them in a working county government.'],
    ['If a county governor dies, resigns, or leaves office, this Article says what happens next.', 'This Article says what happens next if a county governor dies, resigns, or leaves office.'],
    ['If health, roads, or another service needs to move between national and county government, it must follow the law.', 'A service can only move between national and county government in the way the law allows.'],
    ['If people want to change a county boundary, it cannot be done carelessly or in secret.', 'A county boundary cannot be changed carelessly or in secret.'],
    ['If a county law says one thing and a national law says another, this Article helps show which one wins.', 'This Article helps show which law wins when county law and national law do not agree.'],
    ['If leaders argue over which law should guide people, this Article helps sort it out.', 'This Article helps sort out which law should guide people when leaders disagree.'],
    ['If leaders collect taxes, they should use that money fairly and carefully.', 'Leaders should use tax money fairly and carefully.'],
    ['If government borrows a lot of money, people should know that debt must still be handled carefully and lawfully.', 'Public debt must still be handled carefully and lawfully.'],
    ['If counties and the national government need fair advice on money sharing, this office matters.', 'This office matters when counties and the national government need fair advice on money sharing.'],
    ['If leaders are sharing national money, this office helps advise what is fair.', 'This office helps advise what is fair when leaders share national money.'],
    ['If county money is delayed, services like health or roads can suffer.', 'Services like health or roads can suffer when county money is delayed.'],
    ['If a county is waiting for its fair share of money, it should not be kept waiting for no good reason.', 'A county should not be kept waiting for its fair share of money for no good reason.'],
    ['If government wants to spend public money, it must first prepare a yearly budget and spending Bill.', 'Government must first prepare a yearly budget and spending Bill before spending public money.'],
    ['If government needs to spend more money than planned, it must go back for approval.', 'Government must go back for approval before spending more money than planned.'],
    ['If a county wants to spend public money, it also needs its own spending law.', 'A county also needs its own spending law before spending public money.'],
    ['If government wants to release public money, this office helps watch that process.', 'This office helps watch the release of public money.'],
    ['If public money goes missing, this office helps check the books.', 'This office helps check the books when public money goes missing.'],
    ['If leaders want to set their own pay, this office helps stop that from being unfair.', 'This office helps stop leaders from setting their own pay unfairly.'],
    ['If public jobs are being handled unfairly, this office can matter.', 'This office can matter when public jobs are being handled unfairly.'],
    ['If workers are being hired, promoted, or disciplined in public service, this office can matter.', 'This office can matter when public workers are hired, promoted, or disciplined.'],
    ['If a public worker refuses to do something illegal, they should not be punished for that.', 'A public worker should not be punished for refusing to do something illegal.'],
    ['If a worker speaks up for what is right, this Article helps protect them.', 'This Article helps protect a worker who speaks up for what is right.'],
    ['If teachers need an office to handle their work matters, this Article sets it up.', 'This Article sets up the office that handles teacher work matters.'],
    ['If a teacher is treated unfairly at work, this office can matter.', 'This office can matter when a teacher is treated unfairly at work.'],
    ['If police, soldiers, or intelligence officers use power, they should still follow the law.', 'Police, soldiers, and intelligence officers should still follow the law when using power.'],
    ['If police jobs, discipline, or hiring need to be handled fairly, this office helps with that.', 'This office helps handle police jobs, discipline, and hiring fairly.'],
    ['If Kenya ever needs another police service by law, it must still be created properly.', 'Any other police service created by law must still be created properly.'],
    ['If someone wants to know whether an office is covered here, this is where they start.', 'This is where to start when checking whether an office is covered here.'],
    ['If leaders misuse power, these offices help question them and protect the public.', 'These offices help question leaders who misuse power and help protect the public.'],
    ['If someone wants to know how long they stay in office, this Article helps.', 'This Article helps show how long a person stays in office.'],
    ['If someone wants a member of this office removed, there must be a real reason and a fair process.', 'A member of this office can only be removed for a real reason and through a fair process.'],
    ['If these offices need to investigate, advise, or protect people, this Article says they can do that work.', 'These offices can investigate, advise, or protect people as this Article allows.'],
    ['If one of these offices needs to sign papers, own property, or go to court, this Article says it can do that.', 'These offices can sign papers, own property, or go to court as the law allows.'],
    ['If these offices do important work, they should also tell the country what they have done.', 'These offices should tell the country what they have done.'],
    ['If someone is breaking the Constitution, any person can go to court to help defend it.', 'Any person can go to court to help defend the Constitution when someone is breaking it.'],
    ['If a part of the Constitution is hard to understand, it should be read in a fair way that protects people.', 'The Constitution should be read in a fair way that protects people.'],
    ['If leaders try to twist the meaning, this Article reminds us to read it by its true purpose.', 'The Constitution should be read by its true purpose, not twisted by leaders.'],
    ['If people argue about what a word means here, this Article helps sort it out.', 'This Article helps sort out what a word means here.'],
    ['If the 2010 Constitution needed extra laws to make new systems work, Parliament had to pass them in time.', 'Parliament had to pass extra laws in time to make the 2010 Constitution work.'],
    ['If Kenya was changing from the old Constitution to the new one, temporary rules were needed for that change.', 'Temporary rules were needed when Kenya was changing from the old Constitution to the new one.'],
    ['If someone wants to know when the new rules began, this answers that.', 'This answers when the new constitutional rules began.'],
  ]);

  if (exact.has(text)) return exact.get(text);

  const normalized = text
    .replace(/^If people ask how (.+) works in Parliament, this helps explain it\.$/i, 'This shows how $1 works in Parliament.')
    .replace(/^If people ask how (.+) works in the top national government, this helps explain it\.$/i, 'This shows how $1 works in the top national government.')
    .replace(/^If people ask how (.+) works in the courts, this helps explain it\.$/i, 'This shows how $1 works in the courts.')
    .replace(/^If people ask how (.+) works in county government, this helps explain it\.$/i, 'This shows how $1 works in county government.')
    .replace(/^If people ask how (.+) affects public money, this helps explain it\.$/i, 'This shows how $1 affects public money.')
    .replace(/^If people ask how (.+) affects Kenya’s safety, this helps explain it\.$/i, 'This shows how $1 affects Kenya safety.')
    .replace(/^If people ask how (.+) works in an independent office, this helps explain it\.$/i, 'This shows how $1 works in that office.')
    .replace(/^If people ask how (.+) helped Kenya move to the new Constitution, this helps explain it\.$/i, 'This shows how $1 helped Kenya move to the new Constitution.');

  let direct = normalized
    .replace(/^If ([^,]+), this shows (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this explains (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this helps explain (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this reminds us (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this points to (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this gives (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this can matter\.$/i, '$1. This can matter.')
    .replace(/^If ([^,]+), this Article can matter\.$/i, '$1. This Article can matter.')
    .replace(/^If ([^,]+), this Article matters\.$/i, '$1. This Article matters.')
    .replace(/^If ([^,]+), this Article helps explain (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this Article explains (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this Article points to (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this Article shows (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), this Article gives (.+)\.$/i, '$1. $2.')
    .replace(/^If ([^,]+), the law may allow (.+)\.$/i, '$2 may be allowed when $1.')
    .replace(/^If ([^,]+), there is a legal way to (.+)\.$/i, '$2 can happen through the legal way set here when $1.')
    .replace(/^If ([^,]+), people can (.+)\.$/i, 'People can $2 when $1.')
    .replace(/^If ([^,]+), the deal should (.+)\.$/i, 'The deal should $2 when $1.')
    .replace(/^If ([^,]+), the President can (.+)\.$/i, 'The President can $2 when $1.')
    .replace(/^If ([^,]+), Parliament can (.+)\.$/i, 'Parliament can $2 when $1.')
    .replace(/^If ([^,]+), counties need (.+)\.$/i, 'Counties need $2 when $1.')
    .replace(/^If ([^,]+), government can (.+)\.$/i, 'Government can $2 when $1.')
    .replace(/^If ([^,]+), government wants (.+)\.$/i, 'Government wants $2 when $1.')
    .replace(/^If ([^,]+), leaders can (.+)\.$/i, 'Leaders can $2 when $1.')
    .replace(/^If ([^,]+), a court can (.+)\.$/i, 'A court can $2 when $1.')
    .replace(/^If ([^,]+), another leader acts (.+)\.$/i, 'Another leader acts $2 when $1.')
    .replace(/^If ([^,]+), you can (.+)\.$/i, 'You can $2 when $1.')
    .replace(/^If ([^,]+), you should (.+)\.$/i, 'You should $2 when $1.');

  if (/^If /i.test(direct) && direct.includes(', ')) {
    const splitAt = direct.lastIndexOf(', ');
    const condition = direct.slice(3, splitAt).trim();
    const tail = direct.slice(splitAt + 2).trim().replace(/\.$/, '');

    const tailRules = [
      [/^this shows why (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this shows (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this explains why (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this explains (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this helps explain why (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this helps explain (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this reminds us (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article helps explain why (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article helps explain (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article explains (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article shows (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article gives (.+)$/i, (_, rest) => `${sentenceCase(rest)} when ${condition}.`],
      [/^this Article matters$/i, () => `${sentenceCase(condition)}. This Article matters.`],
      [/^this Article can matter$/i, () => `${sentenceCase(condition)}. This Article can matter.`],
      [/^this can matter$/i, () => `${sentenceCase(condition)}. This can matter.`],
      [/^people can (.+)$/i, (_, rest) => `People can ${rest} when ${condition}.`],
      [/^you can (.+)$/i, (_, rest) => `You can ${rest} when ${condition}.`],
      [/^you should (.+)$/i, (_, rest) => `You should ${rest} when ${condition}.`],
      [/^government can (.+)$/i, (_, rest) => `Government can ${rest} when ${condition}.`],
      [/^government wants (.+)$/i, (_, rest) => `Government wants ${rest} when ${condition}.`],
      [/^Parliament can (.+)$/i, (_, rest) => `Parliament can ${rest} when ${condition}.`],
      [/^leaders can (.+)$/i, (_, rest) => `Leaders can ${rest} when ${condition}.`],
      [/^the deal should (.+)$/i, (_, rest) => `The deal should ${rest} when ${condition}.`],
      [/^the Constitution still comes first$/i, () => `The Constitution still comes first when ${condition}.`],
      [/^it must have (.+)$/i, (_, rest) => `It must have ${rest} when ${condition}.`],
    ];

    for (const [pattern, formatter] of tailRules) {
      const match = tail.match(pattern);
      if (match) {
        direct = formatter(...match);
        break;
      }
    }
  }

  return sentenceCase(direct);
}

function normalizeExampleSet(exampleResult) {
  return {
    ...exampleResult,
    examples: (exampleResult.examples || []).map(normalizeExampleVoice),
    swExamples: exampleResult.swExamples || [],
  };
}

function buildFallbackExamples(canonicalArticle, explainer, chapterTitle, scenarioEntry) {
  if (scenarioEntry?.examples?.length > 0 && scenarioEntry?.swExamples?.length > 0) {
    const tailored = buildTailoredExamples(canonicalArticle);
    const enforced = enforcePromptExamples(tailored.examples, canonicalArticle);
    return normalizeExampleSet({
      examples: enforced,
      swExamples: tailored.swExamples,
      exampleStatus: 'scenario-bank',
      exampleSources: scenarioEntry.sources || [],
    });
  }

  if (explainer.examples.length > 0 && explainer.swExamples.length > 0) {
    const enforced = enforcePromptExamples(explainer.examples, canonicalArticle);
    return normalizeExampleSet({
      examples: enforced,
      swExamples: explainer.swExamples,
      exampleStatus: 'seeded-from-legacy',
      exampleSources: [],
    });
  }

  const generated = buildArticleSpecificExamples(canonicalArticle, chapterTitle);
  generated.examples = enforcePromptExamples(generated.examples, canonicalArticle);
  return normalizeExampleSet(generated);
}

function buildSchedules(attachmentBlocks) {
  return attachmentBlocks.map((attachment, index) => {
    const titleMatch = attachment.block.match(/<h2 class="akn-heading">([\s\S]*?)<\/h2>/i);
    const subheadingMatch = attachment.block.match(/<h2 class="akn-subheading">([\s\S]*?)<\/h2>/i);

    return {
      id: `schedule-${String(index + 1).padStart(2, '0')}`,
      sourceId: attachment.id,
      title: htmlToText(titleMatch?.[1] ?? `Schedule ${index + 1}`),
      subheading: htmlToText(subheadingMatch?.[1] ?? ''),
      html: attachment.block,
      text: htmlToText(attachment.block),
    };
  });
}

function main() {
  ensureFile(sourceHtmlPath);
  ensureFile(legacyExplainersPath);
  ensureFile(scenarioBankPath);

  const sourceHtml = fs.readFileSync(sourceHtmlPath, 'utf8');
  const legacyData = readJson(legacyExplainersPath);
  const scenarioBank = readJson(scenarioBankPath);
  const toc = getScriptJson(sourceHtml, 'akn_toc_json');
  const legacyExplainers = getLegacyExplainersMap(legacyData);
  const legacyChapters = getLegacyChapterMap(legacyData);
  const scenarioEntries = getScenarioBankMap(scenarioBank);

  const chapterNodes = toc.filter(node => node.type === 'chapter');
  const canonicalChapters = [];
  const explainers = [];
  const appChapters = [];

  for (let index = 0; index < chapterNodes.length; index += 1) {
    const chapterNode = chapterNodes[index];
    const chapterNumber = index + 1;
    const legacyChapter = legacyChapters.get(chapterNumber);
    const sectionNodes = flattenSections(chapterNode);

    const canonicalArticles = sectionNodes.map(sectionNode => {
      const articleNumber = Number.parseInt(String(sectionNode.num).replace(/[^\d]/g, ''), 10);
      const articleBlock = getArticleBlock(sourceHtml, sectionNode.id);
      const articleInnerHtml = stripSectionHeading(articleBlock);
      const officialText = htmlToText(articleInnerHtml);
      const legacyExplainer = legacyExplainers.get(articleNumber);
      const scenarioEntry = scenarioEntries.get(articleNumber);

      const canonicalArticle = {
        id: `article-${String(articleNumber).padStart(3, '0')}`,
        number: articleNumber,
        heading: htmlToText(sectionNode.heading ?? ''),
        title: htmlToText(sectionNode.title ?? ''),
        officialHtml: articleInnerHtml,
        officialText,
        part: sectionNode.part
          ? {
              id: sectionNode.part.id,
              number: sectionNode.part.number,
              title: htmlToText(sectionNode.part.title ?? ''),
              heading: htmlToText(sectionNode.part.heading ?? ''),
            }
          : null,
        source: {
          sourceId: sectionNode.id,
          url: sectionNode.url,
          collection: 'Kenya Law',
        },
      };

      const explainer = {
        articleNumber,
        articleId: canonicalArticle.id,
        title: legacyExplainer?.title || canonicalArticle.heading,
        swTitle: legacyExplainer?.swTitle || '',
        simplified: englishFallback,
        swSimplified: swahiliFallback,
        tags: legacyExplainer?.tags || [],
        examples: legacyExplainer?.examples || [],
        swExamples: legacyExplainer?.swExamples || [],
        whatToDoIfViolated: legacyExplainer?.whatToDoIfViolated || null,
        relatedArticles: legacyExplainer?.relatedArticles || [],
        status: 'draft-generated',
        reviewStatus: 'draft',
        exampleSources: [],
      };

      const draftSimplified = buildDraftSimplified(canonicalArticle, legacyExplainer);
      explainer.simplified = draftSimplified.simplified;
      explainer.swTitle = buildSwTitle(legacyExplainer?.swTitle || '', canonicalArticle.heading);
      explainer.swSimplified = buildSwSimplified(canonicalArticle, draftSimplified.simplified, explainer.swTitle);
      explainer.status = draftSimplified.status;
      explainer.reviewStatus = draftSimplified.reviewStatus;

      const withFallbackExamples = buildFallbackExamples(canonicalArticle, explainer, legacyChapter?.title || chapterNode.heading || '', scenarioEntry);
      explainer.examples = withFallbackExamples.examples;
      explainer.swExamples = buildSwExamples(canonicalArticle, withFallbackExamples.examples, withFallbackExamples.swExamples, explainer.swTitle);
      explainer.exampleStatus = withFallbackExamples.exampleStatus;
      explainer.exampleSources = withFallbackExamples.exampleSources;

      explainers.push(explainer);

      return { canonicalArticle, explainer };
    });

    const canonicalChapter = {
      id: `chapter-${String(chapterNumber).padStart(2, '0')}`,
      appId: `chapter${chapterNumber}`,
      number: chapterNumber,
      label: `Chapter ${chapterNumber}`,
      title: htmlToText(chapterNode.heading ?? ''),
      fullTitle: htmlToText(chapterNode.title ?? ''),
      articles: canonicalArticles.map(item => item.canonicalArticle),
      source: {
        sourceId: chapterNode.id,
        url: chapterNode.url,
        collection: 'Kenya Law',
      },
    };

    canonicalChapters.push(canonicalChapter);

    appChapters.push({
      id: canonicalChapter.appId,
      title: legacyChapter?.title || canonicalChapter.title,
      swTitle: legacyChapter?.swTitle || legacyChapter?.title || canonicalChapter.title,
      number: `Chapter ${chapterNumber}`,
      swNumber: `Sura ya ${chapterNumber}`,
      description: legacyChapter?.description || `${canonicalChapter.articles.length} Articles`,
      swDescription: legacyChapter?.swDescription || `${canonicalChapter.articles.length} Ibara`,
      color: legacyChapter?.color || chapterColors[index] || 'green',
      sections: canonicalArticles.map(({ canonicalArticle, explainer }) => ({
        articleNumber: canonicalArticle.number,
        article: `Article ${canonicalArticle.number}`,
        swArticle: `Ibara ya ${canonicalArticle.number}`,
        title: canonicalArticle.heading,
        swTitle: explainer.swTitle || buildSwTitle('', canonicalArticle.heading),
        simplified: explainer.simplified,
        swSimplified: explainer.swSimplified || buildSwSimplified(canonicalArticle, explainer.simplified, explainer.swTitle),
        originalText: canonicalArticle.officialText,
        tags: explainer.tags,
        examples: explainer.examples,
        swExamples: (explainer.swExamples || buildSwExamples(canonicalArticle, explainer.examples, [], explainer.swTitle)),
        whatToDoIfViolated: explainer.whatToDoIfViolated,
        relatedArticles: explainer.relatedArticles,
        exampleSources: explainer.exampleSources,
        officialUrl: canonicalArticle.source.url,
        explainerStatus: explainer.status,
        explainerReviewStatus: explainer.reviewStatus,
        exampleStatus: explainer.exampleStatus,
      })),
    });
  }

  const preambleBlockStart = sourceHtml.indexOf('<span class="akn-hcontainer" data-name="hcontainer" id="hcontainer_1"');
  const preambleBlock = preambleBlockStart >= 0 ? extractBalancedBlock(sourceHtml, preambleBlockStart, 'span') : '';
  const schedules = buildSchedules(getAttachmentBlocks(sourceHtml));

  const canonicalData = {
    metadata: {
      documentTitle: 'Constitution of Kenya, 2010',
      jurisdiction: 'Kenya',
      source: 'Kenya Law',
      sourceUrl: 'https://new.kenyalaw.org/akn/ke/act/2010/constitution/eng@2010-09-03',
      generatedAt: new Date().toISOString(),
    },
    preamble: {
      title: 'Preamble',
      html: preambleBlock,
      text: htmlToText(preambleBlock),
    },
    chapters: canonicalChapters,
    schedules,
  };

  const validation = {
    generatedAt: canonicalData.metadata.generatedAt,
    chapterCount: canonicalChapters.length,
    articleCount: canonicalChapters.reduce((sum, chapter) => sum + chapter.articles.length, 0),
    maxArticleNumber: Math.max(...canonicalChapters.flatMap(chapter => chapter.articles.map(article => article.number))),
    missingArticleNumbers: Array.from({ length: 264 }, (_, index) => index + 1).filter(number => !canonicalChapters.some(chapter => chapter.articles.some(article => article.number === number))),
    explainerCoverage: {
      total: explainers.length,
      seededFromLegacy: explainers.filter(item => item.status === 'seeded-from-legacy').length,
      draftGenerated: explainers.filter(item => item.status === 'draft-generated').length,
    },
    exampleCoverage: {
      total: explainers.length,
      scenarioBank: explainers.filter(item => item.exampleStatus === 'scenario-bank').length,
      seededFromLegacy: explainers.filter(item => item.exampleStatus === 'seeded-from-legacy').length,
      generatedArticleSpecific: explainers.filter(item => item.exampleStatus === 'generated-article-specific').length,
    },
  };

  if (validation.chapterCount !== 18) {
    throw new Error(`Expected 18 chapters but found ${validation.chapterCount}`);
  }

  if (validation.articleCount !== 264) {
    throw new Error(`Expected 264 articles but found ${validation.articleCount}`);
  }

  if (validation.missingArticleNumbers.length > 0) {
    throw new Error(`Missing article numbers: ${validation.missingArticleNumbers.join(', ')}`);
  }

  fs.writeFileSync(canonicalOutPath, JSON.stringify(canonicalData, null, 2));
  fs.writeFileSync(explainersOutPath, JSON.stringify({ metadata: canonicalData.metadata, articles: explainers }, null, 2));
  fs.writeFileSync(appOutPath, JSON.stringify({ metadata: canonicalData.metadata, chapters: appChapters }, null, 2));
  fs.writeFileSync(validationOutPath, JSON.stringify(validation, null, 2));

  console.log(`Generated ${validation.chapterCount} chapters and ${validation.articleCount} articles.`);
  console.log(`Draft explainers generated: ${validation.explainerCoverage.draftGenerated}`);
}

main();

