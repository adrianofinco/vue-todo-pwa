# vue-todo-pwa
A tasklist app made in Vue and with client-side storage and support for offline usage

# Vue and Vuex
This app is rendered using *Vue* and uses *Vuex* to maintain a single source of truth where the user task list is stored accessible to all components.

# PWA Features

### Client-side storage
The app uses IndexedDB API for storing *task* objects in the client without the need of a backend server, client-side storage is a core functionality which means the app can't work without it. For that reason browsers without support for the indexedDB API can't use the page and will see a relevant error message.

### Asset caching
Styles, scripts, images and pages. All these assets necessaries for the correct working of the app are cached using the CacheStorage API and using the service worker API requests are intercepted and served from cache in case no internet connection is detected.

### Home screen installation
The more iconic feature of a PWA, using the A2HS (Add to home screen) API and its WebApp manifest the app can prompt to be installed to the user home screen to be launched in standolone mode (a browser window opens solely for this app).

## Offline usage
Client-side storage combined with asset caching allows the app to run fully offline without the need to either have a backend or redownload its assets from the CDN. Along with that comes the ease of access thanks to home screen installation.
