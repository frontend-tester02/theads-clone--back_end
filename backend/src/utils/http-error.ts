/**
 * An error thrown together with an HTTP status code.
 * The central error-handler maps it directly to the matching response.
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
