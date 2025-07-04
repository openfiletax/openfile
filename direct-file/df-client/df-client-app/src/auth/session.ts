import { formatAndAppendHeaders } from '../misc/apiHelpers.js';
import { clearBrowserStorage } from './storage.js';

/**
 * A class to handle user session timeouts.
 *
 * The identity proxy gives users 15 minutes between requests,
 * then ends their session. At approximately 5 minutes before this
 * happens, the user should be alerted and given the option to
 * manually extend their session by making another HTTP request.
 *
 * If a request to extend fails, the user should be alerted that
 * they need to sign back in.
 *
 * In all cases, the browser's data should be cleared to protect
 * tax information on shared devices.
 */
export class SessionClock {
  // time until the warning shows -- this would normally be 10 minutes
  // (as 10 + 5 = 15), but as we cannot guarantee the accuracy of JavaScript
  // timers, it is better to err on the side of caution
  nineMinutes: number;
  // time until user is logged out after warning shows
  fiveMinutes: number;
  // timer for both the first and second countdown
  timer: ReturnType<typeof setTimeout> | null;
  // keep track of the real time which has elapsed
  alertAt: number;
  // allow env var to disable autologout
  autoLogoutDisabled: boolean;

  constructor() {
    this.nineMinutes = 9 * 60000;
    this.fiveMinutes = 5 * 60000;
    this.timer = null;
    this.alertAt = 0;
    this.autoLogoutDisabled = import.meta.env.VITE_DISABLE_AUTO_LOGOUT === `true`;
  }

  /** Send the user to the logout page. */
  terminate = () => {
    clearBrowserStorage();
    window.location.href = `${import.meta.env.VITE_SADI_LOGOUT_URL}`;
  };

  /** Kickoff the first timer. */
  start = () => {
    if (!this.autoLogoutDisabled) {
      this.alertAt = Date.now() + this.nineMinutes;
      this.timer = setTimeout(this.warnUser, this.nineMinutes);
    }
  };

  /** Restart the first timer. */
  reset = () => {
    if (!this.autoLogoutDisabled) {
      if (this.timer) clearTimeout(this.timer);
      this.alertAt = Date.now() + this.nineMinutes;
      this.timer = setTimeout(this.warnUser, this.nineMinutes);
      window.sessionManager?.closeAlert?.();
    }
  };

  /** Warn the user of impending logout and kickoff the second timer. */
  warnUser = () => {
    const clockDrift = Date.now() - this.alertAt;
    if (clockDrift > this.fiveMinutes) {
      // too late, they've already been logged out
      this.alertUser();
    } else {
      if (this.timer) clearTimeout(this.timer);
      const msRemaining = Math.max(0, this.fiveMinutes - clockDrift);
      this.timer = setTimeout(this.terminate, msRemaining);
      window.sessionManager?.warnUser?.(this);
    }
  };

  /** Attempt to contact the identity proxy to prolong the user's session. */
  extend = () => {
    (async () => {
      const url = `${import.meta.env.VITE_BACKEND_URL}v1/session/keep-alive`;
      try {
        await fetch(url, {
          method: `GET`,
          headers: formatAndAppendHeaders({}),
        });
      } catch {
        this.warnUser();
      }
    })();
  };

  /** Alert the user that they've already been logged out by the identity proxy. */
  alertUser = () => {
    if (this.timer) clearTimeout(this.timer);
    const clockDrift = Date.now() - this.alertAt;
    const msRemaining = Math.max(0, this.fiveMinutes - clockDrift);
    this.timer = setTimeout(this.terminate, msRemaining);
    window.sessionManager?.alertUser?.(this);
  };
}
