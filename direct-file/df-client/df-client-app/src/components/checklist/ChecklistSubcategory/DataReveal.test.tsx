import fs from 'fs';

import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { createFlowConfig } from '../../../flow/flowConfig.js';
import flowNodes from '../../../flow/flow.js';
import en from '../../../locales/en.yaml';
import { FactGraphContextProvider } from '../../../factgraph/FactGraphContext.js';
import { setupStore } from '../../../redux/store.js';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { initI18n } from '../../../i18n.js';

import { setupFactGraph } from '../../../test/setupFactGraph.js';
import DataReveal from './DataReveal.js';

// We are not mocking i18next here but using real en.yaml
const i18next = await initI18n();
i18next.addResourceBundle(`en`, `translation`, en);
i18next.changeLanguage(`en`);

describe(`DataReveal`, () => {
  const flow = createFlowConfig(flowNodes);

  // Check that all subcategories have either body or dataItems translations
  // Some subcategories have no data at all, custom or otherwise.
  const noDataReveals = [
    `/flow/income/income-sources`,
    `/flow/complete/sign-and-submit`,
    `/flow/complete/submit`,
    `/flow/complete/print-and-mail`,
  ];
  for (const [, subcategory] of flow.subcategoriesByRoute.entries()) {
    it(`subcategory ${subcategory.route} should have translations`, () => {
      if (subcategory.dataItems) {
        expect(i18next.exists(`checklist.${subcategory.route}.dataItems`)).toBe(true);
      } else if (!noDataReveals.includes(subcategory.route)) {
        expect(i18next.exists(`checklist.${subcategory.route}.body`)).toBe(true);
      }
    });
  }

  // Uses this scenario for testing
  const SCENARIO_FOLDER = `./src/test/factDictionaryTests/backend-scenarios`;

  // Expected data reveal items
  const json = fs.readFileSync(`${SCENARIO_FOLDER}/mfj-30k-eitc-ctc-actc.json`, `utf-8`);
  const expectedItems: Record<string, string[]> = {
    '/flow/you-and-your-family/about-you': [`Filer T Person V`],
    '/flow/you-and-your-family/spouse': [`Married`, `Spouse A Person`],
    '/flow/you-and-your-family/dependents': [`1 claimed dependent(s)`],
    '/flow/you-and-your-family/filing-status': [`Married Filing Jointly`],
    '/flow/income/jobs': [`Taxable amount: $30,000.00`],
    '/flow/income/interest': [`Taxable amount: $1,444.00`],
    '/flow/income/apf': [`None reported`],
    '/flow/income/unemployment': [`None reported`],
    '/flow/income/social-security': [`None reported`],
    '/flow/income/retirement': [`None reported`],
    '/flow/income/dependent-care': [`None reported`],
    '/flow/income/hsa': [`None reported`],
    '/flow/credits-and-deductions/deductions': [`Standard deduction: $`, `Adjustment: $`],
    '/flow/credits-and-deductions/credits': [`Refundable credits: $`],
    '/flow/your-taxes/estimated-taxes-paid': [`None reported`],
    '/flow/your-taxes/amount': [`Your refund: $`],
    '/flow/your-taxes/payment-method': [`Direct deposit refund`, `******1212`],
  };

  const factJson = JSON.parse(json);
  const { factGraph } = setupFactGraph(factJson.facts);
  for (const [, subcategory] of flow.subcategoriesByRoute.entries()) {
    it(`subcategory ${subcategory.route} should render data reveal`, () => {
      render(
        <Provider store={setupStore()}>
          <BrowserRouter>
            <HelmetProvider context={{}}>
              <FactGraphContextProvider existingFacts={factJson.facts}>
                <DataReveal
                  dataItems={subcategory.dataItems}
                  factGraph={factGraph}
                  subcategoryRoute={subcategory.route}
                  i18nKey={`checklist.${subcategory.route}.dataItems`}
                  collectionId={null}
                />
              </FactGraphContextProvider>
            </HelmetProvider>
          </BrowserRouter>
        </Provider>
      );

      // Check that all expected data reveal items are present
      for (const expectedData of expectedItems[subcategory.route] || []) {
        expect(screen.getByTestId(`checklist-data-reveal`).textContent).toContain(expectedData);
      }
    });
  }
});
