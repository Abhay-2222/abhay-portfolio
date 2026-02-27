/**
 * parse-html.js
 * Parses all-case-studies-content.html and outputs structured JSON
 * for all 7 projects, ready to be used in projects.js
 */
const fs = require('fs');
const html = fs.readFileSync('d:/Games/all-case-studies-content.html', 'utf8');

/* ── Text cleaning ── */
function clean(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')         // strip tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8212;/g, ', ')       // em dash numeric entity
    .replace(/&#8211;/g, ' to ')     // en dash numeric entity
    .replace(/\u2014/g, ', ')        // em dash U+2014
    .replace(/ \u2013 /g, ' to ')    // en dash with spaces (non-date)
    .replace(/---/g, '. ')
    .replace(/--(?!>)/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Keep date-range en dashes: "Sep 2024 – Feb 2025" */
function cleanMeta(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u2014/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Shorten: max N sentences */
function maxSentences(str, n) {
  if (!str) return '';
  const sents = str.match(/[^.!?]+[.!?]+/g) || [str];
  return sents.slice(0, n).join(' ').trim();
}

/* Extract first article by id */
function getArticle(id) {
  const re = new RegExp('<article[^>]+id="' + id + '"[^>]*>([\\s\\S]*?)<\\/article>', 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

/* Extract section by id */
function getSection(id) {
  const re = new RegExp('<section[^>]+id="' + id + '"[^>]*>([\\s\\S]*?)<\\/section>', 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

/* Get all <p> texts in a block */
function getPs(block) {
  const re = /<p(?![^>]*class)[^>]*>([\s\S]*?)<\/p>/gi;
  const out = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    const t = clean(m[1]);
    if (t) out.push(t);
  }
  return out;
}

/* Get all <li> texts in a block */
function getLis(block) {
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const out = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    const t = clean(m[1]);
    if (t) out.push(t);
  }
  return out;
}

/* Get callout text */
function getCallout(block) {
  const re = /<(?:blockquote|div[^>]+class="callout")[^>]*>([\s\S]*?)<\/(?:blockquote|div)>/i;
  const m = block.match(re);
  return m ? maxSentences(clean(m[1]), 1) : null;
}

/* Get subsections (h3 + following content) */
function getSubsections(block) {
  const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|<\/section|$)/gi;
  const out = [];
  let m;
  while ((m = h3Re.exec(block)) !== null) {
    const title = clean(m[1]);
    const bodyBlock = m[2];
    const ps = getPs(bodyBlock);
    const lis = getLis(bodyBlock);
    const bodyText = ps.length
      ? maxSentences(ps.join(' '), 2)
      : lis.slice(0, 4).join('. ');
    if (title) out.push({ title, body: bodyText });
  }
  return out;
}

/* Build episode content array from a section block */
function buildContent(block) {
  const content = [];
  // H3 headline (first h3 = section headline)
  const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>/i;
  const h3m = block.match(h3Re);
  if (h3m) content.push({ type: 'h3', text: clean(h3m[1]) });
  // Paragraphs (max 2, max 3 sentences each)
  const ps = getPs(block);
  ps.slice(0, 2).forEach(p => {
    content.push({ type: 'p', text: maxSentences(p, 3) });
  });
  // Lists
  const lis = getLis(block);
  if (lis.length) content.push({ type: 'ul', items: lis.slice(0, 6) });
  return content;
}

/* ── Parse each project ── */

function parseProject(articleId, sectionIds) {
  const art = getArticle(articleId);
  const metaRe = /<p class="meta">([\s\S]*?)<\/p>/;
  const synRe  = /<p class="hero-synopsis">([\s\S]*?)<\/p>/;
  const bodyRe = /<p class="hero-body">([\s\S]*?)<\/p>/;

  const meta     = cleanMeta((art.match(metaRe)  || [])[1] || '');
  const synopsis = clean((art.match(synRe)  || [])[1] || '');
  const heroBody = maxSentences(clean((art.match(bodyRe) || [])[1] || ''), 2);

  const sections = sectionIds.map(id => {
    const block = getSection(id);
    const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/i;
    const h2m  = block.match(h2Re);
    const title = h2m ? clean(h2m[1]) : id;
    const ps = getPs(block);
    const body = ps.slice(0, 2).map(p => maxSentences(p, 3)).join(' ');
    const callout = getCallout(block);
    const subsections = getSubsections(block);
    const lis = getLis(block);
    const content = buildContent(block);
    return { id, title, body, callout, subsections, content, lis };
  });

  return { meta, synopsis, heroBody, sections };
}

const projects = {
  caresummarizer: parseProject('caresummarizer', [
    'cs-overview','cs-problem','cs-ambiguity','cs-mistakes',
    'cs-evolution','cs-design-system','cs-product','cs-impact'
  ]),
  salesforce: parseProject('salesforce', [
    'sf-legacy','sf-stakeholders','sf-constraints',
    'sf-mobile','sf-accessibility','sf-outcomes'
  ]),
  trailar: parseProject('trailar', [
    'ar-problem','ar-research','ar-design','ar-features','ar-testing'
  ]),
  vosyn: parseProject('vosyn', [
    'vosyn-challenge','vosyn-creators','vosyn-ai','vosyn-quality','vosyn-business'
  ]),
  mealplanner: parseProject('mealplanner', [
    'meal-problem','meal-nutrition','meal-interface','meal-habits','meal-security'
  ]),
  aurora: parseProject('aurora', [
    'aurora-trust','aurora-anxiety','aurora-visualisation',
    'aurora-onboarding','aurora-outcomes'
  ]),
  autonomous: parseProject('autonomous', [
    'auto-trust','auto-safety','auto-dashboard','auto-edge','auto-accessibility'
  ]),
};

fs.writeFileSync(
  'D:/Motion/Abhay Sharma/abhay-portfolio/scripts/parsed-content.json',
  JSON.stringify(projects, null, 2)
);
console.log('Done. Wrote parsed-content.json');

// Quick preview
Object.entries(projects).forEach(([k,v]) => {
  console.log('\n=== ' + k.toUpperCase() + ' ===');
  console.log('Synopsis:', v.synopsis);
  console.log('Hero body:', v.heroBody);
  v.sections.forEach(s => {
    console.log('  [' + s.id + '] ' + s.title + ': ' + s.body.slice(0,80) + '...');
  });
});
