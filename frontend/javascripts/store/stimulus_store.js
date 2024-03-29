const prodHost = "www.jeffreyknox.dev"
let _instance = null;

export default class StimulusStore {
  static get instance() {
    return _instance ? _instance : _instance = new StimulusStore();
  }

  constructor() {
    this._store = {
      subscribers: [],
    }
    if (window.location.host !== prodHost) {
      window.StimulusStore = this // for debugging purposes
    }
  }

  get store() {
    return this._store
  }

  editStore(prop, value, storeId) {
    this._store[`${storeId}${prop}`] = value
    this._store.subscribers && this.emit(prop, storeId)
  }

  emit(prop, storeId) {
    this._store.subscribers.forEach(controller => {
      typeof controller.storeUpdated === "function" && 
      controller.storeUpdated(prop, storeId);
    });
  }
  
  subscribe(controller) {
    !this._store.subscribers.includes(controller) && 
    this._store.subscribers.push(controller);
  }

  unsubscribe(controller) {
    this._store.subscribers.includes(controller) && 
    this._store.subscribers.splice(this._store.subscribers.indexOf(controller), 1);
  }
}
