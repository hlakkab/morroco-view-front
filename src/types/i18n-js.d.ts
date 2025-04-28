declare module 'i18n-js' {
  export let locale: string;
  export let defaultLocale: string;
  export let fallbacks: boolean;
  export let translations: any;
  
  export function t(scope: string, options?: any): string;
  export function l(scope: string, value: any, options?: any): string;
} 