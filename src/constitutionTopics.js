function collectSectionText(section) {
  return [
    section.title,
    section.swTitle,
    section.simplified,
    section.swSimplified,
    section.originalText,
    ...(section.tags || []),
    ...(section.examples || []),
    ...(section.swExamples || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function countPatternHits(text, patterns) {
  return patterns.reduce((score, pattern) => {
    if (!pattern) return score;
    return text.includes(pattern.toLowerCase()) ? score + 1 : score;
  }, 0);
}

export function sectionMatchesTopic(section, topic) {
  const text = collectSectionText(section);
  const primaryHits = countPatternHits(text, topic.primaryPatterns || []);
  const secondaryHits = countPatternHits(text, topic.secondaryPatterns || []);

  if (primaryHits >= 2) return true;
  if (primaryHits >= 1 && secondaryHits >= 1) return true;
  if (primaryHits >= 1 && !(topic.secondaryPatterns?.length)) return true;

  return false;
}
