import type { Context } from "hono";

export interface SuccessBody<T> {
  ok: true;
  data: T;
}

export interface ErrorBody {
  ok: false;
  error: { code: string; message: string };
}

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json<SuccessBody<T>>({ ok: true, data }, status);
}

export function fail(c: Context, status: 400 | 404 | 409 | 500, code: string, message: string) {
  return c.json<ErrorBody>({ ok: false, error: { code, message } }, status);
}
