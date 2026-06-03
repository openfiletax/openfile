import { it, describe, expect } from 'vitest';
import { Path } from '../../flow/Path.js';
import { createEnumWrapper } from '../persistenceWrappers.js';
import { makeW2Data, mfjFilerData, singleFilerData } from '../testData.js';
import { setupFactGraph } from '../setupFactGraph.js';

describe(`Saver's credit multiplier`, () => {
  describe(`as MFJ`, () => {
    it(`has multiplier of 0.5`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(46000.49),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`fifty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(5);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`5/10`);
    });

    it(`has multiplier of 0.2`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(47500.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(51000.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);
    });

    it(`has multiplier of 0.1`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(51000.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(79000.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);
    });

    it(`has multiplier of 0.0`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        ...makeW2Data(79000.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`zero`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(0);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`0/10`);
    });
  });

  describe(`as HoH`, () => {
    it(`has multiplier of 0.5`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(34500.49),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`fifty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(5);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`5/10`);
    });

    it(`has multiplier of 0.2`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(35625.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(38250.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);
    });

    it(`has multiplier of 0.1`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(38250.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(59250.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);
    });

    it(`has multiplier of 0.0`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...mfjFilerData,
        [`/filingStatus`]: createEnumWrapper(`headOfHousehold`, `/filingStatusOptions`),
        ...makeW2Data(59250.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`zero`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(0);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`0/10`);
    });
  });

  describe(`as non MFJ or HoH`, () => {
    it(`has multiplier of 0.5`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(23000.49),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`fifty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(5);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`5/10`);
    });

    it(`has multiplier of 0.2`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(23750.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(25500.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`twenty`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(2);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`2/10`);
    });

    it(`has multiplier of 0.1`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(25500.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);

      const { factGraph: factGraph2 } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(39500.49),
      });
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`ten`);
      expect(factGraph2.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(1);
      expect(factGraph2.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`1/10`);
    });

    it(`has multiplier of 0.0`, ({ task }) => {
      task.meta.testedFactPaths = [
        `/saversCreditMultiplier`,
        `/pdfSaversCreditMultiplierAsInt`,
        `/saversCreditMultiplierAsRational`,
      ];

      const { factGraph } = setupFactGraph({
        ...singleFilerData,
        ...makeW2Data(39500.5),
      });
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplier`, null)).get.getValue()).toBe(`zero`);
      expect(factGraph.get(Path.concretePath(`/pdfSaversCreditMultiplierAsInt`, null)).get).toBe(0);
      expect(factGraph.get(Path.concretePath(`/saversCreditMultiplierAsRational`, null)).get.toString()).toBe(`0/10`);
    });
  });
});
