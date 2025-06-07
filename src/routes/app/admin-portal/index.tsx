import { createFileRoute, redirect } from '@tanstack/react-router'
import { authService } from '@/lib/auth'

export const Route = createFileRoute('/app/admin-portal/')({
  component: RouteComponent,
  loader: async () => {
    const isLoggedIn = await authService.isLoggedIn();
    if (!isLoggedIn) {
      return redirect({ to: "/auth/login" });
    }

    const isAdmin = await authService.hasRole("ADMIN");
    if (!isAdmin) {
      return redirect({ to: "/app/dashboard" });
    }
  },
})

function RouteComponent() {
  return <div>Hello "/app/admin-portal/"!</div>
}
