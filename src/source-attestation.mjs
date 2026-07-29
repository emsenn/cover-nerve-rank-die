import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const SOURCES = [
  { declarationFile: "Obsmetrologia/Cohomology/CoordinationCohomology.lean", url: new URL("../../../../lib/obsmetrologia/Obsmetrologia/Cohomology/CoordinationCohomology.lean", import.meta.url), sha256: "6494b3f82306922978345eb22d3fab58bbc8240c3dbb62c9e2a5fc915ccd9e06" },
  { declarationFile: "Obsmetrologia/Cohomology/LandauerEntropy.lean", url: new URL("../../../../lib/obsmetrologia/Obsmetrologia/Cohomology/LandauerEntropy.lean", import.meta.url), sha256: "c681484d6f77d21c49f30f211832245dcf80184067faf8e69e946a707d933801" },
];

const DECLARATIONS = [
  "Obsmetrologia.Cohomology.CoverNerve.H0rank", "Obsmetrologia.Cohomology.CoverNerve.H1rank",
  "Obsmetrologia.Cohomology.CoverNerve.h1_vanishes_iff_forest", "Obsmetrologia.Cohomology.CoverNerve.h1rank_is_coordination_cost",
  "Obsmetrologia.Landauer.landauerBits", "Obsmetrologia.Landauer.landauer_zero_iff_reversible", "Obsmetrologia.Landauer.landauer_eq_coordination_cost",
];

export function attestCoverNerveSources() {
  const sources = SOURCES.map((source) => {
    const observedSha256 = createHash("sha256").update(readFileSync(source.url)).digest("hex");
    return { file: source.declarationFile, expectedSha256: source.sha256, observedSha256, matches: observedSha256 === source.sha256 };
  });
  if (sources.some(({ matches }) => !matches)) throw new Error("admitted CoverNerve source bytes have drifted; conformance evidence is stale");
  return { library: "@lenticule-science/obsmetrologia", sources, declarations: DECLARATIONS, assurance: { kind: "source-pinned-executable-projection", conformance: "Lean examples and JavaScript regression vectors exercise the same admitted cases", limitation: "the JavaScript is separately implemented and is not a formally verified extraction from Lean" } };
}
