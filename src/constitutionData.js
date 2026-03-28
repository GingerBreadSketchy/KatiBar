import constitutionManifestUrl from './data/constitution.manifest.json?url'
import constitutionSearchIndexUrl from './data/constitution.search-index.json?url'

const CHAPTER_DETAIL_URLS = {
  chapter1: new URL('./data/constitution-details/chapter-01.json', import.meta.url).href,
  chapter2: new URL('./data/constitution-details/chapter-02.json', import.meta.url).href,
  chapter3: new URL('./data/constitution-details/chapter-03.json', import.meta.url).href,
  chapter4: new URL('./data/constitution-details/chapter-04.json', import.meta.url).href,
  chapter5: new URL('./data/constitution-details/chapter-05.json', import.meta.url).href,
  chapter6: new URL('./data/constitution-details/chapter-06.json', import.meta.url).href,
  chapter7: new URL('./data/constitution-details/chapter-07.json', import.meta.url).href,
  chapter8: new URL('./data/constitution-details/chapter-08.json', import.meta.url).href,
  chapter9: new URL('./data/constitution-details/chapter-09.json', import.meta.url).href,
  chapter10: new URL('./data/constitution-details/chapter-10.json', import.meta.url).href,
  chapter11: new URL('./data/constitution-details/chapter-11.json', import.meta.url).href,
  chapter12: new URL('./data/constitution-details/chapter-12.json', import.meta.url).href,
  chapter13: new URL('./data/constitution-details/chapter-13.json', import.meta.url).href,
  chapter14: new URL('./data/constitution-details/chapter-14.json', import.meta.url).href,
  chapter15: new URL('./data/constitution-details/chapter-15.json', import.meta.url).href,
  chapter16: new URL('./data/constitution-details/chapter-16.json', import.meta.url).href,
  chapter17: new URL('./data/constitution-details/chapter-17.json', import.meta.url).href,
  chapter18: new URL('./data/constitution-details/chapter-18.json', import.meta.url).href,
}

const chapterDetailCache = new Map()
let manifestPromise = null
let searchIndexPromise = null

export const emptyConstitutionData = {
  metadata: {
    documentTitle: 'Constitution of Kenya, 2010',
    jurisdiction: 'Kenya',
    source: 'Kenya Law + constitution_explainer.json',
    sourceUrl: '',
    articleCount: 0,
  },
  chapters: [],
}

function mergeSectionDetails(section, detailSection) {
  if (!detailSection) {
    return section
  }

  return {
    ...section,
    originalText: detailSection.originalText,
    detailsLoaded: true,
  }
}

export function hydrateChapterDetails(constitution, chapterId, chapterDetails) {
  const detailsByArticle = new Map(
    (chapterDetails?.sections || []).map((section) => [section.articleNumber, section]),
  )

  return {
    ...constitution,
    chapters: (constitution.chapters || []).map((chapter) => {
      if (chapter.id !== chapterId) {
        return chapter
      }

      return {
        ...chapter,
        detailsLoaded: true,
        sections: (chapter.sections || []).map((section) =>
          mergeSectionDetails(section, detailsByArticle.get(section.articleNumber)),
        ),
      }
    }),
  }
}

export function hydrateSectionWithChapterDetails(section, chapterDetails) {
  const detailSection = (chapterDetails?.sections || []).find(
    (candidate) => candidate.articleNumber === section.articleNumber,
  )

  return mergeSectionDetails(section, detailSection)
}

export async function loadConstitutionData() {
  if (!manifestPromise) {
    manifestPromise = fetch(constitutionManifestUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load constitution manifest: ${response.status}`)
        }

        return response.json()
      })
      .catch((error) => {
        manifestPromise = null
        throw error
      })
  }

  return manifestPromise
}

export async function loadChapterDetails(chapterId) {
  if (!chapterId || !CHAPTER_DETAIL_URLS[chapterId]) {
    throw new Error(`No chapter detail asset is available for ${chapterId}`)
  }

  if (!chapterDetailCache.has(chapterId)) {
    const chapterPromise = fetch(CHAPTER_DETAIL_URLS[chapterId])
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load chapter details for ${chapterId}: ${response.status}`)
        }

        return response.json()
      })
      .catch((error) => {
        chapterDetailCache.delete(chapterId)
        throw error
      })

    chapterDetailCache.set(chapterId, chapterPromise)
  }

  return chapterDetailCache.get(chapterId)
}

export async function loadSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = fetch(constitutionSearchIndexUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load constitution search index: ${response.status}`)
        }

        return response.json()
      })
      .catch((error) => {
        searchIndexPromise = null
        throw error
      })
  }

  return searchIndexPromise
}
