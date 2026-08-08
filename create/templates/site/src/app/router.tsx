import { createBrowserRouter, Navigate } from 'react-router'
import { Dashboard } from '@/views/dashboard'
import { SchoolDetail } from '@/views/school-detail'
import { SchoolRanking } from '@/views/school-ranking'
import { Schools } from '@/views/schools'
import { Setting } from '@/views/setting'
import { StudentScore } from '@/views/student-score'
import { Students } from '@/views/students'
import { AppLayout } from './layout'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: '/schools',
        Component: Schools,
      },
      {
        path: '/schools/ranking',
        Component: SchoolRanking,
      },
      {
        path: '/schools/:id',
        Component: SchoolDetail,
      },
      {
        path: '/students',
        Component: Students,
      },
      {
        path: '/students/score',
        Component: StudentScore,
      },
      {
        path: '/setting',
        Component: Setting,
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },
])
