declare module 'react-katex' {
  import React from 'react';
  export const InlineMath: React.FC<{ math: string; errorColor?: string; renderError?: (error: any) => React.ReactNode }>;
  export const BlockMath: React.FC<{ math: string; errorColor?: string; renderError?: (error: any) => React.ReactNode }>;
}
