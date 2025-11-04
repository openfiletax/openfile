// eslint-disable-next-line max-len
import scenarioO1Json from './jsonScenarios/ats-1.json';
import { ConcretePath, FactGraph, ScalaList } from '@irs/js-factgraph-scala';
import { singleNoDependentsWithTwoW2s01 as snapshotScenario01 } from './goldenScenarios.js';
import { FactValue } from '../../types/core.js';
import { setupFactGraph } from '../setupFactGraph.js';
import { facts } from '../../fact-dictionary/generated/facts.js';

type FactStatus = { isComplete: boolean; value?: string };
export interface ExportedFactRecord {
  [path: string]: FactStatus;
}

export interface ScenarioTest {
  writableFacts: { [path: string]: FactValue };
  expectedExportedFacts: ExportedFactRecord;
}

const getExportedFactPaths = (): Array<String> => {
  return facts
    .filter((f) => f.Export?.['@mef'] == "true")
    .map((f) => f['@path'])
    // TODO: eventually remove
    .filter((f) => f in snapshotScenario01)
}
const exportedDerivedFactPaths = getExportedFactPaths();

// Generates a golden object that represents the expected completeness and derived fact values for a given scenario
const _createGoldenScenarioObject = (factGraph: FactGraph): ExportedFactRecord => {
  const snapshotScenarioObject: ExportedFactRecord = {};
  for (const factPath of exportedDerivedFactPaths) {
    const isComplete = factGraph.get(factPath as ConcretePath).complete;
    if (isComplete) {
      const fact = factGraph.get(factPath as ConcretePath).get as ScalaList<string>;
      snapshotScenarioObject[`${factPath}`] = { isComplete: isComplete, value: fact.toString() };
    } else {
      snapshotScenarioObject[`${factPath}`] = { isComplete: isComplete };
    }
  }
  return snapshotScenarioObject;
};
describe(`Scenario 01: single-no-dependents-with-two-w2s`, () => {
  it(`returns expected derived facts`, () => {
    const scenario01Test: ScenarioTest = {
      writableFacts: scenarioO1Json.facts,
      expectedExportedFacts: snapshotScenario01,
    };
    const { factGraph } = setupFactGraph(scenario01Test.writableFacts);

    for (const factPath of exportedDerivedFactPaths) {
      const isComplete = factGraph.get(factPath as ConcretePath).complete;
      expect(isComplete).toEqual(scenario01Test.expectedExportedFacts[`${factPath}`].isComplete);

      if (isComplete) {
        const fact = factGraph.get(factPath as ConcretePath).get as ScalaList<string>;
        expect(fact.toString()).toEqual(snapshotScenario01[`${factPath}`].value);
      }
    }
  });
});
