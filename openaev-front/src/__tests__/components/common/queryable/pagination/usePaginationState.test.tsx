import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import usePaginationState, { useLocalPaginationState } from '../../../../../components/common/queryable/pagination/usePaginationState';

/**
 * Lists patch their rows locally on single create/delete: incrementTotalElements
 * keeps the "1–N of X" counter in step with them without a refetch (#7769).
 */
describe('incrementTotalElements', () => {
  describe.each([
    ['usePaginationState', () => usePaginationState(0, 20)],
    ['useLocalPaginationState', () => useLocalPaginationState()],
  ])('%s', (_name, hook) => {
    it('should add and remove rows from the total', () => {
      // Arrange
      const { result } = renderHook(hook);
      act(() => result.current.handleChangeTotalElements(5));

      // Act
      act(() => result.current.incrementTotalElements(1));
      act(() => result.current.incrementTotalElements(-1));
      act(() => result.current.incrementTotalElements(-1));

      // Assert
      expect(result.current.getTotalElements()).toBe(4);
    });

    it('should apply successive calls in the same render on the latest total', () => {
      // Arrange
      const { result } = renderHook(hook);
      act(() => result.current.handleChangeTotalElements(5));

      // Act
      act(() => {
        result.current.incrementTotalElements(1);
        result.current.incrementTotalElements(1);
      });

      // Assert
      expect(result.current.getTotalElements()).toBe(7);
    });

    it('should never go below zero', () => {
      // Arrange
      const { result } = renderHook(hook);

      // Act
      act(() => result.current.incrementTotalElements(-1));

      // Assert
      expect(result.current.getTotalElements()).toBe(0);
    });
  });
});
