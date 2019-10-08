import { CURRENT_MATERIAL_TYPE, NAMESPACE } from '../const/symbol';
import { MaterialType, Mutation, AtomStateTree } from '../interfaces';
import Observable from './observable';
import { observeObject } from './observe-object';
import { isPlainObject, bind } from '../utils/common';
import { invariant } from '../utils/error';
import { store } from './store';
import DomainStore from './domain-store';
import generateUUID from '../utils/uuid';
import collector from './collector';
import { differ } from './differ';

// function observableStateFactory(v: any) {
//   // it is an observable already, done
//   if (isObservable(v)) return v

//   // something that can be converted and mutated?
//   const res = isPlainObject(v)
//       ? observable.object(v, arg2, arg3)
//       : Array.isArray(v)
//           ? observable.array(v, arg2)
//           : v

//   // this value could be converted to a new observable data structure, return it
//   if (res !== v) return res
// }

// export const observableStateTree = new WeakMap();

// export function createObservableState({
//   target,
//   instance,
//   value,
// }) {
//   if (isPlainObject(value)) {
//     observeObject({
//       value,
//       target,
//       instance,
//     });
//   }

//   return new Observable(value, target, instance);
// }

// export function observableStateFactory({
//   target,
//   instance,
//   property,
//   value,
// }) {
//   if (observableStateTree.get(instance)) {
//     if (observableStateTree.get(instance)[property]) {
//       return observableStateTree.get(instance)[property];
//     }
//     const observable = createObservableState({ value, target, instance });
//     observableStateTree.get(instance)[property] = observable;

//     return observableStateTree.get(instance)[property];
//   }
//   observableStateTree.set(instance, {});
//   const observable = createObservableState({ value, target, instance });
//   observableStateTree.get(instance)[property] = observable;

//   return observableStateTree.get(instance)[property];
// }

/**
 * Framework base class 'Domain', class must be extends this base class which is need to be observable.
 */
export class Domain<S = {}> {
  private properties: { [key in keyof this]?: this[key] } = {};

  constructor() {
    const target = Object.getPrototypeOf(this);
    const domainName = target.constructor.name || 'TACKY_DOMAIN';
    const namespace = generateUUID();

    this[CURRENT_MATERIAL_TYPE] = MaterialType.Initial;
    this[NAMESPACE] = namespace;
    DomainStore.init({
      id: namespace,
      type: domainName,
      instance: this,
    });
  }

  propertyGet(key: string | symbol | number) {
    const stringKey = (key).toString();
    collector.collect(stringKey);
    return this.properties[key];
  }

  /**
   * inner setter, value could be boolean, string, number, undefined, null, instance, array[], plainObject{}
   */
  propertySet(key: string | symbol | number, v: any) {
    const stringKey = (key).toString();
    this[NAMESPACE]

    if (isCollected(key)) {
      this.illegalAssignmentCheck();
    }

    const res = isPlainObject(v)
      ? this.objectHandler(v)
      : Array.isArray(v)
        ? this.arrayHandler(v)
        : v;

    this.properties[key] = res;
  }

  is(v: object) {
    for (let property in v) {
      if (v.hasOwnProperty(property)) {
        const value = v[property];
        if (isPlainObject(value)) {

        }
      }
    }
  }

  objectHandler(v: object) {
    const _this = this;


    return new Proxy(v, {
      get: function (target, key, receiver) {
        const raw = Reflect.get(target, key, receiver);

        return raw;
      },
      set: function (target, key, value, receiver) {
        _this.propertySet(key, value);
        return Reflect.set(target, key, value, receiver);
      }
    });

    // new Proxy(v, {
    //   set: (target, property, value, receiver) => {
    //     illegalAssignmentCheck({
    //       target: this.target,
    //     });
    //     const previous = Reflect.get(target, property, receiver);
    //     let next = value;

    //     if (previous !== next) {
    //       differ.isDiff();
    //     }

    //     // set value is object
    //     if (isPlainObject(next)) {
    //       observeObject({ raw: next, target: this.target, currentInstance: this.currentInstance });
    //     }
    //     // set value is array
    //     if (Array.isArray(next)) {
    //       next = this.arrayProxy(next);
    //     }

    //     const flag = Reflect.set(target, property, next);
    //     return flag;
    //   }
    // });
  }

  arrayHandler(v: any) {

  }

  /**
   * lazy sync this domain initial snapshot
   */
  $lazySyncInitialSnapshot() {
    DomainStore.syncInitialSnapshot(this[NAMESPACE]);
  }

  /**
   * reset this domain instance to initial snapshot
   */
  $reset() {
    DomainStore.reset(this[NAMESPACE]);
  }

  /**
   * destroy this domain instance and all related things to release memory.
   */
  $destroy() {
    DomainStore.destroy(this[NAMESPACE]);
  }

  /**
   * the syntax sweet of updating state out of mutation
   */
  $update<K extends keyof S>(obj: Pick<S, K> | S): void {
    invariant(isPlainObject(obj), 'resetState(...) param type error. Param should be a plain object.');
    this.dispatch(obj);
  }

  /**
   * only in @mutation/$update/constructor can assign value to @state, otherwise throw error.
   */
  illegalAssignmentCheck() {
    invariant(
      this[CURRENT_MATERIAL_TYPE] === MaterialType.Initial ||
      this[CURRENT_MATERIAL_TYPE] === MaterialType.Mutation ||
      this[CURRENT_MATERIAL_TYPE] === MaterialType.Update,
      'You cannot assign value to (decorated @state property) by (this.a = \'xxx\';) directly. Please use mutation or $update({}).'
    );
  }

  private dispatch<K extends keyof S>(obj: Pick<S, K> | S) {
    const target = Object.getPrototypeOf(this);
    const original = function () {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          this[key] = obj[key];
        }
      }
    };
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Update;
    // update state before render
    if (!store) {
      original.call(this);
      StateTree.syncPlainObjectStateTreeFromInstance(this[NAMESPACE]);
      target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
      return;
    }
    // update state after render
    store.dispatch({
      payload: [],
      type: MaterialType.Mutation,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Mutation
    });
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  }
}
