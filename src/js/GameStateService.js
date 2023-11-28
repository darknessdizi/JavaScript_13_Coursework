export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    // const test = new WeakMap();
    // localStorage.setItem('state', {test: 1});
    // const result = {test: 1};
    // this.storage.setItem('state', result);
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
