import { supabase } from '../supabaseClient';

class ErrorLogger {
  static async logError(error, context = {}) {
    try {
      const errorData = {
        level: 'error',
        message: error.message || 'Unknown error',
        stack_trace: error.stack || null,
        user_id: context.userId || null,
        user_agent: navigator.userAgent || null,
        url: window.location.href || null,
        method: context.method || null,
        ip_address: context.ipAddress || null,
        request_data: context.requestData || null,
        response_data: context.responseData || null,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      const { data, error: logError } = await supabase
        .from('error_logs')
        .insert([errorData]);

      if (logError) {
        console.error('Failed to log error:', logError);
      }

      return { success: !logError, data };
    } catch (logError) {
      console.error('Error logging failed:', logError);
      return { success: false, error: logError };
    }
  }

  static async logWarning(message, context = {}) {
    try {
      const logData = {
        level: 'warning',
        message: message,
        user_id: context.userId || null,
        user_agent: navigator.userAgent || null,
        url: window.location.href || null,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      const { data, error } = await supabase
        .from('error_logs')
        .insert([logData]);

      if (error) {
        console.error('Failed to log warning:', error);
      }

      return { success: !error, data };
    } catch (logError) {
      console.error('Warning logging failed:', logError);
      return { success: false, error: logError };
    }
  }

  static async logInfo(message, context = {}) {
    try {
      const logData = {
        level: 'info',
        message: message,
        user_id: context.userId || null,
        user_agent: navigator.userAgent || null,
        url: window.location.href || null,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      const { data, error } = await supabase
        .from('error_logs')
        .insert([logData]);

      if (error) {
        console.error('Failed to log info:', error);
      }

      return { success: !error, data };
    } catch (logError) {
      console.error('Info logging failed:', logError);
      return { success: false, error: logError };
    }
  }

  // Global error handler
  static setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        url: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        type: 'unhandledrejection'
      });
    });
  }

  // API error interceptor
  static setupAxiosErrorInterceptor(axiosInstance) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logError(error, {
          method: error.config?.method,
          url: error.config?.url,
          requestData: error.config?.data,
          responseData: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }
}

export default ErrorLogger;
