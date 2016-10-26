// import {h, render} from "preact";
import "./main.css";
import React from "react";
import {render} from "react-dom";
import {useStrict} from "mobx";
useStrict(true);
import {Provider} from "mobx-react";
import viewStore from "./store/ViewStore";
import layoutStore from "./store/LayoutStore";
import evalStore from "./store/EvalStore";
import App from "views/App/App";

// import createHistory from "history/createBrowserHistory";
// const router = createHistory();

// const viewStore = new ViewStore(router, layoutStore, evalStore);
const stores = {
  viewStore,
  layoutStore,
  evalStore
};

const root = document.createElement("div");
root.id = "app";
document.body.appendChild(root);

let DevTools = () => null;
if (__DEV__) DevTools = require("mobx-react-devtools").default;

render(
    <Provider {...stores}>
      <div>
        <App />
        <DevTools />
      </div>
    </Provider>,
    document.getElementById("app")
);
