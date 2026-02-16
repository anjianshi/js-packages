import { createBrowserRouter, Navigate } from 'react-router'
import { Page1 } from '@/views/page1'
import { Page2 } from '@/views/page2'

export const router = createBrowserRouter([
  {
    index: true,
    Component: Page1,
  },
  {
    path: '/page2',
    Component: Page2,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
])
