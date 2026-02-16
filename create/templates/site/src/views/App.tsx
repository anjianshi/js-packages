import { RouterProvider } from 'react-router/dom'
import { router } from '@/views/router'

import '@/lib/style.css'

export function App() {
  return <RouterProvider router={router!} />
}
