import React, {Component} from "react";
import {observer} from "mobx-react";
import {computed} from "mobx";
import {Link} from "react-router";

@observer(["evalStore"])
class SeasonView extends Component {
  evalStore = null;

  /**
   * Season constructor
   * @param {EvalStore} evalStore EvalStore
   * @param {Object} params Params
   */
  constructor({evalStore, params}) {
    super();
    this.evalStore = evalStore;
    this.key = params.key;

    this.evalStore.listenRallies(this.key);
  }

  @computed get season() {
    console.log("Getting season", this.key);
    return this.evalStore.getSeason(this.key);
  }

  getName() {
    if (!this.season.name) return;
    if (!this.season.league) return;

    return (<span>{this.season.league.name} {this.season.name}</span>);
  }

  renderRallies() {
    if (!this.season.rallies) return;

    return this.season.rallies.map(rally => {
      return (
          <li key={rally.key}><Link to={`/rally/${rally.key}`}>{rally.name}</Link></li>
      );
    });
  }

  render() {
    return (
        <div>
          <p>{this.getName()}</p>
          <ul>{this.renderRallies()}</ul>
        </div>
    );
  }
}

export default SeasonView;
