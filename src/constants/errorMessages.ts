import { API_BASE_URL } from './api';

export const DATASET_ERROR_MESSAGES = {
  notFoundMessage: 'Датасет с указанным ID не найден',
  message500:
    'Сервер не успел обработать запрос (ошибка 500). Попробуйте другой датасет или обновите страницу позже.',
  defaultMessage: 'Ошибка загрузки данных',
  networkErrorMessage: 'Ошибка загрузки данных. Проверьте подключение к серверу',
} as const;

export const FILE_VALIDATION = {
  WRONG_FORMAT: 'Допустим только формат .xlsx',
} as const;

export const SERVER_ERROR_MESSAGES = {
  NOT_FOUND: 'Ресурс не найден',
  SERVER_UNAVAILABLE: `Сервер недоступен. Проверьте, что бэкенд запущен на ${API_BASE_URL}`,
  DEFAULT: 'Произошла ошибка',
  NETWORK: 'Ошибка подключения к серверу',
} as const;
