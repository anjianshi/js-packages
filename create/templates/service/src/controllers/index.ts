import {
  AppController,
  initializeAppControllers,
  type ControllersFrom,
  type Context,
} from './common.js'
import { DemoSchoolController } from './demo-school.js'
import { DemoStudentController } from './demo-student.js'

export { AppController, initializeAppControllers }
export type Controllers = ControllersFrom<Context, typeof controllerClasses>
export const controllerClasses = {
  student: DemoStudentController,
  school: DemoSchoolController,
}
