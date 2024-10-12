import { AppController, type Controllers } from './index.js'

export class DemoSchoolController extends AppController<Controllers> {
  async list() {
    return this.db.school.findMany({})
  }
}
