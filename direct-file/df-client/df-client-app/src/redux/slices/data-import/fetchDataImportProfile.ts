import { read } from '../../../hooks/useApiHook.js';

/** *
 * This encapsulates our fetch promise in a way that is easy to use `spy` on in tests
 * previously, we just used `spy` on globall fetch which has the downside that we can't
 * then trigger any logging which would also cause a fetch.
 */
export function fetchDataImportProfile(taxReturnID: string): Promise<unknown> {
  const headers = dataImportFetchHeaders(taxReturnID);
  return read<unknown>(`${import.meta.env.VITE_BACKEND_URL}v1/taxreturns/${taxReturnID}/populate`, { headers });
}

function dataImportFetchHeaders(taxReturnID: string): Record<string, string> {
  const profile = sessionStorage.getItem(`x-data-import-profile`) || ``;
  const dob = sessionStorage.getItem(`x-data-import-dob`);

  const headers: Record<string, string> = {
    SM_UNIVERSALID: taxReturnID || ``,
  };

  if (profile) {
    headers['x-data-import-profile'] = profile;
  }

  if (dob) {
    headers['x-data-import-dob'] = dob;
  }

  return headers;
}