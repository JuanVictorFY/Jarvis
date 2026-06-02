export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', false);
    this.name = 'AuthError';
  }
}
