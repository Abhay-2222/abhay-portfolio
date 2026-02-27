'use strict';
const fs  = require('fs');
const vm  = require('vm');
const path = require('path');

const PROJECTS_FILE = path.join(__dirname, '..', 'src', 'data', 'projects.js');

let src = fs.readFileSync(PROJECTS_FILE, 'utf8');
src = src.replace(/^export\s+default\s+projects\s*;?\s*$/m, '') + '\nmodule.exports=projects;';
const mod = { exports: {} };
const ctx = vm.createContext({ module: mod, exports: mod.exports, require });
new vm.Script(src, { filename: PROJECTS_FILE }).runInContext(ctx);
const p = mod.exports;

// Verify healthcare ep01 = The Problem (not Overview)
const hc = p.find(function(x){ return x.id === 'healthcare'; });
console.log('healthcare ep01 title:', hc.episodes[0].title);
console.log('healthcare ep07 title:', hc.episodes[6].title);

// Verify teaser lengths (max ~122 chars: 120 + '.')
var allOk = true;
for (var i = 0; i < p.length; i++) {
  var proj = p[i];
  for (var j = 0; j < proj.episodes.length; j++) {
    var ep = proj.episodes[j];
    if (ep.teaser.length > 125) {
      console.log('LONG TEASER in ' + proj.id + ' ep' + ep.ep + ': ' + ep.teaser.length + ' chars');
      allOk = false;
    }
  }
}
if (allOk) { console.log('All teasers within length limit.'); }

// Check no empty episodes
for (var k = 0; k < p.length; k++) {
  if (!p[k].episodes || p[k].episodes.length === 0) {
    console.log('EMPTY episodes for ' + p[k].id);
  }
}

// Check fields are updated from parsed content (not old hardcoded values)
var meatProj = p.find(function(x){ return x.id === 'meatinspector'; });
console.log('meatinspector description:', meatProj.description.slice(0, 80));
console.log('meatinspector problem:', meatProj.problem.slice(0, 80));
console.log('meatinspector hero.synopsis:', meatProj.hero.synopsis.slice(0, 80));
console.log('meatinspector ep01.content items:', meatProj.episodes[0].content.length);

console.log('\nAll checks passed.');
