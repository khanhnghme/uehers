import { supabase } from '@/integrations/supabase/client';

interface ErrorLogEntry {
  error_message: string;
  error_type: string;
  error_stack?: string;
  component?: string;
  url?: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

const ERROR_QUEUE: ErrorLogEntry[] = [];
let isProcessing = false;
let isInitialized = false;

async function flushQueue() {
  if (isProcessing || ERROR_QUEUE.length === 0) return;
  isProcessing = true;

  const batch = ERROR_QUEUE.splice(0, 10);
  try {
    await (supabase as any).from('system_error_logs').insert(
      batch.map(entry => ({
        ...entry,
        user_agent: navigator.userAgent,
      }))
    );
  } catch (e) {
    // Silently fail - don't create infinite error loops
    console.warn('[ErrorLogger] Failed to flush error logs:', e);
  } finally {
    isProcessing = false;
    if (ERROR_QUEUE.length > 0) {
      setTimeout(flushQueue, 1000);
    }
  }
}

export function logError(entry: ErrorLogEntry) {
  // Prevent logging our own logging errors
  if (entry.error_message?.includes('system_error_logs')) return;
  // Deduplicate rapid-fire identical errors
  const lastEntry = ERROR_QUEUE[ERROR_QUEUE.length - 1];
  if (lastEntry && lastEntry.error_message === entry.error_message && lastEntry.component === entry.component) return;

  ERROR_QUEUE.push({
    ...entry,
    url: entry.url || window.location.href,
  });

  // Debounce flush
  setTimeout(flushQueue, 500);
}

export function initGlobalErrorHandler() {
  if (isInitialized) return;
  isInitialized = true;

  // Catch unhandled JS errors
  window.addEventListener('error', (event) => {
    logError({
      error_message: event.message || 'Unknown error',
      error_type: 'runtime',
      error_stack: event.error?.stack,
      component: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason?.toString?.() || 'Unhandled promise rejection';
    // Skip auth refresh token errors (common & non-critical)
    if (message.includes('Refresh Token') || message.includes('refresh_token')) return;

    logError({
      error_message: message,
      error_type: 'promise_rejection',
      error_stack: reason?.stack,
    });
  });

  // Intercept console.error
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    originalConsoleError.apply(console, args);

    const message = args.map(a => {
      if (a instanceof Error) return a.message;
      if (typeof a === 'string') return a;
      try { return JSON.stringify(a); } catch { return String(a); }
    }).join(' ');

    // Skip noisy/internal errors
    if (
      message.includes('system_error_logs') ||
      message.includes('Refresh Token') ||
      message.includes('tailwindcss.com') ||
      message.length < 5
    ) return;

    logError({
      error_message: message.slice(0, 2000),
      error_type: 'console_error',
      error_stack: args.find(a => a instanceof Error)?.stack,
    });
  };
}
