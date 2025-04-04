import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin-portal/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/admin-portal/dashboard"!</div>
}
