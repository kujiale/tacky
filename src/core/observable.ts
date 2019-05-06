import collector from "./collector";
import differ from "./differ";
import { observeObject } from '../utils/observe-object';
import { setterBeforeHook, setterAfterHook } from '../hooks/setter';
import { NAMESPACE } from "../const/symbol";
import { Domain } from "./domain";
import { fail } from "../utils/error";
import { isObject } from "util";

class Observable {
  value: any = null;
  target: Object = {};
  currentInstance: Domain | null = null;

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
    differ.collectDiff(true);
  }

  set(newVal) {
    const wpVal = Array.isArray(newVal) ? this.arrayProxy(newVal) : newVal;
    if (wpVal !== this.value) {
      this.setterHandler();
      this.value = wpVal;
    }
    setterAfterHook();
  }

  arrayProxy(array) {
    observeObject({ raw: array, target: this.target, currentInstance: this.currentInstance });

    return new Proxy(array, {
      set: (target, property, value, receiver) => {
        setterBeforeHook({
          target: this.target,
        });
        const previous = Reflect.get(target, property, receiver);
        let next = value;

        if (previous !== next) {
          this.setterHandler();
        }

        // set value is object
        if (isObject(next)) {
          observeObject({ raw: next, target: this.target, currentInstance: this.currentInstance });
        }
        // set value is array
        if (Array.isArray(next)) {
          next = this.arrayProxy(next);
        }

        const flag = Reflect.set(target, property, next);
        setterAfterHook();
        return flag;
      }
    });
  }
}

export default Observable;
