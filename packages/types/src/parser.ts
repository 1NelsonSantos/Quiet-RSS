export interface RSSParserConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  userAgent?: string;
}

export enum RSSErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_URL = 'INVALID_URL',
  NOT_FOUND = 'NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SERVER_ERROR = 'SERVER_ERROR',
}

export interface RSSParsingError {
  message: string;
  type: RSSErrorType;
  statusCode?: number;
  originalError?: Error;
}
