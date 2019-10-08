interface Diff {
  [propLinkedKey: string]: {
    willUpdate: any;
    didUpdate: any;
  };
}

export class LinkedKey {
  element: string;
  next: LinkedKey | null = null;
  previous: LinkedKey | null = null;

  constructor(element: string | symbol | number) {
    this.element = (element).toString();
  }

  /**
   * transform linked list structure to string
   */
  convertToString() {
    const keys: string[] = [];
    let currentNode = this.previous;

    keys.unshift(this.element);

    while (currentNode !== null) {
      keys.unshift(currentNode.element);
      currentNode = currentNode.previous;
    }

    return keys.join('.');
  }
}

class Differ {
  public differFlag: boolean;
  private isDiffing: boolean;

  start() {
    this.isDiffing = true;
    this.differFlag = false;
  }

  isDiff() {
    if (!this.isDiffing) {
      return;
    }
    this.differFlag = true;
  }

  end() {
    this.isDiffing = false;
  }
}

export const differ = new Differ();
