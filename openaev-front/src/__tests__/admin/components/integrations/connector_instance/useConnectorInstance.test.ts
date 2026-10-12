import { describe, expect, it } from 'vitest';

import { resolveInitialConfigurationValue } from '../../../../../admin/components/integrations/connector_instance/useConnectorInstance';
import DOTS from '../../../../../constants/Strings';
import { type CatalogConnectorConfiguration } from '../../../../../utils/api-types';

// -- TEST DATA --

const buildDefinition = (overrides: Partial<CatalogConnectorConfiguration>): CatalogConnectorConfiguration => ({
  connector_configuration_key: 'SOME_KEY',
  connector_configuration_type: 'STRING',
  ...overrides,
});

const BOOLEAN_DEFAULT_TRUE = buildDefinition({
  connector_configuration_key: 'ELASTIC_VERIFY_SSL',
  connector_configuration_type: 'BOOLEAN',
  connector_configuration_default: true,
});

const INTEGER_DEFAULT_3 = buildDefinition({
  connector_configuration_key: 'ELASTIC_MAX_RETRY',
  connector_configuration_type: 'INTEGER',
  connector_configuration_default: 3,
});

const STRING_WITH_DEFAULT = buildDefinition({
  connector_configuration_key: 'COLLECTOR_LOG_LEVEL',
  connector_configuration_default: 'error',
});

const SECRET = buildDefinition({
  connector_configuration_key: 'ELASTIC_PASSWORD',
  connector_configuration_writeonly: true,
});

// -- TESTS --

describe('resolveInitialConfigurationValue', () => {
  describe('when a value is stored on the instance', () => {
    it('keeps a stored false boolean instead of the true default', () => {
      expect(resolveInitialConfigurationValue(BOOLEAN_DEFAULT_TRUE, false, true)).toBe(false);
    });

    it('keeps a stored 0 integer instead of the default', () => {
      expect(resolveInitialConfigurationValue(INTEGER_DEFAULT_3, 0, true)).toBe('0');
    });

    it('keeps a stored empty string instead of the default', () => {
      expect(resolveInitialConfigurationValue(STRING_WITH_DEFAULT, '', true)).toBe('');
    });

    it('keeps a stored truthy value', () => {
      expect(resolveInitialConfigurationValue(STRING_WITH_DEFAULT, 'debug', true)).toBe('debug');
    });
  });

  describe('when nothing is stored on the instance', () => {
    it.each([undefined, null])('falls back to the catalog default (%s)', (stored) => {
      expect(resolveInitialConfigurationValue(BOOLEAN_DEFAULT_TRUE, stored, true)).toBe(true);
    });

    it('stringifies an integer default', () => {
      expect(resolveInitialConfigurationValue(INTEGER_DEFAULT_3, undefined, false)).toBe('3');
    });

    it('falls back to an empty string when the catalog has no default', () => {
      expect(resolveInitialConfigurationValue(buildDefinition({}), undefined, false)).toBe('');
    });

    it('masks a write-only secret when editing', () => {
      expect(resolveInitialConfigurationValue(SECRET, undefined, true)).toBe(DOTS);
    });

    it('does not mask a write-only secret when creating', () => {
      expect(resolveInitialConfigurationValue(SECRET, undefined, false)).toBe('');
    });
  });
});
