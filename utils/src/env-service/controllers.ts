/**
 * 把业务功能整理成各个 Controller，
 * 并整合成一个 controllers 对象方便外部引用和 Controller 之间互相引用。
 *
 * 支持自定义 Controller 类，例如把 context 中的内容定义成属性。
 */

/*
【使用范例】

// 定制 Context 和 Controller
interface MyContext {
  prop1: number
  prop2: string
}
class MyController<
  AllControllers extends Record<string, AnyController<MyContext>>,
> extends Controller<MyContext, AllControllers> {
  get prop1() {
    return this.context.prop1
  }
  get prop2() {
    return this.context.prop2
  }
}

// 实现 Controller 内容
class C1 extends MyController<Controllers> {
  someMethod() {
    console.log(this.prop1)
    console.log(this.controllers.c2.prop2)
  }
}
class C2 extends MyController<Controllers> {}
class C3 extends MyController<Controllers> {}

// 生成 controllers 类型和对象
export const controllerClasses = { c1: C1, c2: C2, c3: C3 }
export type Controllers = ControllersFrom<MyContext, typeof controllerClasses>
initializeControllers({ c1: C1, c2: C2, c3: C3 }, { prop1: 1, prop2: 2 })
*/

type AnyObject = Record<string, unknown>
type AnyController<Context> = Controller<Context, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyControllerClass<Context> = typeof Controller<Context, any> // eslint-disable-line @typescript-eslint/no-explicit-any
type ControllerClassesFrom<Context, T extends AnyObject> = {
  [K in keyof T]: T[K] extends AnyControllerClass<Context> ? T[K] : never
}
export type ControllersFrom<Context, T extends AnyObject> = {
  [K in keyof T]: T[K] extends AnyControllerClass<Context> ? InstanceType<T[K]> : never
}

/**
 * Controller 基类
 */
export class Controller<Context, AllControllers extends Record<string, AnyController<Context>>> {
  constructor(
    /** 调用其他 controllers */
    protected readonly controllers: AllControllers,

    protected readonly context: Context,
  ) {}
}

/**
 * 传入 Controller 类列表，返回 controller 实例集合。
 * 为优化性能，每个 controller 只有在被使用到时才会实例化。
 */
export function initializeControllers<Context, T extends AnyObject>(
  controllerClasses: T,
  context: Context,
) {
  type Classes = ControllerClassesFrom<Context, T>
  type Controllers = ControllersFrom<Context, T>
  const proxy = new Proxy({} as Controllers, {
    get(controllers, prop) {
      if (typeof prop !== 'string') return
      if (prop in controllers) return controllers[prop]
      if (prop in controllerClasses) {
        const Class = controllerClasses[prop]! as typeof Controller<Context, Controllers>
        controllers[prop as keyof Classes] = new Class(proxy, context) as Controllers[keyof Classes]
        return controllers[prop]
      }
    },
  })
  return proxy
}
