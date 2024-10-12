import { router } from '@/routes/router.js'

router.register({
  path: '/schools',
  async handler({ db, response }) {
    const schools = db.school.findMany({})
    response.success(schools)
  },
})
