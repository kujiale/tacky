import { Domain } from './domain';

export interface Payload {
  id: string,
  type: string,
  instance: Domain,
}

export interface DomainMapping {
  [id: string]: {
    type: string;
    instance: Domain;
  };
}

class DomainStore {
  idToInstanceMap: DomainMapping;

  init(payload: Payload) {
    const { id, type, instance } = payload;
    this.idToInstanceMap[id] = {
      type,
      instance,
    }
  }

  /**
   * sync single domain initial snapshot
   */
  syncInitialSnapshot(namespace: string) {

  }

  /**
   * sync all domain initial snapshot
   */
  syncAllInitialSnapshot() {

  }

  /**
   * reset single domain back to initial snapshot
   */
  reset(namespace: string) {

  }

  /**
   * reset all domain back to initial snapshot
   */
  resetAll() {
    // this.reset();
  }

  /**
   * destroy single domain instance and all related things to release memory.
   */
  destroy(namespace: string) {
    delete this.idToInstanceMap[namespace];
    // clear initial snapshot
    // clear diff linked key history
    // clear collector stack
    // clear current instance (key path、inner value、domain itself)
  }
}

const domainStore = new DomainStore();

/**
 * reset all domain back to initial snapshot
 */
export const reset = () => {
  domainStore.resetAll();
};

export default domainStore;
