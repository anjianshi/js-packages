import { AppController, type Controllers } from './index.js'

export class DemoStudentController extends AppController<Controllers> {
  async list() {
    return this.db.student.findMany({})
  }
}
