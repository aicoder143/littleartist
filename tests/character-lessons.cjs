// Run: node tests/character-lessons.cjs
// Evaluates the lesson data only; no browser or extra dependencies are needed.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../studio/static/studio/lessons.js'), 'utf8');
const dataEnd = source.indexOf("let category='All artwork';");
assert.ok(dataEnd > 0, 'lesson data section should exist');
const sandbox = {};
vm.runInNewContext(
  source.slice(0, dataEnd) + 'globalThis.characterLessons = characterLessons;})();',
  sandbox,
);

const lessons = sandbox.characterLessons;
assert.ok(lessons.length >= 30, `expected at least 30 character lessons; found ${lessons.length}`);
assert.equal(new Set(lessons.map(lesson => lesson.id)).size, lessons.length, 'lesson IDs should be unique');
assert.ok(lessons.every(lesson => ['Indian cartoons', 'Japanese cartoons', 'Mythology'].includes(lesson.category)));
for (const group of ['Indian cartoons', 'Japanese cartoons', 'Mythology']) {
  assert.ok(lessons.some(lesson => lesson.category === group), `expected character group ${group}`);
}
assert.ok(lessons.every(lesson => [4, 6, 9].includes(lesson.age)));
assert.ok(lessons.every(lesson => lesson.steps.length >= 4));
assert.ok(lessons.every(lesson => lesson.steps.every(step => step.title && step.instruction && step.svg)));

const titles = new Set(lessons.map(lesson => lesson.title));
for (const title of ['Chota Bheem', 'Chutki', 'Raju', 'Doraemon', 'Pikachu', 'Lord Ram', 'Krishna', 'Shiva']) {
  assert.ok(titles.has(title), `expected requested character lesson: ${title}`);
}

console.log(`Character lesson library passed: ${lessons.length} lessons across ${new Set(lessons.map(lesson => lesson.age)).size} age tiers.`);
