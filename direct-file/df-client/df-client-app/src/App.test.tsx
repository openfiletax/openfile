import { render, screen } from '@testing-library/react';
import { mockUseTranslation } from './test/mocks/mockFunctions.js';
import App from './App.js';

vi.mock(`react-i18next`, () => ({
  useTranslation: mockUseTranslation,
  initReactI18next: {
    type: `3rdParty`,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init: () => {},
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withTranslation: () => (Component: any) => {
    Component.defaultProps = { ...Component.defaultProps, t: () => `` };
    return Component;
  },
  Trans: ({ children }: never) => children,
}));

vi.mock(`react`, async () => {
  const mod = await vi.importActual(`react`);
  return {
    ...mod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Suspense: ({ children }: any) => children,
  };
});

test.skip(`includes 'main' landmark`, async () => {
  render(<App />);
  const mainLandmark = await screen.findByRole(`main`);
  expect(mainLandmark).toBeInTheDocument();
});

test.skip(`includes skip link`, async () => {
  render(<App />);
  const skipLink = await screen.findByRole(`link`, { name: `Skip to main content` });
  expect(skipLink).toBeInTheDocument();
  const mainLandmark = await screen.findByRole(`main`);
  expect(skipLink.getAttribute(`href`)).toEqual(`#${mainLandmark.id}`);
});
