/**
 * O backend responde erro de validação como
 * `{ statusCode, message, errors: [{ field, messages }] }`.
 *
 * `error.message` do axios traz apenas "Request failed with status code 400",
 * então sem ler o corpo da resposta o usuário recebe um 400 genérico e não
 * descobre qual campo está errado.
 */

export type ApiFieldError = {
  field: string;
  messages: string[];
};

export type ApiErrorShape = {
  message: string;
  status?: number;
  fieldErrors?: ApiFieldError[];
};

type AxiosLikeError = {
  message?: string;
  code?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      errors?: ApiFieldError[];
    };
  };
};

export function extractApiError(error: unknown): ApiErrorShape {
  const axiosError = error as AxiosLikeError;
  const payload = axiosError?.response?.data;
  const status = axiosError?.response?.status;

  const rawMessage = payload?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(", ")
    : rawMessage || fallbackMessage(axiosError, status);

  return {
    message,
    status,
    fieldErrors: payload?.errors,
  };
}

function fallbackMessage(error: AxiosLikeError, status?: number): string {
  if (error?.code === "ECONNABORTED" || !error?.response) {
    return "Não foi possível conectar ao servidor. Verifique se a API está no ar.";
  }
  if (status === 401) return "Sessão expirada. Entre novamente.";
  if (status === 403) return "Você não tem permissão para esta ação.";
  if (status === 404) return "Registro não encontrado.";
  return error?.message || "Erro inesperado. Tente novamente.";
}

/**
 * Erro serializável para atravessar a fronteira de Server Action e chegar
 * intacto ao React Query no cliente.
 */
export class ApiError extends Error {
  status?: number;
  fieldErrors?: ApiFieldError[];

  constructor({ message, status, fieldErrors }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Converte qualquer falha de request numa mensagem única e legível. */
export function toApiErrorMessage(error: unknown): string {
  const { message, fieldErrors } = extractApiError(error);

  if (fieldErrors?.length) {
    const details = fieldErrors
      .map((fieldError) => `${fieldError.field}: ${fieldError.messages.join(", ")}`)
      .join(" | ");
    return `${message} — ${details}`;
  }

  return message;
}

/**
 * Resultado de uma Server Action. Erro esperado volta como valor porque, em
 * produção, o React não repassa a mensagem de um erro lançado no servidor
 * (só um digest), e o usuário veria um texto genérico.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number; fieldErrors?: ApiFieldError[] };

/** Falha de request no formato que a Server Action devolve ao cliente. */
export function toActionFailure(error: unknown): Extract<ActionResult<never>, { ok: false }> {
  const { status, fieldErrors } = extractApiError(error);
  return {
    ok: false,
    message: toApiErrorMessage(error),
    ...(status !== undefined ? { status } : {}),
    ...(fieldErrors?.length ? { fieldErrors } : {}),
  };
}

function isActionResult(value: unknown): value is ActionResult<unknown> {
  if (typeof value !== "object" || value === null || !("ok" in value)) return false;
  const result = value as { ok: unknown; message?: unknown };
  if (result.ok === true) return "data" in result;
  return result.ok === false && typeof result.message === "string";
}

/**
 * Desembrulha o resultado de uma Server Action: devolve o dado ou lança
 * `ApiError` com a mensagem real do backend. Valores fora desse formato
 * passam direto.
 */
export function unwrapActionResult<T>(value: ActionResult<T> | T): T {
  if (!isActionResult(value)) return value as T;
  if (value.ok) return value.data as T;
  throw new ApiError({ message: value.message, status: value.status, fieldErrors: value.fieldErrors });
}
