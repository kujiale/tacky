class Differ {
  public differFlag = false;
  private isDiffing = false;

  start() {
    this.isDiffing = true;
    this.differFlag = false;
  }

  collectDiff(isDiff) {
    if (this.isDiffing && !this.differFlag) {
      this.differFlag = isDiff;
    }
  }

  end() {
    this.isDiffing = false;
  }
}

export default new Differ();
