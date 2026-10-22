import { describe, expect, it } from 'vitest';

import { hasHttpStatus, isClientError, isNotFoundError } from '../../../utils/query/httpErrors';

// The shapes network.ts rejects with: the answer's status and body, or false on a network failure.
const answered = (status: number) => ({
  status,
  message: 'failed',
  forbiddenAction: false,
});

describe('httpErrors', () => {
  it('given_a404Answer_should_beNotFound', () => {
    expect(isNotFoundError(answered(404))).toBe(true);
    expect(isNotFoundError(answered(403))).toBe(false);
  });

  it.each([400, 403, 404, 409])('given_a%sAnswer_should_beAClientError', (status) => {
    expect(isClientError(answered(status))).toBe(true);
  });

  it('given_a500Answer_should_notBeAClientError', () => {
    expect(isClientError(answered(500))).toBe(false);
    expect(hasHttpStatus(answered(500))).toBe(true);
  });

  it.each([false, undefined, null, new Error('network'), { status: '404' }])('given_noHttpAnswer_%s_should_haveNoStatus', (error) => {
    expect(hasHttpStatus(error)).toBe(false);
    expect(isNotFoundError(error)).toBe(false);
  });
});
