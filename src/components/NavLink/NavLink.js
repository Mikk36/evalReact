import React from "react";
import styles from "./styles.scss";
import {Link} from "react-router-dom";
import {ListItem} from "react-toolbox/lib/list";

/**
 * Returns a NavLink component
 * @param {string} to Link target
 * @param {XML} children Components to draw into this component
 * @returns {XML} JSX Content
 * @constructor
 */
function NavLink({to, children}) {
  return (
    <Link activeOnlyWhenExact to={to}>{({onClick, isActive}) =>
      <ListItem
        theme={styles}
        className={isActive ? styles.active : null}
        selectable
        caption={children}
        onClick={onClick}
      />
    }
    </Link>
  );
}

export default NavLink;
