import React, {Component} from "react";
import styles from "./styles.scss";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import {ListItem} from "react-toolbox/lib/list";

@observer
export default class ExpandableListItem extends Component {
  @observable isOpen = false;

  @action toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  render() {
    const {title, children} = this.props;
    return (
      <div>
        <ListItem
          theme={styles}
          selectable
          caption={title}
          onClick={this.toggleOpen}
        />
        {this.isOpen
          ? children
          : null}
      </div>
    );
  }
}
