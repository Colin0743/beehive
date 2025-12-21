import { ErrorType, AppError } from '@/types';

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 创建应用错误
   */
  static createError(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any
  ): AppError {
    return new AppError(type, message, code, details);
  }

  /**
   * 处理错误并返回用户友好的消息
   */
  static handleError(error: unknown): string {
    if (error instanceof AppError) {
      return this.getErrorMessage(error);
    }

    if (error instanceof Error) {
      // 处理常见的浏览器错误
      if (error.name === 'QuotaExceededError') {
        return '存储空间不足，请清理浏览器数据或删除一些项目';
      }
      if (error.name === 'NetworkError') {
        return '网络连接失败，请检查网络设置';
      }
      return error.message || '发生未知错误';
    }

    return '发生未知错误，请重试';
  }

  /**
   * 获取错误消息
   */
  static getErrorMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message || '输入数据验证失败';
      case ErrorType.PERMISSION:
        return error.message || '您没有权限执行此操作';
      case ErrorType.NOT_FOUND:
        return error.message || '请求的资源不存在';
      case ErrorType.STORAGE:
        return error.message || '存储操作失败';
      case ErrorType.NETWORK:
        return error.message || '网络请求失败';
      default:
        return error.message || '发生未知错误';
    }
  }

  /**
   * 记录错误（未来可以发送到错误监控服务）
   */
  static logError(error: unknown, context?: Record<string, any>): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
      code: error instanceof AppError ? error.code : undefined,
      details: error instanceof AppError ? error.details : undefined,
      context,
      timestamp: new Date().toISOString(),
    };

    // 开发环境输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // 生产环境可以发送到错误监控服务（如Sentry）
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context });
    // }
  }

  /**
   * 验证错误处理
   */
  static handleValidationError(field: string, message: string): AppError {
    return this.createError(
      ErrorType.VALIDATION,
      message,
      `VALIDATION_${field.toUpperCase()}`,
      { field }
    );
  }

  /**
   * 权限错误处理
   */
  static handlePermissionError(resource?: string): AppError {
    return this.createError(
      ErrorType.PERMISSION,
      resource ? `您没有权限访问${resource}` : '您没有权限执行此操作',
      'PERMISSION_DENIED',
      { resource }
    );
  }

  /**
   * 资源不存在错误处理
   */
  static handleNotFoundError(resource: string, id?: string): AppError {
    return this.createError(
      ErrorType.NOT_FOUND,
      id ? `${resource} (${id}) 不存在` : `${resource}不存在`,
      'NOT_FOUND',
      { resource, id }
    );
  }

  /**
   * 存储错误处理
   */
  static handleStorageError(message: string, details?: any): AppError {
    return this.createError(
      ErrorType.STORAGE,
      message,
      'STORAGE_ERROR',
      details
    );
  }
}

/**
 * 错误边界使用的错误信息
 */
export interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

/**
 * 异步错误处理包装器
 */
export function asyncErrorHandler<T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return asyncFn().catch((error) => {
    ErrorHandler.logError(error);
    throw ErrorHandler.handleError(error) || errorMessage || '操作失败';
  });
}

