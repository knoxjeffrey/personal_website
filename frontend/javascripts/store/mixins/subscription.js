import Store from "@/javascripts/store/stimulus_store.js"

export const subscription = controller => {
  Object.assign(controller, {
    store() {
      return Store.instance.store
    },

    editStore(prop, value) {
      Store.instance.editStore(prop, value)
    },

    subscribe() {
      Store.instance.subscribe(this)
    },

    unsubscribe() {
      Store.instance.unsubscribe(this)
    }
  });
};
