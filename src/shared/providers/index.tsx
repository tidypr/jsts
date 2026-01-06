import { PropsWithChildren } from 'react';
import { ReactQueryProvider } from './ReactQueryProvider';
import ThemeProvider from './ThemeProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ReactQueryProvider>
  );
}
