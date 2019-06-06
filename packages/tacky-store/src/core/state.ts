import { isObject, simpleClone } from '../utils/common';
import { observeObject } from '../utils/observe-object';
import { invariant } from '../utils/error';
import { setterBeforeHook } from '../hooks/setter';
import { observableStateFactory } from './domain';
import { BabelDescriptor } from '../interfaces';

/**
 * @state decorator, making the state observable.
 */
export function state() {
  return function <T>(target: Object, property: string | symbol, descriptor?: BabelDescriptor<T>): any {
    // typescript only: (exp: @state() name: string = 'someone';)
    if (!descriptor) {
      const raw = undefined;

      Object.defineProperty(target, property, {
        enumerable: true,
        configurable: true,
        get: function () {
          return observableStateFactory({
            currentInstance: this,
            target,
            property,
            raw,
          }).get(true);
        },
        set: function (newVal) {
          setterBeforeHook({
            target,
          });
          if (isObject(newVal)) {
            observeObject({
              raw: newVal,
              target,
              currentInstance: this,
            });
          }
          return observableStateFactory({
            currentInstance: this,
            target,
            property,
            raw,
          }).set(newVal);
        },
      });

      return;
    }

    // babel only: (exp: @state() name = 'someone';)
    invariant(
      !!descriptor.initializer,
      'Your current environment don\'t support \"descriptor.initializer\" class property decorator, please make sure your babel plugin version.'
    );
    const raw = descriptor.initializer!.call(this);

    return {
      enumerable: true,
      configurable: true,
      get: function () {
        return observableStateFactory({
          currentInstance: this,
          target,
          property,
          raw: simpleClone(raw),
        }).get(true);
      },
      set: function (newVal) {
        setterBeforeHook({
          target,
        });
        if (isObject(newVal)) {
          observeObject({
            raw: newVal,
            target,
            currentInstance: this,
          });
        }
        return observableStateFactory({
          currentInstance: this,
          target,
          property,
          raw: simpleClone(raw),
        }).set(newVal);
      },
    };
  }
}
