import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyFilters, matchesFilters, normalizeSearch, readFilters } from "../app/publications/search.ts";
const post = { title: "آیت‌الله سید علی بهشتی", excerpt: "حکومت شورای اتفاق", tags: "پژوهش", category: "تاریخ", contentType: "article", language: "fa" };
test("Arabic and Persian forms and joining marks are equivalent", () => {
  assert.equal(normalizeSearch("بِهشتي كِتاب"), "بهشتی کتاب");
  assert.equal(matchesFilters(post, {...emptyFilters, q: "آيت الله بهشتي"}), true);
});
test("Combines topic, words, language and content type", () => {
  assert.equal(matchesFilters(post, {...emptyFilters, topic:"council", q:"بهشتی اتفاق", language:"fa", type:"article"}), true);
  assert.equal(matchesFilters(post, {...emptyFilters, language:"en"}), false);
  assert.equal(matchesFilters(post, {...emptyFilters, type:"book"}), false);
  assert.equal(matchesFilters(post, {...emptyFilters, q:"بهشتی ناموجود"}), false);
});
test("Rejects unknown URL options and retains custom topic", () => {
  assert.deepEqual(readFilters(new URLSearchParams("q=کتاب&type=bad&language=bad&topic=works")), {...emptyFilters,q:"کتاب",topic:"works"});
});
