import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import App from './App.tsx';
import './index.css';

const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'lg',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  colors: {
    teal: [
      '#F0FDF9', '#CCFBEF', '#99F6E4', '#5EEAD4',
      '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E',
      '#115E59', '#134E4A',
    ],
  },
});

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>
);
