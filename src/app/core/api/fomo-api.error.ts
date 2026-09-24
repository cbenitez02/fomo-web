import { HttpErrorResponse } from '@angular/common/http';
import type { PublicApiErrorBody } from './public.types';

export type FomoApiErrorKind = 'network' | 'not_found' | 'invalid' | 'unavailable' | 'unknown';

export class FomoApiError extends Error {
  readonly kind: FomoApiErrorKind;
  readonly status: number;
  readonly code: string;

  constructor(kind: FomoApiErrorKind, status: number, code: string, message: string) {
    super(message);
    this.name = 'FomoApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readApiError(value: unknown): PublicApiErrorBody['error'] | null {
  if (!isRecord(value) || !isRecord(value['error'])) return null;
  const code = value['error']['code'];
  const message = value['error']['message'];
  if (typeof code !== 'string' || typeof message !== 'string') return null;
  return { code, message };
}

function userMessage(kind: FomoApiErrorKind): string {
  switch (kind) {
    case 'network':
      return 'No pudimos conectar. Revisá tu conexión e intentá de nuevo.';
    case 'not_found':
      return 'No encontramos lo que buscás.';
    case 'invalid':
      return 'El pedido no es válido.';
    case 'unavailable':
      return 'El catálogo no está disponible en este momento.';
    default:
      return 'Algo salió mal. Probá de nuevo en un rato.';
  }
}

export function mapHttpError(error: HttpErrorResponse): FomoApiError {
  if (error.status === 0) {
    return new FomoApiError('network', 0, 'NETWORK_ERROR', userMessage('network'));
  }

  const body = readApiError(error.error);
  const code = body?.code ?? 'UNKNOWN';

  if (error.status === 404) {
    return new FomoApiError('not_found', 404, code, userMessage('not_found'));
  }
  if (error.status === 400) {
    return new FomoApiError('invalid', 400, code, userMessage('invalid'));
  }
  if (error.status === 503) {
    return new FomoApiError('unavailable', 503, code, userMessage('unavailable'));
  }

  return new FomoApiError('unknown', error.status, code, userMessage('unknown'));
}
