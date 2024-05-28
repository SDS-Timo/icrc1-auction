import { Outlet } from 'react-router-dom'

import AuthLayout from './layouts/auth'
import DashboardLayout from './layouts/dashboard'
import About from './pages/about'
import Page404 from './pages/auth/page404'
import Page500 from './pages/auth/page500'
import Terminal from './pages/terminal'

const routes = [
  {
    path: '/',
    element: (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    ),
    children: [
      {
        path: '',
        element: <Terminal />,
      },
    ],
  },
  {
    path: 'auth',
    element: (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    ),
    children: [
      {
        path: '500',
        element: <Page500 />,
      },
    ],
  },
  {
    path: 'about',
    element: (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    ),
    children: [
      {
        path: '',
        element: <About />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    ),
    children: [
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
]

export default routes
