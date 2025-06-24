import { getViteSadiAuthId, getViteSadiXffHeader, getViteSadiTidHeader, isDev } from '../env/envHelpers.js';

export const SM_UNIVERSALID = `SM_UNIVERSALID`;
export const XFF_HEADER = `X-Forwarded-For`;
export const TID_HEADER = `TID`;

export const EMAIL_NOT_ON_ALLOWLIST_ERROR = `EMAIL_NOT_ON_ALLOWLIST`;
export const PII_SERVICE_ERROR = `PII_SERVICE_ERROR`;
export const ENROLLMENT_WINDOW_CLOSED_ERROR = `ENROLLMENT_WINDOW_CLOSED`;

/** Mapping of error constants to their error page URL paths. */
export const handledErrors: { [key: string]: string } = {
  [EMAIL_NOT_ON_ALLOWLIST_ERROR]: `/not-permitted`,
  [ENROLLMENT_WINDOW_CLOSED_ERROR]: `/access-limited`,
};

/** Error thrown by the API on any non-200 responses (and a few 200 responses as well). */
export class ReadError extends Error {
  status: number | null;
  cause: unknown | undefined;
  constructor(message: string, status: number | null, cause?: unknown) {
    if (cause instanceof ReadError) {
      super(cause.message);
      this.status = cause.status;
      this.cause = cause.cause;
    } else {
      super(message);
      this.status = status;
      this.cause = cause;
    }
    this.name = `ReadError`;
  }
}

/** Perform a runtime check whether an API response is of type ReadError. */
export function isReadError(error: unknown): error is ReadError {
  return error instanceof ReadError;
}

export const PREAUTH_UUID = `preauthUuid`;

export const formatAndAppendHeaders = (headers: { [p: string]: string }) => {
  const requestHeaders: { [p: string]: string } = {};

  const viteSadiAuthId = getViteSadiAuthId();
  const viteSadiXffHeader = getViteSadiXffHeader();
  const viteSadiTidHeader = getViteSadiTidHeader();
  const preauthUuid = localStorage.getItem(PREAUTH_UUID);
  if (isDev() && viteSadiAuthId) {
    requestHeaders[SM_UNIVERSALID] = preauthUuid ? preauthUuid : viteSadiAuthId;
    requestHeaders[XFF_HEADER] = viteSadiXffHeader ? viteSadiXffHeader : `76.122.220.120`;
    requestHeaders[TID_HEADER] = viteSadiTidHeader;
  }

  if (Object.keys(headers).length) {
    for (const [key, value] of Object.entries(headers)) {
      requestHeaders[key] = value;
    }
  }
  if (!headers[`Content-Type`]) {
    requestHeaders[`Content-Type`] = `application/json`;
  }
  return requestHeaders;
};

/** Append `params` to `url`, if `params` is not empty. */
export const formatQueryParams = (params: string, url: string) => {
  return params.length > 1 ? `${url}${params}` : url;
};
