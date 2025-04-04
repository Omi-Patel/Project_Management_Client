import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin-portal/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/admin-portal/users"!</div>
}
