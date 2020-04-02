import { BabelDescriptor } from '../interfaces';
import { quacksLikeADecorator } from '../utils/decorator';
import { Domain } from '../core/domain';

/**
 * reactor decorator, making the reactor observable.
 */
export function reactor(...args: any[]) {
  const decorator = function <T>(target: Object, property: string | symbol | number, descriptor?: BabelDescriptor<T>): any {
    const newDescriptor = {
      enumerable: true,
      configurable: true,
      get: function () {
        const current = (this as Domain);
        return current.propertyGet(property);
      },
      set: function (newVal: any) {
        const current = (this as Domain);
        current.propertySet(property, newVal);
      },
    };

    // typescript only: (exp: @reactor() name: string = 'someone';)
    if (descriptor === void 0) {
      return Object.defineProperty(target, property, newDescriptor);
    }

    // babel only: (exp: @reactor() name = 'someone';)
    return newDescriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  return decorator;
}
