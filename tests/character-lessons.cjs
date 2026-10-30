// Run: node tests/character-lessons.cjs
// Evaluates the lesson data only; no browser or extra dependencies are needed.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../studio/static/studio/lessons.js'), 'utf8');
const dataEnd = source.indexOf('const categoryIcons=');
assert.ok(dataEnd > 0, 'lesson data section should exist');
const sandbox = { localStorage: { getItem: () => null } };
vm.runInNewContext(
  source.slice(0, dataEnd) + 'globalThis.characterLessons = characterLessons; globalThis.shapeLessons = shapeLessons; globalThis.illustration = illustration; globalThis.catalogLessons = catalog; globalThis.mountainFinalSvg = mountainFinalSvg;})();',
  sandbox,
);

const lessons = sandbox.characterLessons;
assert.equal(sandbox.catalogLessons.length, 63, 'full paper lesson count should stay in sync with the README');
for (const [age, count] of [[4, 18], [6, 21], [9, 24]]) {
  assert.equal(sandbox.catalogLessons.filter(lesson => lesson.age === age).length, count, `age tier ${age} count`);
}
assert.ok(lessons.length >= 30, `expected at least 30 character lessons; found ${lessons.length}`);
assert.equal(new Set(sandbox.catalogLessons.map(lesson => lesson.id)).size, sandbox.catalogLessons.length, 'lesson IDs should be unique');
assert.ok(lessons.every(lesson => ['Indian cartoons', 'Japanese cartoons', 'Mythology'].includes(lesson.category)));
for (const group of ['Indian cartoons', 'Japanese cartoons', 'Mythology']) {
  assert.ok(lessons.some(lesson => lesson.category === group), `expected character group ${group}`);
}
assert.ok(lessons.every(lesson => [4, 6, 9].includes(lesson.age)));
assert.ok(lessons.every(lesson => lesson.steps.length >= 6));
assert.ok(lessons.every(lesson => lesson.steps[0].construction && lesson.steps.at(-1).cleanup));
const mythLessons = lessons.filter(lesson => lesson.category === 'Mythology');
assert.equal(mythLessons.length, 10, 'each mythology figure should be a separate lesson');
assert.ok(mythLessons.every(lesson => lesson.age === 9 && lesson.steps.length === 9), 'mythology lessons should target the advanced tier');
assert.ok(mythLessons.every(lesson => lesson.steps[6].cleanup && lesson.steps[7].coloring && lesson.steps[8].cleanup && lesson.stageSvg && lesson.finalSvg), 'mythology lessons should include cleanup and two colored guide stages');
assert.equal(new Set(mythLessons.map(lesson => lesson.finalSvg)).size, 10, 'each mythological character should have a distinct color reference');
const finalCharacter = sandbox.illustration(lessons[0].steps, lessons[0].steps.length - 1);
assert.equal((finalCharacter.match(/<g /g) || []).length, lessons[0].steps.length - 1, 'final view should hide the construction guide');
assert.ok(sandbox.shapeLessons.some(lesson => lesson.title === 'Circle & oval'));
assert.ok(sandbox.shapeLessons.some(lesson => lesson.title === 'Triangle'));
assert.ok(sandbox.shapeLessons.some(lesson => lesson.title === 'Rectangle'));
assert.ok(sandbox.shapeLessons.some(lesson => lesson.title === 'Cube'));
assert.ok(sandbox.shapeLessons.some(lesson => lesson.title === 'Cuboid'));
assert.ok(sandbox.shapeLessons.every(lesson => lesson.category === 'Shapes & forms'));
assert.ok(sandbox.shapeLessons.every(lesson => lesson.steps.some(step => step.construction) && lesson.steps.at(-1).cleanup));
const mountain = sandbox.catalogLessons.find(lesson => lesson.id === 'landscape');
assert.ok(mountain.finalSvg && mountain.steps.at(-1).cleanup, 'mountain landscape should use a cleaned final composition');
assert.ok(!mountain.finalSvg.includes('M60 220H530'), 'horizon should be split instead of drawn through the scene');
const cleanedMountain = sandbox.illustration(mountain.steps, mountain.steps.length - 1, mountain.finalSvg);
assert.ok(cleanedMountain.includes('fill="#f6f2ff"'), 'opaque foreground shapes should mask overlapping lines');
const finalShape = sandbox.illustration(sandbox.shapeLessons[3].steps, sandbox.shapeLessons[3].steps.length - 1);
assert.ok((finalShape.match(/<g /g) || []).length < sandbox.shapeLessons[3].steps.length, 'final form view should hide construction lines');
assert.equal(sandbox.shapeLessons.length, 5);
assert.ok(lessons.every(lesson => lesson.steps.every(step => step.title && step.instruction && step.svg)));

const titles = new Set(lessons.map(lesson => lesson.title));
for (const title of ['Chota Bheem', 'Chutki', 'Raju', 'Doraemon', 'Pikachu', 'Lord Ram', 'Krishna', 'Shiva']) {
  assert.ok(titles.has(title), `expected requested character lesson: ${title}`);
}

console.log(`Character lesson library passed: ${lessons.length} character guides including ${mythLessons.length} advanced mythology drawing/color lessons; ${sandbox.shapeLessons.length} shape lessons.`);
