export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details ?? null } },
      { status: error.status }
    );
  }
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "系统暂时无法完成操作，请稍后重试。" } },
    { status: 500 }
  );
}

