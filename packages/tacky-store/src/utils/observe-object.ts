import Observable from '../core/observable';
import { isObject } from './common';
import { setterBeforeHook } from '../hooks/setter';

export function observeObjectProperty({
  raw,
  target,
  currentInstance,
  property,
}) {
  const subVal = raw[property];

  if (isObject(subVal)) {
    for (let prop in subVal) {
      if (subVal.hasOwnProperty(prop)) {
        observeObjectProperty({
          raw: subVal,
          target,
          currentInstance,
          property: prop,
        });
      }
    }
  } else {
    const observable = new Observable(subVal, target, currentInstance);

    Object.defineProperty(raw, property, {
      enumerable: true,
      configurable: true,
      get: function () {
        return observable.get();
      },
      set: function (newVal) {
        setterBeforeHook({
          target,
        });
        if (isObject(newVal)) {
          for (let prop in newVal) {
            if (newVal.hasOwnProperty(prop)) {
              observeObjectProperty({
                raw,
                target,
                currentInstance,
                property: prop,
              });
            }
          }
        }
        return observable.set(newVal);
      },
    });
  }
}

export function observeObject({ raw, target, currentInstance }) {
  for (let property in raw) {
    if (raw.hasOwnProperty(property)) {
      observeObjectProperty({
        raw,
        target,
        currentInstance,
        property,
      });
    }
  }
}
