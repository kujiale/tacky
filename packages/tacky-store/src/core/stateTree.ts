import { GlobalStateTree, AtomStateTree, MaterialType } from '../interfaces';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { Domain } from './domain';
import { simpleClone } from '../utils/common';

class TackyGlobalStateTree {
  globalStateTree: GlobalStateTree | object = {};
  defaultStateTree: WeakMap<Domain, object> = new WeakMap();

  private updateVal(namespace, type, val) {
    if (!this.globalStateTree[namespace]) {
      this.globalStateTree[namespace] = {};
    }
    const atom = this.globalStateTree[namespace] as AtomStateTree;
    atom[type] = type !== 'instance' ? simpleClone(val) : val;
  }

  initInstanceStateTree(namespace, instance) {
    this.updateVal(namespace, 'instance', instance);
    this.updateVal(namespace, 'default', {});
    this.updateVal(namespace, 'plainObject', {});
  }

  loadAll() {
    for (const namespace in this.globalStateTree) {
      if (this.globalStateTree.hasOwnProperty(namespace)) {
        const atom = this.globalStateTree[namespace] as AtomStateTree;
        atom.instance.$lazyLoad();
      }
    }
  }

  initPlainObjectAndDefaultStateTreeFromInstance(namespace: string) {
    this.syncPlainObjectStateTreeFromInstance(namespace);
    this.syncDefaultStateTreeFromInstance(namespace);
  }

  syncPlainObjectAndInstanceStateTree(namespace, nextSnapshot) {
    this.updateVal(namespace, 'plainObject', nextSnapshot);
    const ins = this.globalStateTree[namespace].instance;
    const target = Object.getPrototypeOf(ins);
    const original = function () {
      for (const key in nextSnapshot) {
        if (nextSnapshot.hasOwnProperty(key)) {
          this[key] = nextSnapshot[key];
        }
      }
    };
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Mutation;
    original.call(ins);
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  }

  syncPlainObjectStateTreeFromInstance(namespace) {
    const atom = this.globalStateTree[namespace] as AtomStateTree;
    for (const prop in atom.instance) {
      if (prop !== NAMESPACE && typeof atom.instance[prop] !== 'function') {
        const val = atom.instance[prop];
        atom.plainObject[prop] = simpleClone(val);
      }
    }
  }

  private syncDefaultStateTreeFromInstance(namespace) {
    const atom = this.globalStateTree[namespace] as AtomStateTree;
    for (const prop in atom.instance) {
      if (prop !== NAMESPACE && typeof atom.instance[prop] !== 'function') {
        const val = atom.instance[prop];
        atom.default[prop] = simpleClone(val);
      }
    }
  }

  clearAll(namespace) {
    this.globalStateTree[namespace] = null;
  }
}

export default new TackyGlobalStateTree();
