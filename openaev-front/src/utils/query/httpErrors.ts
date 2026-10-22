/**
 * The API client (`network.ts`) rejects with a plain `{ status, ...body }` object when the server
 * answered, and with `false` on a network failure: it never rejects with an AxiosError.
 */
const httpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const { status } = error as { status?: unknown };
  return typeof status === 'number' ? status : undefined;
};

/** Whether the error is an HTTP 4xx answer: retrying the same request cannot change the outcome. */
export const isClientError = (error: unknown): boolean => {
  const status = httpStatus(error);
  return status !== undefined && status >= 400 && status < 500;
};

/** Whether the server answered at all: an error without an HTTP status is a network failure. */
export const hasHttpStatus = (error: unknown): boolean => httpStatus(error) !== undefined;

/** Whether a query error is a 404 (e.g. the entity was deleted): an expected state, not a failure. */
export const isNotFoundError = (error: unknown): boolean => httpStatus(error) === 404;
