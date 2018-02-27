import React from "react";
import styles from "./styles.scss";
import {Link, NavLink} from "react-router-dom";
import {List} from "react-toolbox/lib/list";

// import NavLink from "components/NavLink/NavLink";

/**
 * Returns a SideDrawer component
 * @param {string} title Title
 * @returns {XML} JSX Content
 * @constructor
 */
function SideDrawer({title}) {
  return (
    <div className={styles.drawer}>
      <Link to="/">{({onClick}) => <div className={styles.drawerBrand} onClick={onClick}>{title}</div>}</Link>
      <hr className={styles.divider}/>
      <div>
        <List ripple>
          <NavLink exact={true} to="/">Leagues</NavLink>
          <NavLink exact={true} to="/about">About</NavLink>
        </List>
      </div>
    </div>
  );
}

export default SideDrawer;
