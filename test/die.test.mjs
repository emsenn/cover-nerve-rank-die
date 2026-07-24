import assert from "node:assert/strict";
import test from "node:test";

import {
  COVER_NERVE_DIE,
  decodeCoverNerveResult,
  encodeCoverNerveRequest,
  executeCoverNerveDie,
} from "../src/index.mjs";
import { computeCoverNerve } from "../src/cover-nerve.mjs";

test("admitted executable vectors remain exact", () => {
  assert.deepEqual(computeCoverNerve({ entities: 1, cells: 0, components: 1 }), {
    h0rank: 1, h1rank: 0, coordinationFree: true, landauerBits: 0, coordinationCost: 0,
  });
  assert.deepEqual(computeCoverNerve({ entities: 6, cells: 7, components: 2 }), {
    h0rank: 2, h1rank: 3, coordinationFree: false, landauerBits: 3, coordinationCost: 3,
  });
  assert.throws(() => computeCoverNerve({ entities: 4, cells: 1, components: 1 }), /not an admissible CoverNerve/u);
});

test("typed RMN pinout is deterministic and effect-free", () => {
  const request = encodeCoverNerveRequest({ entities: 3, cells: 3, components: 1 });
  const first = executeCoverNerveDie(request.bytes);
  const replay = executeCoverNerveDie(request.bytes);
  assert.deepEqual(COVER_NERVE_DIE.effects, []);
  assert.equal(first.inputId, request.id);
  assert.equal(first.id, replay.id);
  assert.deepEqual(first.bytes, replay.bytes);
  assert.deepEqual(decodeCoverNerveResult(first.bytes).value, {
    kind: "CoverNerveRankResult.v1",
    h0rank: 1,
    h1rank: 1,
    coordinationFree: false,
    landauerBits: 1,
    coordinationCost: 1,
  });
});
