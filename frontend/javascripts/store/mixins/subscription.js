import Store from "@/javascripts/store/stimulus_store.js"

export const subscription = controller => {
  Object.assign(controller, {
    storeContent() {
      return Store.instance.store
    },

    store(key) {
      return this.storeContent()[`${this.storeIdValue}${key}`]
    },

    editStore(prop, value) {
      Store.instance.editStore(prop, value, this.storeIdValue)
    },

    subscribe() {
      Store.instance.subscribe(this)
    },

    unsubscribe() {
      Store.instance.unsubscribe(this)
    }
  });
};
