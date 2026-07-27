// Canonical typed RMN pinout for the CoverNerve rank logic die.
import {
  decodeRelationalValue,
  encodeRelationalValue,
} from "@lenticule-science/rmn-semantic-conformance-die/relational-value";
import {
  decodeSemantic,
  semanticBytes,
  semanticId,
} from "@lenticule-science/rmn-semantic-conformance-die";
import { computeCoverNerve } from "./cover-nerve.mjs";

export const COVER_NERVE_DIE = Object.freeze({
  kind: "LogicDie",
  name: "cover-nerve-rank",
  version: 1,
  input: "CoverNerveRankRequest.v1",
  output: "CoverNerveRankResult.v1",
  effects: [],
  refusals: [
    "non-canonical-rmn",
    "wrong-die-input",
    "invalid-cover-nerve",
  ],
});

function ascribedValue(value) {
  const encoded = encodeRelationalValue(value);
  const term = ["ascribe", encoded.type, encoded.term];
  return {
    bytes: semanticBytes(term),
    id: semanticId(term),
    term,
  };
}

function decodeAscribedValue(bytes) {
  const source = Buffer.from(bytes);
  const term = decodeSemantic(source);
  if (!semanticBytes(term).equals(source)) {
    const error = new Error("cover-nerve die input is not RFC 8949 deterministic CBOR");
    error.code = "non-canonical-rmn";
    throw error;
  }
  if (term?.[0] !== "ascribe" || term.length !== 3) {
    const error = new Error("cover-nerve die input is not one typed RMN value");
    error.code = "wrong-die-input";
    throw error;
  }
  return { term, value: decodeRelationalValue(term[1], term[2]) };
}

export function encodeCoverNerveRequest({ entities, cells, components }) {
  return ascribedValue({
    kind: COVER_NERVE_DIE.input,
    entities,
    cells,
    components,
  });
}

export function decodeCoverNerveRequest(bytes) {
  const decoded = decodeAscribedValue(bytes);
  const value = decoded.value;
  if (
    value?.kind !== COVER_NERVE_DIE.input
    || Object.keys(value).sort().join(",") !== "cells,components,entities,kind"
  ) {
    const error = new Error(`cover-nerve die requires exactly one ${COVER_NERVE_DIE.input}`);
    error.code = "wrong-die-input";
    throw error;
  }
  return { ...decoded, value };
}

export function encodeCoverNerveResult(readout) {
  return ascribedValue({
    kind: COVER_NERVE_DIE.output,
    h0rank: readout.h0rank,
    h1rank: readout.h1rank,
    coordinationFree: readout.coordinationFree,
    landauerBits: readout.landauerBits,
    coordinationCost: readout.coordinationCost,
  });
}

export function decodeCoverNerveResult(bytes) {
  const decoded = decodeAscribedValue(bytes);
  if (decoded.value?.kind !== COVER_NERVE_DIE.output) {
    const error = new Error(`cover-nerve die output is not ${COVER_NERVE_DIE.output}`);
    error.code = "wrong-die-output";
    throw error;
  }
  return decoded;
}

export function executeCoverNerveDie(inputBytes) {
  const input = decodeCoverNerveRequest(inputBytes);
  let readout;
  try {
    readout = computeCoverNerve(input.value);
  } catch (cause) {
    const error = new Error(cause.message, { cause });
    error.code = "invalid-cover-nerve";
    throw error;
  }
  return {
    inputId: semanticId(input.term),
    ...encodeCoverNerveResult(readout),
  };
}
