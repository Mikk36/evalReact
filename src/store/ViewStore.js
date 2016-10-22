import {observable} from "mobx";

// import {routesArray, notFoundRoute} from "routes";

class ViewStore {
  @observable currentPath = null;
  @observable currentUser = null;
  // router = null;
  // layoutStore = null;
  // evalStore = null;

  constructor() {
    // this.router = router;
    // this.layoutStore = layout;
    // this.evalStore = evalStore;
    // this.currentPath = this.router.location.pathname;
  }
}

const viewStore = new ViewStore();

export default viewStore;
