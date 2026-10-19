import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  ATOMIC_TESTINGS_LIST_KEY,
  atomicTestingKey,
  keyOfTopic,
  scenarioKey,
  SCENARIOS_LIST_KEY,
  simulationKey,
  SIMULATIONS_LIST_KEY,
  topicOfKey,
} from '../../../utils/query/keys';

const SEARCH_INPUT = {
  page: 0,
  size: 20,
};

describe('query keys', () => {
  describe('topicOfKey', () => {
    it('maps a list key to its list topic, whatever follows', () => {
      // Assert
      expect(topicOfKey(SCENARIOS_LIST_KEY)).toBe('list:scenarios');
      expect(topicOfKey([...ATOMIC_TESTINGS_LIST_KEY, SEARCH_INPUT, undefined])).toBe('list:atomic-testings');
    });

    it('maps an atomic testing key and its sub-resources to the entity topic', () => {
      // Assert
      expect(topicOfKey(atomicTestingKey('inject-1'))).toBe('atomic-testing:inject-1');
      expect(topicOfKey([...atomicTestingKey('inject-1'), 'overview'])).toBe('atomic-testing:inject-1');
      expect(topicOfKey([...atomicTestingKey('inject-1'), 'targets', SEARCH_INPUT])).toBe('atomic-testing:inject-1');
    });

    it('maps a scenario key and its sub-resources to the entity topic', () => {
      // Assert
      expect(topicOfKey(scenarioKey('scenario-1'))).toBe('scenario:scenario-1');
      expect(topicOfKey([...scenarioKey('scenario-1'), 'simulations', SEARCH_INPUT])).toBe('scenario:scenario-1');
    });

    it('maps a simulation key and its sub-resources to the entity topic', () => {
      // Assert
      expect(topicOfKey(simulationKey('simulation-1'))).toBe('simulation:simulation-1');
      expect(topicOfKey([...simulationKey('simulation-1'), 'injects', SEARCH_INPUT])).toBe('simulation:simulation-1');
      expect(topicOfKey(SIMULATIONS_LIST_KEY)).toBe('list:simulations');
    });

    it('ignores keys of entities without a topic', () => {
      // Assert
      expect(topicOfKey(['tag', 'tag-1'])).toBeUndefined();
      expect(topicOfKey(['settings'])).toBeUndefined();
    });

    it('ignores keys whose second segment is not a non-empty string', () => {
      // Assert
      expect(topicOfKey(['list'])).toBeUndefined();
      expect(topicOfKey(['list', ''])).toBeUndefined();
      expect(topicOfKey(['atomic-testing', 42])).toBeUndefined();
      expect(topicOfKey([{ entity: 'atomic-testing' }, 'inject-1'])).toBeUndefined();
    });
  });

  describe('keyOfTopic', () => {
    it('round-trips with topicOfKey', () => {
      // Arrange
      const keys = [SCENARIOS_LIST_KEY, ATOMIC_TESTINGS_LIST_KEY, atomicTestingKey('inject-1')];

      // Assert
      keys.forEach((key) => {
        const topic = topicOfKey(key);
        expect(topic).toBeDefined();
        expect(keyOfTopic(topic as string)).toEqual([...key]);
      });
    });

    it('matches every query of one atomic testing and no other', () => {
      // Arrange
      const queryClient = new QueryClient();
      const overview = [...atomicTestingKey('inject-1'), 'overview'];
      const targets = [...atomicTestingKey('inject-1'), 'targets', SEARCH_INPUT];
      const other = [...atomicTestingKey('inject-2'), 'overview'];
      [overview, targets, other, [...ATOMIC_TESTINGS_LIST_KEY, SEARCH_INPUT]].forEach(key => queryClient.setQueryData(key, {}));

      // Act
      const matched = queryClient.getQueryCache().findAll({ queryKey: keyOfTopic('atomic-testing:inject-1') }).map(query => query.queryKey);

      // Assert
      expect(matched).toHaveLength(2);
      expect(matched).toEqual(expect.arrayContaining([overview, targets]));
    });
  });
});
