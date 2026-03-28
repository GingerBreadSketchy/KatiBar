import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CHAPTER_META,
  articleCountLabel,
  stripLeadingHash,
} from '../src/constitutionMeta.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const CANONICAL_PATH = path.join(ROOT, 'src', 'data', 'constitution.canonical.json')
const EXPLAINER_PATH = path.join(ROOT, 'constitution_explainer.json')
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'constitution.manifest.json')
const SEARCH_INDEX_PATH = path.join(ROOT, 'src', 'data', 'constitution.search-index.json')
const DETAIL_DIR = path.join(ROOT, 'src', 'data', 'constitution-details')

function buildExplainerLookup(articles) {
  return new Map(articles.map((article) => [article.article, article]))
}

function buildChapterBase(chapter) {
  const chapterMeta = CHAPTER_META[chapter.number] || {
    color: 'green',
  }

  return {
    id: chapter.appId || chapter.id,
    title: chapter.title,
    fullTitle: chapter.fullTitle,
    shortTitle: chapterMeta.shortTitle || chapter.title,
    number: chapter.label,
    description: chapterMeta.description || articleCountLabel(chapter.articles.length),
    color: chapterMeta.color,
    articleCount: chapter.articles.length,
  }
}

function buildManifestSection(officialArticle, explainer) {
  const examples = Array.isArray(explainer?.examples)
    ? explainer.examples.filter((example) => typeof example === 'string' && example.trim())
    : []

  return {
    articleNumber: officialArticle.number,
    article: `Article ${officialArticle.number}`,
    title: officialArticle.heading,
    simplified: explainer?.what_this_means || '',
    tags: Array.isArray(explainer?.tags)
      ? explainer.tags.map(stripLeadingHash).filter(Boolean)
      : [],
    examples,
    officialUrl: officialArticle.source?.url || '',
    detailsLoaded: false,
  }
}

function buildDetailSection(officialArticle) {
  return {
    articleNumber: officialArticle.number,
    originalText: officialArticle.officialText,
  }
}

function normalizeSearchText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSearchIndexEntry(chapter, officialArticle, explainer) {
  const examples = Array.isArray(explainer?.examples)
    ? explainer.examples.filter((example) => typeof example === 'string' && example.trim())
    : []

  return {
    chapterId: chapter.appId || chapter.id,
    chapterTitle: chapter.title,
    chapterColor: (CHAPTER_META[chapter.number] || {}).color || 'green',
    articleNumber: officialArticle.number,
    article: `Article ${officialArticle.number}`,
    title: officialArticle.heading,
    simplified: explainer?.what_this_means || '',
    tags: Array.isArray(explainer?.tags)
      ? explainer.tags.map(stripLeadingHash).filter(Boolean)
      : [],
    examples,
    officialUrl: officialArticle.source?.url || '',
    searchBody: normalizeSearchText(officialArticle.officialText),
  }
}

function padChapterNumber(number) {
  return String(number).padStart(2, '0')
}

async function main() {
  const [canonicalRaw, explainerRaw] = await Promise.all([
    readFile(CANONICAL_PATH, 'utf8'),
    readFile(EXPLAINER_PATH, 'utf8'),
  ])

  const canonicalConstitution = JSON.parse(canonicalRaw)
  const explainerArticles = JSON.parse(explainerRaw)
  const explainerByArticle = buildExplainerLookup(explainerArticles)

  const manifest = {
    metadata: {
      documentTitle: canonicalConstitution.metadata.documentTitle,
      jurisdiction: canonicalConstitution.metadata.jurisdiction,
      source: 'Kenya Law + constitution_explainer.json',
      sourceUrl: canonicalConstitution.metadata.sourceUrl,
      articleCount: canonicalConstitution.chapters.reduce(
        (count, chapter) => count + chapter.articles.length,
        0,
      ),
    },
    chapters: canonicalConstitution.chapters.map((chapter) => ({
      ...buildChapterBase(chapter),
      detailsLoaded: false,
      sections: chapter.articles.map((officialArticle) =>
        buildManifestSection(officialArticle, explainerByArticle.get(officialArticle.number)),
      ),
    })),
  }

  const searchIndex = canonicalConstitution.chapters.flatMap((chapter) =>
    chapter.articles.map((officialArticle) =>
      buildSearchIndexEntry(chapter, officialArticle, explainerByArticle.get(officialArticle.number)),
    ),
  )

  await rm(DETAIL_DIR, { recursive: true, force: true })
  await mkdir(DETAIL_DIR, { recursive: true })

  await Promise.all(
    canonicalConstitution.chapters.map(async (chapter) => {
      const detailPayload = {
        chapterId: chapter.appId || chapter.id,
        sections: chapter.articles.map(buildDetailSection),
      }

      const detailPath = path.join(
        DETAIL_DIR,
        `chapter-${padChapterNumber(chapter.number)}.json`,
      )

      await writeFile(detailPath, `${JSON.stringify(detailPayload, null, 2)}\n`, 'utf8')
    }),
  )

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  await writeFile(SEARCH_INDEX_PATH, `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf8')
}

main().catch((error) => {
  console.error('Failed to build split constitution assets.')
  console.error(error)
  process.exitCode = 1
})
