/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthRouteImport } from './routes/auth/route'
import { Route as AppRouteImport } from './routes/app/route'
import { Route as IndexImport } from './routes/index'
import { Route as AuthRegisterImport } from './routes/auth/register'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AppTasksIndexImport } from './routes/app/tasks/index'
import { Route as AppProjectsIndexImport } from './routes/app/projects/index'
import { Route as AppProfileIndexImport } from './routes/app/profile/index'
import { Route as AppDashboardIndexImport } from './routes/app/dashboard/index'
import { Route as AppAdminPortalIndexImport } from './routes/app/admin-portal/index'
import { Route as AppProjectsProjectIdImport } from './routes/app/projects/$projectId'
import { Route as AppAdminPortalUsersIndexImport } from './routes/app/admin-portal/users/index'
import { Route as AppAdminPortalProjectsIndexImport } from './routes/app/admin-portal/projects/index'
import { Route as AppAdminPortalDashboardIndexImport } from './routes/app/admin-portal/dashboard/index'

// Create/Update Routes

const AuthRouteRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const AppRouteRoute = AppRouteImport.update({
  id: '/app',
  path: '/app',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthRegisterRoute = AuthRegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => AuthRouteRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRouteRoute,
} as any)

const AppTasksIndexRoute = AppTasksIndexImport.update({
  id: '/tasks/',
  path: '/tasks/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppProjectsIndexRoute = AppProjectsIndexImport.update({
  id: '/projects/',
  path: '/projects/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppProfileIndexRoute = AppProfileIndexImport.update({
  id: '/profile/',
  path: '/profile/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppDashboardIndexRoute = AppDashboardIndexImport.update({
  id: '/dashboard/',
  path: '/dashboard/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppAdminPortalIndexRoute = AppAdminPortalIndexImport.update({
  id: '/admin-portal/',
  path: '/admin-portal/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppProjectsProjectIdRoute = AppProjectsProjectIdImport.update({
  id: '/projects/$projectId',
  path: '/projects/$projectId',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppAdminPortalUsersIndexRoute = AppAdminPortalUsersIndexImport.update({
  id: '/admin-portal/users/',
  path: '/admin-portal/users/',
  getParentRoute: () => AppRouteRoute,
} as any)

const AppAdminPortalProjectsIndexRoute =
  AppAdminPortalProjectsIndexImport.update({
    id: '/admin-portal/projects/',
    path: '/admin-portal/projects/',
    getParentRoute: () => AppRouteRoute,
  } as any)

const AppAdminPortalDashboardIndexRoute =
  AppAdminPortalDashboardIndexImport.update({
    id: '/admin-portal/dashboard/',
    path: '/admin-portal/dashboard/',
    getParentRoute: () => AppRouteRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/app': {
      id: '/app'
      path: '/app'
      fullPath: '/app'
      preLoaderRoute: typeof AppRouteImport
      parentRoute: typeof rootRoute
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof AuthRouteImport
    }
    '/auth/register': {
      id: '/auth/register'
      path: '/register'
      fullPath: '/auth/register'
      preLoaderRoute: typeof AuthRegisterImport
      parentRoute: typeof AuthRouteImport
    }
    '/app/projects/$projectId': {
      id: '/app/projects/$projectId'
      path: '/projects/$projectId'
      fullPath: '/app/projects/$projectId'
      preLoaderRoute: typeof AppProjectsProjectIdImport
      parentRoute: typeof AppRouteImport
    }
    '/app/admin-portal/': {
      id: '/app/admin-portal/'
      path: '/admin-portal'
      fullPath: '/app/admin-portal'
      preLoaderRoute: typeof AppAdminPortalIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/dashboard/': {
      id: '/app/dashboard/'
      path: '/dashboard'
      fullPath: '/app/dashboard'
      preLoaderRoute: typeof AppDashboardIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/profile/': {
      id: '/app/profile/'
      path: '/profile'
      fullPath: '/app/profile'
      preLoaderRoute: typeof AppProfileIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/projects/': {
      id: '/app/projects/'
      path: '/projects'
      fullPath: '/app/projects'
      preLoaderRoute: typeof AppProjectsIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/tasks/': {
      id: '/app/tasks/'
      path: '/tasks'
      fullPath: '/app/tasks'
      preLoaderRoute: typeof AppTasksIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/admin-portal/dashboard/': {
      id: '/app/admin-portal/dashboard/'
      path: '/admin-portal/dashboard'
      fullPath: '/app/admin-portal/dashboard'
      preLoaderRoute: typeof AppAdminPortalDashboardIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/admin-portal/projects/': {
      id: '/app/admin-portal/projects/'
      path: '/admin-portal/projects'
      fullPath: '/app/admin-portal/projects'
      preLoaderRoute: typeof AppAdminPortalProjectsIndexImport
      parentRoute: typeof AppRouteImport
    }
    '/app/admin-portal/users/': {
      id: '/app/admin-portal/users/'
      path: '/admin-portal/users'
      fullPath: '/app/admin-portal/users'
      preLoaderRoute: typeof AppAdminPortalUsersIndexImport
      parentRoute: typeof AppRouteImport
    }
  }
}

// Create and export the route tree

interface AppRouteRouteChildren {
  AppProjectsProjectIdRoute: typeof AppProjectsProjectIdRoute
  AppAdminPortalIndexRoute: typeof AppAdminPortalIndexRoute
  AppDashboardIndexRoute: typeof AppDashboardIndexRoute
  AppProfileIndexRoute: typeof AppProfileIndexRoute
  AppProjectsIndexRoute: typeof AppProjectsIndexRoute
  AppTasksIndexRoute: typeof AppTasksIndexRoute
  AppAdminPortalDashboardIndexRoute: typeof AppAdminPortalDashboardIndexRoute
  AppAdminPortalProjectsIndexRoute: typeof AppAdminPortalProjectsIndexRoute
  AppAdminPortalUsersIndexRoute: typeof AppAdminPortalUsersIndexRoute
}

const AppRouteRouteChildren: AppRouteRouteChildren = {
  AppProjectsProjectIdRoute: AppProjectsProjectIdRoute,
  AppAdminPortalIndexRoute: AppAdminPortalIndexRoute,
  AppDashboardIndexRoute: AppDashboardIndexRoute,
  AppProfileIndexRoute: AppProfileIndexRoute,
  AppProjectsIndexRoute: AppProjectsIndexRoute,
  AppTasksIndexRoute: AppTasksIndexRoute,
  AppAdminPortalDashboardIndexRoute: AppAdminPortalDashboardIndexRoute,
  AppAdminPortalProjectsIndexRoute: AppAdminPortalProjectsIndexRoute,
  AppAdminPortalUsersIndexRoute: AppAdminPortalUsersIndexRoute,
}

const AppRouteRouteWithChildren = AppRouteRoute._addFileChildren(
  AppRouteRouteChildren,
)

interface AuthRouteRouteChildren {
  AuthLoginRoute: typeof AuthLoginRoute
  AuthRegisterRoute: typeof AuthRegisterRoute
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthLoginRoute: AuthLoginRoute,
  AuthRegisterRoute: AuthRegisterRoute,
}

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth': typeof AuthRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects/$projectId': typeof AppProjectsProjectIdRoute
  '/app/admin-portal': typeof AppAdminPortalIndexRoute
  '/app/dashboard': typeof AppDashboardIndexRoute
  '/app/profile': typeof AppProfileIndexRoute
  '/app/projects': typeof AppProjectsIndexRoute
  '/app/tasks': typeof AppTasksIndexRoute
  '/app/admin-portal/dashboard': typeof AppAdminPortalDashboardIndexRoute
  '/app/admin-portal/projects': typeof AppAdminPortalProjectsIndexRoute
  '/app/admin-portal/users': typeof AppAdminPortalUsersIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth': typeof AuthRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects/$projectId': typeof AppProjectsProjectIdRoute
  '/app/admin-portal': typeof AppAdminPortalIndexRoute
  '/app/dashboard': typeof AppDashboardIndexRoute
  '/app/profile': typeof AppProfileIndexRoute
  '/app/projects': typeof AppProjectsIndexRoute
  '/app/tasks': typeof AppTasksIndexRoute
  '/app/admin-portal/dashboard': typeof AppAdminPortalDashboardIndexRoute
  '/app/admin-portal/projects': typeof AppAdminPortalProjectsIndexRoute
  '/app/admin-portal/users': typeof AppAdminPortalUsersIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth': typeof AuthRouteRouteWithChildren
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects/$projectId': typeof AppProjectsProjectIdRoute
  '/app/admin-portal/': typeof AppAdminPortalIndexRoute
  '/app/dashboard/': typeof AppDashboardIndexRoute
  '/app/profile/': typeof AppProfileIndexRoute
  '/app/projects/': typeof AppProjectsIndexRoute
  '/app/tasks/': typeof AppTasksIndexRoute
  '/app/admin-portal/dashboard/': typeof AppAdminPortalDashboardIndexRoute
  '/app/admin-portal/projects/': typeof AppAdminPortalProjectsIndexRoute
  '/app/admin-portal/users/': typeof AppAdminPortalUsersIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/app'
    | '/auth'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects/$projectId'
    | '/app/admin-portal'
    | '/app/dashboard'
    | '/app/profile'
    | '/app/projects'
    | '/app/tasks'
    | '/app/admin-portal/dashboard'
    | '/app/admin-portal/projects'
    | '/app/admin-portal/users'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/app'
    | '/auth'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects/$projectId'
    | '/app/admin-portal'
    | '/app/dashboard'
    | '/app/profile'
    | '/app/projects'
    | '/app/tasks'
    | '/app/admin-portal/dashboard'
    | '/app/admin-portal/projects'
    | '/app/admin-portal/users'
  id:
    | '__root__'
    | '/'
    | '/app'
    | '/auth'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects/$projectId'
    | '/app/admin-portal/'
    | '/app/dashboard/'
    | '/app/profile/'
    | '/app/projects/'
    | '/app/tasks/'
    | '/app/admin-portal/dashboard/'
    | '/app/admin-portal/projects/'
    | '/app/admin-portal/users/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppRouteRoute: typeof AppRouteRouteWithChildren
  AuthRouteRoute: typeof AuthRouteRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AppRouteRoute: AppRouteRouteWithChildren,
  AuthRouteRoute: AuthRouteRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/app",
        "/auth"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/app": {
      "filePath": "app/route.tsx",
      "children": [
        "/app/projects/$projectId",
        "/app/admin-portal/",
        "/app/dashboard/",
        "/app/profile/",
        "/app/projects/",
        "/app/tasks/",
        "/app/admin-portal/dashboard/",
        "/app/admin-portal/projects/",
        "/app/admin-portal/users/"
      ]
    },
    "/auth": {
      "filePath": "auth/route.tsx",
      "children": [
        "/auth/login",
        "/auth/register"
      ]
    },
    "/auth/login": {
      "filePath": "auth/login.tsx",
      "parent": "/auth"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx",
      "parent": "/auth"
    },
    "/app/projects/$projectId": {
      "filePath": "app/projects/$projectId.tsx",
      "parent": "/app"
    },
    "/app/admin-portal/": {
      "filePath": "app/admin-portal/index.tsx",
      "parent": "/app"
    },
    "/app/dashboard/": {
      "filePath": "app/dashboard/index.tsx",
      "parent": "/app"
    },
    "/app/profile/": {
      "filePath": "app/profile/index.tsx",
      "parent": "/app"
    },
    "/app/projects/": {
      "filePath": "app/projects/index.tsx",
      "parent": "/app"
    },
    "/app/tasks/": {
      "filePath": "app/tasks/index.tsx",
      "parent": "/app"
    },
    "/app/admin-portal/dashboard/": {
      "filePath": "app/admin-portal/dashboard/index.tsx",
      "parent": "/app"
    },
    "/app/admin-portal/projects/": {
      "filePath": "app/admin-portal/projects/index.tsx",
      "parent": "/app"
    },
    "/app/admin-portal/users/": {
      "filePath": "app/admin-portal/users/index.tsx",
      "parent": "/app"
    }
  }
}
ROUTE_MANIFEST_END */
