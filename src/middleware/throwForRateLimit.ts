import { HttpResponse, ZObject } from "zapier-platform-core";

const FALLBACK_RETRY_SECONDS = 60;

const retryAfterSeconds = (header: string | undefined): number => {
  const seconds = Number.parseInt(header ?? "", 10);
  if (Number.isNaN(seconds)) {
    return FALLBACK_RETRY_SECONDS;
  }
  return Math.max(0, seconds);
};

export const isThrottledError = (error: unknown): error is Error =>
  typeof error === "object" &&
  error !== null &&
  (error as { name?: string }).name === "ThrottledError";

export const throwForRateLimit = (
  response: HttpResponse,
  z: ZObject,
): HttpResponse => {
  if (response.status !== 429) {
    return response;
  }

  const delay = retryAfterSeconds(response.getHeader("retry-after"));
  throw new z.errors.ThrottledError(
    `Cobot rate limit exceeded. Retrying in ${delay} seconds.`,
    delay,
  );
};
