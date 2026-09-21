import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("home keeps each flagship dossier in one visible block", async () => {
  const source = await read("app/HomeClient.tsx");

  assert.equal(source.includes("az-featured-research"), false);
  assert.equal(source.includes("az-trust-line"), false);
  assert.equal(source.includes("latest.length === 0"), false);
  assert.equal(source.includes("az-dossiers"), false);
});

test("archive and publications share one collection menu", async () => {
  const source = await read("app/components/PublicChrome.tsx");

  assert.match(source, /const collectionLinks = \[/);
  assert.match(source, />گنجینه<\/summary>/);
  assert.equal(source.includes("const primaryLinks"), false);
});

test("contribution honeypot does not expand the RTL page", async () => {
  const source = await read("app/contribute/ContributeClient.tsx");

  assert.equal(source.includes('left: "-9999px"'), false);
  assert.match(source, /clip: "rect\(0, 0, 0, 0\)"/);
});
