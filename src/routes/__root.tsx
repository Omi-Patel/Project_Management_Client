import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../styles.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundary from '@/components/ErrorBoundary'
// Create a client
const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ErrorBoundary>
          <React.Fragment>
            <Toaster />
            <Outlet />
          </React.Fragment>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  )
}