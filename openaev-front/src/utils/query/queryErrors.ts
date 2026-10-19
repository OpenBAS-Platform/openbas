const MAX_RETRIES = 3;

const statusOf = (error: unknown): number | undefined => {
  if (error === null || typeof error !== 'object') {
    return undefined;
  }
  const { status, response } = error as {
    status?: unknown;
    response?: { status?: unknown };
  };
  if (typeof status === 'number') {
    return status;
  }
  return typeof response?.status === 'number' ? response.status : undefined;
};

// A 4xx answer (deleted, forbidden, logged out) will not change on retry.
export const isClientError = (error: unknown) => {
  const status = statusOf(error);
  return status !== undefined && status >= 400 && status < 500;
};

export const retryUnlessClientError = (failureCount: number, error: unknown) => !isClientError(error) && failureCount < MAX_RETRIES;
