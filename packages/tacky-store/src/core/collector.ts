class Collector {
  public dependencyMap = {};
  private isCollecting = false;
  private tempComponentInstanceId = null;

  start(id) {
    this.isCollecting = true;
    this.tempComponentInstanceId = id;
  }

  collect(namespace) {
    if (this.isCollecting) {
      if (!this.dependencyMap[namespace]) {
        this.dependencyMap[namespace] = [];
      }
      if (this.dependencyMap[namespace].indexOf(this.tempComponentInstanceId) > -1) {
        return;
      }
      this.dependencyMap[namespace].push(this.tempComponentInstanceId);
    }
  }

  end() {
    this.isCollecting = false;
  }
}

export default new Collector();
