import React from "react";
import styles from "./styles.scss";
import {observer, inject} from "mobx-react";

import {BrowserRouter, Match, Miss} from "react-router";

import Leagues from "views/Leagues/LeaguesView.jsx";
import League from "views/League/LeagueView.jsx";
import Season from "views/Season/SeasonView.jsx";
import Rally from "views/Rally/RallyView.jsx";

import Sidebar from "react-sidebar";
import SideDrawer from "components/SideDrawer/SideDrawer";
import AppBar from "components/AppBar/AppBar";
import AppFooter from "components/AppFooter/AppFooter";


function App({layoutStore}) {
  const title = "EVAL League";
  return (
      <BrowserRouter>
        <div className={styles.app}>
          <Sidebar
              sidebar={<SideDrawer title={title}/>}
              open={layoutStore.sideBarOpen}
              docked={layoutStore.sideBarDocked}
              onSetOpen={layoutStore.toggleSideBarOpen}
              shadow={false}
              styles={{sidebar: {zIndex: 9999}, overlay: {zIndex: 9998}}}
          >
            <div className={styles.content}>
              <AppBar
                  title={title}
                  layoutStore={layoutStore}
                  toggleSidebar={layoutStore.toggleSideBarOpen}
              />
              <section>
                <Match exactly pattern="/" component={Leagues}/>
                <Match pattern="/league/:key" component={League}/>
                <Match pattern="/season/:key" component={Season}/>
                <Match pattern="/rally/:key" component={Rally}/>
                <Match pattern="/about" component={
                  () => {
                    return <div>
                      About
                    </div>;
                  }
                }/>
                <Miss component={() => <div>404 Page not found!</div>}/>
              </section>
              <AppFooter />
            </div>

          </Sidebar>
        </div>
      </BrowserRouter>
  );
}

export default inject(["layoutStore"])(observer(App));
