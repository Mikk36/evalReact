// import {h} from "preact";
import React from "react";
import styles from "./styles.scss";
import {observer} from "mobx-react";

import {AppBar as RTAppBar} from "react-toolbox/lib/app_bar";

function AppBar({title, toggleSidebar}) {
  return (
    <RTAppBar
      theme={styles}
      flat
      leftIcon={<i className="material-icons">menu</i>}
      onLeftIconClick={toggleSidebar}
    >
      {title}
    </RTAppBar>
  );
}

export default observer(AppBar);
