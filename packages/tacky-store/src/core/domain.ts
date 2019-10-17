import { CURRENT_MATERIAL_TYPE, NAMESPACE } from '../const/symbol';
import { EMaterialType, Mutation } from '../interfaces';
import { isPlainObject, convert2UniqueString, hasOwn, isObject, bind } from '../utils/common';
import { invariant } from '../utils/error';
import timeTravel from './time-travel';
import generateUUID from '../utils/uuid';
import { depCollector, historyCollector, EOperationTypes } from './collector';
import { canObserve } from '../utils/decorator';
import { store } from './store';

const proxyCache = new WeakMap<any, any>();
const rawCache = new WeakMap<any, any>();

/**
 * Framework base class 'Domain', class must be extends this base class which is need to be observable.
 */
export class Domain<S = {}> {
  private properties: { [key in keyof this]?: this[key] } = {};

  constructor() {
    const target = Object.getPrototypeOf(this);
    const domainName = target.constructor.name || 'TACKY_DOMAIN';
    const namespace = generateUUID();
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
    this[NAMESPACE] = namespace;
    timeTravel.init({
      id: namespace,
      type: domainName,
      instance: this,
    });
  }

  propertyGet(key: string | symbol | number) {
    const stringKey = convert2UniqueString(key);
    const v = this.properties[stringKey];

    depCollector.collect(this, stringKey);

    return isObject(v) ? this.proxyReactive(v) : v;
  }

  propertySet(key: string | symbol | number, v: any) {
    const stringKey = convert2UniqueString(key);

    this.illegalAssignmentCheck(this, stringKey);
    historyCollector.collect(this, stringKey, {
      type: EOperationTypes.SET,
      beforeUpdate: this.properties[stringKey],
      didUpdate: v,
    });
    this.properties[stringKey] = v;
  }

  private proxySet(target: any, key: string | symbol | number, value: any, receiver: any) {
    const stringKey = convert2UniqueString(key);
    this.illegalAssignmentCheck(target, stringKey);

    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    // do nothing if target is in the prototype chain
    if (target === proxyCache.get(receiver)) {
      if (!hadKey) {
        historyCollector.collect(target, stringKey, {
          type: EOperationTypes.ADD,
          beforeUpdate: oldValue,
          didUpdate: value,
        });
      } else if (value !== oldValue) {
        historyCollector.collect(target, stringKey, {
          type: EOperationTypes.SET,
          beforeUpdate: oldValue,
          didUpdate: value,
        });
      }
    }

    return result;
  }

  private proxyGet(target: any, key: string | symbol | number, receiver: any) {
    const res = Reflect.get(target, key, receiver);
    const stringKey = convert2UniqueString(key);

    depCollector.collect(target, stringKey);

    return isObject(res) ? this.proxyReactive(res) : res;
  }

  /**
   * proxy value could be boolean, string, number, undefined, null, custom instance, array[], plainObject{}
   * @todo: support Map、Set、WeakMap、WeakSet
   */
  private proxyReactive(raw: object) {
    const _this = this;
    // different props use same ref
    const refProxy = rawCache.get(raw);
    if (refProxy !== void 0) {
      return refProxy;
    }
    // raw is already a Proxy
    if (proxyCache.has(raw)) {
      return raw;
    }
    if (!canObserve(raw)) {
      return raw;
    }
    const proxy = new Proxy(raw, {
      get: _this.proxyGet,
      set: _this.proxySet,
    });
    proxyCache.set(proxy, raw);
    rawCache.set(raw, proxy);

    return proxy;
  }

  /**
   * lazy sync this domain initial snapshot
   */
  $lazySyncInitialSnapshot() {
    timeTravel.syncInitialSnapshot(this[NAMESPACE]);
  }

  /**
   * reset this domain instance to initial snapshot
   */
  $reset() {
    timeTravel.reset(this[NAMESPACE]);
  }

  /**
   * destroy this domain instance and all related things to release memory.
   */
  $destroy() {
    timeTravel.destroy(this[NAMESPACE]);
  }

  /**
   * the syntax sweet of updating state out of mutation
   */
  $update<K extends keyof S>(obj: Pick<S, K> | S, actionName?: string): void {
    invariant(isPlainObject(obj), 'resetState(...) param type error. Param should be a plain object.');
    this.dispatch(obj as object, actionName);
  }

  /**
   * only in @mutation/$update/constructor can assign value to @state, otherwise throw error.
   */
  private illegalAssignmentCheck(target: object, stringKey: string) {
    if (depCollector.isObserved(target, stringKey)) {
      invariant(
        this[CURRENT_MATERIAL_TYPE] === EMaterialType.MUTATION ||
        this[CURRENT_MATERIAL_TYPE] === EMaterialType.UPDATE,
        'You cannot assign value to (decorated @state property) by (this.a = \'xxx\';) directly. Please use mutation or $update({}).'
      );
    }
  }

  private dispatch(obj: object, actionName?: string) {
    const original = function () {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          this[key] = obj[key];
        }
      }
    };
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.UPDATE;
    // update state before store init
    if (store === void 0) {
      original.call(this);
      this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
      return;
    }
    // update state after store init
    store.dispatch({
      name: actionName || generateUUID(),
      payload: [],
      type: EMaterialType.UPDATE,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Mutation
    });
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
  }
}
