'use strict';

/**
 * update-projects.cjs
 *
 * Updates src/data/projects.js with content from scripts/parsed-content.json.
 *
 * Fields updated per project:
 *   - description  → parsed JSON synopsis
 *   - problem      → parsed JSON heroBody
 *   - hero.synopsis → parsed JSON synopsis
 *   - episodes     → rebuilt from parsed JSON sections
 *
 * All other fields are left untouched.
 *
 * Special rule for caresummarizer/healthcare:
 *   The first section (cs-overview) maps to description/problem only.
 *   Episodes start from the second section (cs-problem).
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT          = path.resolve(__dirname, '..');
const PROJECTS_FILE = path.join(ROOT, 'src', 'data', 'projects.js');
const PARSED_FILE   = path.join(ROOT, 'scripts', 'parsed-content.json');

// ─── ID mapping: parsed JSON key → projects.js id ────────────────────────────
const KEY_TO_ID = {
  caresummarizer : 'healthcare',
  salesforce     : 'meatinspector',
  trailar        : 'trailar',
  vosyn          : 'vosyn',
  mealplanner    : 'mealplanner',
  aurora         : 'aurora',
  autonomous     : 'autonomous',
};

// ─── Helper: zero-pad episode number ─────────────────────────────────────────
function epNum(n) {
  return String(n).padStart(2, '0');
}

// ─── Helper: build teaser from body ──────────────────────────────────────────
function makeTeaser(body) {
  const trimmed = body.trim();
  if (trimmed.length <= 120) return trimmed;
  return trimmed.slice(0, 120).trim() + '.';
}

// ─── Helper: build an episode object from a section ──────────────────────────
function buildEpisode(section, index) {
  return {
    ep       : epNum(index),
    title    : section.title,
    teaser   : makeTeaser(section.body),
    readTime : '4 min',
    content  : section.content,
  };
}

// ─── Load and evaluate projects.js as CommonJS via vm ────────────────────────
// We strip the ES module syntax, wrap it in a module-style context, and evaluate.
function loadProjects() {
  let src = fs.readFileSync(PROJECTS_FILE, 'utf8');

  // Remove "export default projects;" at the end
  src = src.replace(/^export\s+default\s+projects\s*;?\s*$/m, '');

  // Wrap so `projects` is accessible
  const wrapped = `${src}\nmodule.exports = projects;`;

  const mod = { exports: {} };
  const script = new vm.Script(wrapped, { filename: PROJECTS_FILE });
  const context = vm.createContext({ module: mod, exports: mod.exports, require });
  script.runInContext(context);

  return mod.exports; // array of project objects
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('Reading projects.js …');
  const projects = loadProjects();
  console.log(`  Loaded ${projects.length} projects.`);

  console.log('Reading parsed-content.json …');
  const parsed = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf8'));
  console.log(`  Loaded ${Object.keys(parsed).length} parsed entries.`);

  // Build a lookup map: projectId → project object
  const byId = {};
  for (const p of projects) byId[p.id] = p;

  // Process each key in parsed content
  for (const [key, data] of Object.entries(parsed)) {
    const id = KEY_TO_ID[key];
    if (!id) {
      console.warn(`  WARN: No ID mapping for key "${key}", skipping.`);
      continue;
    }
    const project = byId[id];
    if (!project) {
      console.warn(`  WARN: No project found with id "${id}", skipping.`);
      continue;
    }

    const { synopsis, heroBody, sections } = data;

    // Update flat fields
    project.description  = synopsis;
    project.problem      = heroBody;
    project.hero.synopsis = synopsis;

    // Build episodes
    let episodeSections;
    if (key === 'caresummarizer') {
      // First section (cs-overview) → description/problem only; episodes from index 1
      episodeSections = sections.slice(1);
    } else {
      episodeSections = sections;
    }

    project.episodes = episodeSections.map((section, i) =>
      buildEpisode(section, i + 1)
    );

    console.log(
      `  Updated "${id}": ${project.episodes.length} episode(s) built from "${key}".`
    );
  }

  // ─── Serialize back to ES module ─────────────────────────────────────────
  // We use a custom replacer to omit the `undefined` values that JSON.stringify
  // would drop silently — projects.js has no undefined values so this is fine.
  const body = JSON.stringify(projects, null, 2);

  const output = [
    '/**',
    ' * projects.js',
    ' * Complete data for all 7 portfolio projects.',
    ' * Order: healthcare, meatinspector, trailar, vosyn, mealplanner, aurora, autonomous',
    ' *',
    ' * Each project has:',
    ' *  - Legacy fields (used by full-page case study components)',
    ' *  - hero, episodes, artefacts, info (used by ProjectOverlay Apple TV+ layout)',
    ' */',
    '',
    `const projects = ${body};`,
    '',
    'export default projects;',
    '',
  ].join('\n');

  fs.writeFileSync(PROJECTS_FILE, output, 'utf8');
  console.log(`\nWrote updated projects.js (${output.length} bytes).`);

  // ─── Verification ─────────────────────────────────────────────────────────
  const written = fs.readFileSync(PROJECTS_FILE, 'utf8');

  // Check for em dashes
  const emDashMatches = written.match(/\u2014/g);
  if (emDashMatches) {
    console.warn(`\nWARN: ${emDashMatches.length} em dash(es) found in output.`);
  } else {
    console.log('Verification: No em dashes found.');
  }

  // Check episode counts
  const reloadedSrc = written
    .replace(/^export\s+default\s+projects\s*;?\s*$/m, '')
    + '\nmodule.exports = projects;';
  const mod = { exports: {} };
  const script2 = new vm.Script(reloadedSrc, { filename: PROJECTS_FILE });
  const ctx2 = vm.createContext({ module: mod, exports: mod.exports, require });
  script2.runInContext(ctx2);
  const reloaded = mod.exports;

  console.log('\nEpisode counts after update:');
  for (const p of reloaded) {
    console.log(`  ${p.id}: ${p.episodes ? p.episodes.length : 0} episode(s)`);
  }

  // Basic syntax check: re-parsing the array JSON portion
  try {
    const arrayStart = written.indexOf('[');
    const arrayEnd   = written.lastIndexOf(']');
    JSON.parse(written.slice(arrayStart, arrayEnd + 1));
    console.log('\nSyntax check: JSON portion is valid.');
  } catch (e) {
    console.error('\nERROR: JSON syntax check failed:', e.message);
  }

  console.log('\nDone.');
}

main();
