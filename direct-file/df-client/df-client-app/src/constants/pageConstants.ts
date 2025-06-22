//page or query-parameter constants

import { DataImportRolloutBehavior } from '../redux/slices/data-import/dataImportProfileTypes.js';

export const LOCAL_DATA_IMPORT_BEHAVIOR = `DATA_IMPORT_ABOUT_YOU_BASIC_PLUS_IP_PIN_PLUS_W2_PLUS_1099_INT_PLUS_1095_A`;
export const DEFAULT_DATA_IMPORT_BEHAVIOR = `DATA_IMPORT_ABOUT_YOU_BASIC_PLUS_IP_PIN_PLUS_W2`;

export const REF_LOCATION = `ref_location`;

export const REF_LOCATION_VALUE = {
  SCREENER: `df_screener`,
  HOME: `df_home`,
  SUBMISSION: `df_submission`,
  AUTHSTATE: `df_authorize_state`,
} as const;

export const environmentNames = [`LOCALHOST`, `OPENFILE`] as const;
export type EnvironmentName = (typeof environmentNames)[number];

export type EnvironmentConfig = {
  hostNames: string[];
  // Is allowed to enter the flow
  flowEnabled: boolean;
  // Is allowed to transfer their federal return to state tools
  returnTransferEnabled: boolean;

  // Is allowed to access developer console
  developerToolsEnabled: boolean;

  // Is allowed to load a preauthUuid for authentication
  preauthUuidEnabled: boolean;

  isProd: boolean;

  // Test data import flows
  dataImportMode: 'clientside-intercept' | 'real-api';

  // Enable telemetry logging
  isTelemetryEnabled: boolean;

  // Do we allow switching to Spanish
  isSpanishEnabled: boolean;

  defaultDataImportRolloutBehavior: DataImportRolloutBehavior;
};

// List of client hosts and their configurations.
// TODO: https://git.irslabs.org/irslabs-prototypes/direct-file/-/issues/8485
export const ENVIRONMENT_CONFIGS: Record<EnvironmentName, EnvironmentConfig> = {
  LOCALHOST: {
    hostNames: [`http://localhost`],
    flowEnabled: true,
    returnTransferEnabled: true,
    developerToolsEnabled: true,
    preauthUuidEnabled: true,
    isProd: false,
    dataImportMode: `real-api`,
    isTelemetryEnabled: true,
    isSpanishEnabled: true,
    defaultDataImportRolloutBehavior: `DATA_IMPORT_ABOUT_YOU_BASIC_PLUS_IP_PIN_PLUS_W2_PLUS_1099_INT_PLUS_1095_A`,
  },
  OPENFILE: {
    hostNames: [`http://openfile.tax`],
    flowEnabled: true,
    returnTransferEnabled: true,
    developerToolsEnabled: true,
    preauthUuidEnabled: true,
    isProd: false,
    dataImportMode: `clientside-intercept`,
    isTelemetryEnabled: true,
    isSpanishEnabled: true,
    defaultDataImportRolloutBehavior: `DATA_IMPORT_ABOUT_YOU_BASIC_PLUS_IP_PIN_PLUS_W2_PLUS_1099_INT_PLUS_1095_A`,
  },
} as const;

export const isFlowEnabled = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.flowEnabled)
    .some((config) => config.hostNames.some((hostName) => location.href.startsWith(hostName)));
};

export const isReturnTransferEnabled = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.returnTransferEnabled)
    .some((config) => config.hostNames.some((hostName) => location.href.startsWith(hostName)));
};

export const isDeveloperToolsEnabled = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.developerToolsEnabled)
    .some((config) => config.hostNames.some((hostName) => location.href.startsWith(hostName)));
};

/**
 * PreauthUuid is a dev tool, so we check to make sure that
 * developerToolsEnabled as well as preauthUuidEnabled
 *
 * We just needed to turn it off in some environments where dev tools are on, but if dev tools are off,
 * preauthUuid should also be off.
 *
 * Anything else would be a misconfiguration.
 */
export const showPreauthUuidPanelOnDashboard = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.developerToolsEnabled && config.preauthUuidEnabled)
    .some((config) => config.hostNames.some((hostName) => location.href.startsWith(hostName)));
};

export const getDataImportMode = (): 'disabled' | 'clientside-intercept' | 'real-api' => {
  const override = typeof sessionStorage !== `undefined` ? sessionStorage.getItem(`DATAIMPORT_MODE_OVERRIDE`) : ``;
  if (override === `clientside-intercept` || override === `real-api`) {
    return override;
  }
  const configs = Object.values(ENVIRONMENT_CONFIGS).filter((config) =>
    config.hostNames.some((hostName) => {
      if (typeof location !== `undefined`) {
        return location.href.startsWith(hostName);
      }
      return false;
    })
  );
  if (configs.length !== 1) {
    return `disabled`;
  }
  const config = configs[0];
  return config.dataImportMode;
};

export const getDataImportDefaultRolloutBehavior = (): DataImportRolloutBehavior => {
  const configs = Object.values(ENVIRONMENT_CONFIGS).filter((config) =>
    config.hostNames.some((hostName) => {
      if (typeof location !== `undefined`) {
        return location.href.startsWith(hostName);
      }
      return false;
    })
  );
  if (configs.length !== 1) {
    return `DATA_IMPORT_ABOUT_YOU_BASIC_PLUS_IP_PIN_PLUS_W2`;
  }
  const config = configs[0];
  return config.defaultDataImportRolloutBehavior;
};

export const isTelemetryEnabled = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.isTelemetryEnabled)
    .some((config) =>
      config.hostNames.some((hostName) => typeof location !== `undefined` && location.href.startsWith(hostName))
    );
};

export const is1099RFeatureFlagEnabled = (): boolean => {
  return true;
};

export const isSpanishEnabled = (): boolean => {
  return Object.values(ENVIRONMENT_CONFIGS)
    .filter((config) => config.isSpanishEnabled)
    .some((config) => config.hostNames.some((hostName) => location.href.startsWith(hostName)));
};
