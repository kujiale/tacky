import collector from "./collector";
import differ from "./differ";
import { observeObject } from './observe-object';
import { illegalAssignmentCheck } from '../hooks/assignment';
import { NAMESPACE } from "../const/symbol";
import { Domain } from "./domain";
import { fail } from "../utils/error";
import { isPlainObject } from '../utils/common';

export default class Observable {
  value: any = null; // boolean, string, number, undefined, null, instance, array[], plainObject{}
  target: Object = {};
  currentInstance: Domain<any> | null = null;

  constructor(raw, target, currentInstance) {
    this.target = target;
    this.currentInstance = currentInstance;
    this.value = Array.isArray(raw) ? this.arrayProxy(raw) : raw;
  }

  get(needCollect = false) {
    if (needCollect) {
      if (!this.currentInstance) {
        fail('Unexpected error. Observable current instance doesn\'t exists.');
        return;
      }
      collector.collect(this.currentInstance[NAMESPACE]);
    }

    return this.value;
  }

  setterHandler() {
    differ.isDiff(true);
  }

  set(newVal) {
    const wpVal = Array.isArray(newVal) ? this.arrayProxy(newVal) : newVal;
    if (wpVal !== this.value) {
      this.setterHandler();
      this.value = wpVal;
    }
  }

  arrayProxy(array) {
    observeObject({ raw: array, target: this.target, currentInstance: this.currentInstance });

    return new Proxy(array, {
      set: (target, property, value, receiver) => {
        illegalAssignmentCheck({
          target: this.target,
        });
        const previous = Reflect.get(target, property, receiver);
        let next = value;

        if (previous !== next) {
          this.setterHandler();
        }

        // set value is object
        if (isPlainObject(next)) {
          observeObject({ raw: next, target: this.target, currentInstance: this.currentInstance });
        }
        // set value is array
        if (Array.isArray(next)) {
          next = this.arrayProxy(next);
        }

        const flag = Reflect.set(target, property, next);
        return flag;
      }
    });
  }
}
