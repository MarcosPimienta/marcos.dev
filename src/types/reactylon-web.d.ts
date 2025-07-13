declare module 'reactylon/web' {
  import { FC, ReactNode } from 'react';

  export const Engine: FC<{
    antialias?: boolean;
    children?: ReactNode;
  }>;
}
