/**
 * collect relation map of the dep path key（uuid.a.b.0.d）and the component ids
 */
class CollectorStack {
  public dependencyMap = {};
  private componentIdStack: string[] = [];

  start(id: string) {
    this.componentIdStack.push(id);
  }

  collect(depKey: string) {
    const stackLength = this.componentIdStack.length;
    if (!stackLength) {
      return;
    }
    const currentComponentId = this.componentIdStack[stackLength - 1];
    if (this.dependencyMap[depKey]) {
      this.dependencyMap[depKey].push(currentComponentId);
    } else {
      this.dependencyMap[depKey] = [currentComponentId];
    }
  }

  end() {
    this.componentIdStack.pop();
  }

  isCollected() {

  }
}

export default new CollectorStack();
