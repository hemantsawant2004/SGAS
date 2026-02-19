
import { createRoot } from 'react-dom/client'
import './index.css'

import QueryProvider from './app/providers/QueryProvider.tsx'
import ThemeProvider from './app/providers/ThemeProvider.tsx'
import ReduxProvider from './app/providers/ReduxProvider.tsx'
import AppRouter from './app/routes/AppRouter.tsx'
import AuthBootstrap from './app/routes/guards/AuthBootstrap.tsx'

createRoot(document.getElementById('root')!).render(
   <ReduxProvider>
    <QueryProvider>
      <ThemeProvider>
        <AuthBootstrap>
          <AppRouter />
        </AuthBootstrap>
      </ThemeProvider>
    </QueryProvider>
  </ReduxProvider>
)
