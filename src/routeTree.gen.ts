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
import { Route as AppDashboardRouteImport } from './routes/app/dashboard/route'
import { Route as AppTasksIndexImport } from './routes/app/tasks/index'
import { Route as AppProjectsIndexImport } from './routes/app/projects/index'

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

const AppDashboardRouteRoute = AppDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AppRouteRoute,
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
    '/app/dashboard': {
      id: '/app/dashboard'
      path: '/dashboard'
      fullPath: '/app/dashboard'
      preLoaderRoute: typeof AppDashboardRouteImport
      parentRoute: typeof AppRouteImport
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
  }
}

// Create and export the route tree

interface AppRouteRouteChildren {
  AppDashboardRouteRoute: typeof AppDashboardRouteRoute
  AppProjectsIndexRoute: typeof AppProjectsIndexRoute
  AppTasksIndexRoute: typeof AppTasksIndexRoute
}

const AppRouteRouteChildren: AppRouteRouteChildren = {
  AppDashboardRouteRoute: AppDashboardRouteRoute,
  AppProjectsIndexRoute: AppProjectsIndexRoute,
  AppTasksIndexRoute: AppTasksIndexRoute,
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
  '/app/dashboard': typeof AppDashboardRouteRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects': typeof AppProjectsIndexRoute
  '/app/tasks': typeof AppTasksIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth': typeof AuthRouteRouteWithChildren
  '/app/dashboard': typeof AppDashboardRouteRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects': typeof AppProjectsIndexRoute
  '/app/tasks': typeof AppTasksIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/app': typeof AppRouteRouteWithChildren
  '/auth': typeof AuthRouteRouteWithChildren
  '/app/dashboard': typeof AppDashboardRouteRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/register': typeof AuthRegisterRoute
  '/app/projects/': typeof AppProjectsIndexRoute
  '/app/tasks/': typeof AppTasksIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/app'
    | '/auth'
    | '/app/dashboard'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects'
    | '/app/tasks'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/app'
    | '/auth'
    | '/app/dashboard'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects'
    | '/app/tasks'
  id:
    | '__root__'
    | '/'
    | '/app'
    | '/auth'
    | '/app/dashboard'
    | '/auth/login'
    | '/auth/register'
    | '/app/projects/'
    | '/app/tasks/'
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
        "/app/dashboard",
        "/app/projects/",
        "/app/tasks/"
      ]
    },
    "/auth": {
      "filePath": "auth/route.tsx",
      "children": [
        "/auth/login",
        "/auth/register"
      ]
    },
    "/app/dashboard": {
      "filePath": "app/dashboard/route.tsx",
      "parent": "/app"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx",
      "parent": "/auth"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx",
      "parent": "/auth"
    },
    "/app/projects/": {
      "filePath": "app/projects/index.tsx",
      "parent": "/app"
    },
    "/app/tasks/": {
      "filePath": "app/tasks/index.tsx",
      "parent": "/app"
    }
  }
}
ROUTE_MANIFEST_END */
