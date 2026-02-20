import { SERVER_ERROR_MESSAGES } from '../constants/errorMessages';

interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

export function getErrorMessage(
  err: unknown,
  options: {
    notFoundMessage?: string;
    serverErrorMessage?: string;
    message500?: string;
    defaultMessage?: string;
    networkErrorMessage?: string;
  } = {}
): string {
  const {
    notFoundMessage = SERVER_ERROR_MESSAGES.NOT_FOUND,
    serverErrorMessage = SERVER_ERROR_MESSAGES.SERVER_UNAVAILABLE,
    message500,
    defaultMessage = SERVER_ERROR_MESSAGES.DEFAULT,
    networkErrorMessage = SERVER_ERROR_MESSAGES.NETWORK,
  } = options;

  if (!err || typeof err !== 'object') {
    return defaultMessage;
  }

  const axiosError = err as ApiErrorResponse;

  if ('response' in axiosError && axiosError.response) {
    const { status, data } = axiosError.response;

    if (status === 404) {
      return (typeof data?.error === 'string' ? data.error : notFoundMessage);
    }

    if (status === 500) {
      return message500 ?? serverErrorMessage;
    }

    if (!status) {
      return serverErrorMessage;
    }

    if (data?.error) {
      return data.error;
    }
  }

  return networkErrorMessage;
}
