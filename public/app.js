const DB = {
  name: 'vue-todo-pwa',
  version: 1,
  store: 'tasklist',
  object: null,
};
let installPrompt = null;

function toggleScroll(enableScroll) {
  if (enableScroll) document.body.classList.remove('overflow-hidden');
  else document.body.classList.add('overflow-hidden');
}
toggleScroll(false);

const store = new Vuex.Store({
  state() {
    return {
      currentTask: null,
      tasklist: [],
      isModalOpen: false,
      isInstallAllowed: false,
      loading: true,
    };
  },
  getters: {
    getTaskIndexById: (state) => (id) => state.tasklist.findIndex((item) => item.id === id),
    getTaskCount(state) {
      return state.tasklist.length;
    },
    getCompleteTaskCount(state) {
      return state.tasklist.filter((item) => item.complete).length;
    },
    getRemainingTaskCount(state) {
      return state.tasklist.filter((item) => !item.complete).length;
    },
  },
  mutations: {
    addItem(state, payload) {
      state.tasklist.unshift(payload);
    },
    removeItem(state, index) {
      state.tasklist.splice(index, 1);
    },
    setFocusedItem(state, payload) {
      const itemFocus = state.tasklist[payload.index];
      if (itemFocus !== state.currentTask) {
        state.currentTask = itemFocus;
      } else if (payload.toggle) { // will unfocus the currently focused object if toggle is active
        state.currentTask = null;
      }
    },
    setModalState(state, isOpen) {
      state.isModalOpen = isOpen;
    },
    setInstallAllowed(state, allowed) {
      state.isInstallAllowed = allowed;
    },
  },
  actions: {
    saveToDatabase(context, payload) {
      const objStore = DB.object.transaction(DB.store, 'readwrite').objectStore(DB.store);
      objStore.put(payload, payload.id);
    },
    removeFromDatabase(context, id) {
      const objStore = DB.object.transaction(DB.store, 'readwrite').objectStore(DB.store);
      objStore.delete(id);
    },
    createTask(context) {
      const newTask = {
        id: Date.now().toString(36),
        title: 'My note',
        description: '',
        complete: false,
      };
      context.commit('addItem', newTask);
      context.dispatch('saveToDatabase', newTask);
    },
    deleteTask(context, id) {
      const index = context.getters.getTaskIndexById(id);
      if (index > -1) {
        context.commit('removeItem', index);
        context.dispatch('removeFromDatabase', id);
      }
    },
    focusTask(context, payload) {
      const index = context.getters.getTaskIndexById(payload.id);
      if (index > -1) {
        context.commit('setFocusedItem', {
          index,
          toggle: payload.toggle,
        });
      }
    },
    closeModal(context) {
      toggleScroll(false);
      context.commit('setModalState', false);
    },
    openModal(context) {
      toggleScroll(true);
      context.commit('setModalState', true);
    },
    finishLoading(context) {
      toggleScroll(true);
      context.state.loading = false;
    },
  },
});

const vm = new Vue({
  store,
  computed: Vuex.mapState(['loading']),
});

Vue.component('app-header', {
  methods: Vuex.mapActions(['openModal']),
  template: '#appHeader',
});

Vue.component('app-body', { template: '#appBody' });

Vue.component('options-modal', {
  computed: Vuex.mapState(['isModalOpen', 'isInstallAllowed']),
  methods: {
    ...Vuex.mapActions(['closeModal', 'openModal']),
    exportTasklist() {
      const a = document.querySelector('#downloadAnchor');
      const json = JSON.stringify(this.$store.state.tasklist);
      const blob = new Blob([json], { type: 'application/json' });
      a.href = URL.createObjectURL(blob);
      a.click();
    },
    addToHomeScreen() {
      installPrompt.prompt();
      // Wait for the user to respond to the prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.$store.commit('setInstallAllowed', false);
          installPrompt = null;
        }
      });
    },
  },
  template: '#optionsModal',
});

Vue.component('tasklist-heading', {
  methods: Vuex.mapActions(['createTask']),
  computed: Vuex.mapGetters({
    taskCount: 'getTaskCount',
    completeTaskCount: 'getCompleteTaskCount',
    remainingTaskCount: 'getRemainingTaskCount',
  }),
  template: '#tasklistHeading',
});

Vue.component('tasklist-body', {
  computed: {
    ...Vuex.mapState(['tasklist']),
    ...Vuex.mapGetters({
      taskCount: 'getTaskCount',
    }),
  },
  template: '#tasklistBody',
});

Vue.component('tasklist-item', {
  props: ['task'],
  computed: {
    ...Vuex.mapState(['currentTask']),
    isFocused() {
      return this.currentTask === this.task;
    },
  },
  methods: {
    ...Vuex.mapActions(['deleteTask']),
    focusTask(id, toggle = true) {
      this.$store.dispatch('focusTask', { id, toggle });
    },
    updateDatabase() {
      this.$store.dispatch('saveToDatabase', this.task);
    },
  },
  template: '#tasklistItem',
});

if ('navigator' in window && 'serviceWorker' in navigator) {
  /* eslint-disable no-console */
  navigator.serviceWorker
    .register('sw.js')
    .catch((err) => console.error(`Could not register service worker: ${err}`))
    .then(() => navigator.serviceWorker.ready)
    .then((reg) => console.log(`Service worker registered, scope: ${reg.scope}`));
  /* eslint-enable no-console */
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  installPrompt = e;
  store.commit('setInstallAllowed', true);
});

function redirectUnsupported() {
  const div = document.createElement('div');
  div.id = '#fallback';
  document.body.appendChild(div);
  const app = new Vue({ template: '#unsupported' });
  app.$mount('#fallback');
}

if (!('indexedDB' in window)) redirectUnsupported();

const req = indexedDB.open(DB.name, DB.version);
req.onerror = redirectUnsupported;
req.onupgradeneeded = (e) => {
  const db = e.target.result;

  if (e.oldVersion < 1) {
    // do initial schema creation
    db.createObjectStore(DB.store, { keypath: 'id' });
  }
};
req.onsuccess = (e) => {
  DB.object = e.target.result;
  const transaction = DB.object.transaction(DB.store, 'readonly');
  const objStore = transaction.objectStore(DB.store);
  const request = objStore.openCursor();
  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      store.commit('addItem', cursor.value);
      cursor.continue();
    }
  };
  transaction.oncomplete = () => {
    setTimeout(() => {
      store.dispatch('finishLoading');
    }, 1500);
  };
};

vm.$mount('#app');
