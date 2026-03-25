export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly details: string,
    message?: string
  ) {
    super(message ?? details);
  }
}
