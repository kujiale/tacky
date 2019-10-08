import { BabelDescriptor } from '../interfaces';
import { quacksLikeADecorator } from '../utils/decorator';
import { Domain } from '../core/domain';
import { NAMESPACE } from '../const/symbol';

/**
 * state decorator, making the state observable.
 */
export function state(...args: any[]) {
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

    // typescript only: (exp: @state() name: string = 'someone';)
    if (!descriptor) {
      return Object.defineProperty(target, property, newDescriptor);
    }

    // babel only: (exp: @state() name = 'someone';)
    return newDescriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  return decorator;
}
