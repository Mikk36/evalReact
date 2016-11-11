import React, {Component} from "react";
import {observer} from "mobx-react";

@observer(["evalStore"])
class RallyView extends Component {
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

    this.evalStore.listenRally(this.key);
    this.evalStore.listenRaces(this.key);
  }

  static formatRaceTime(time) {
    const secNum = time; // don't forget the second param
    const minutes = Math.floor(secNum / 60);
    const seconds = secNum - (minutes * 60);

    let minuteString = Math.floor(minutes).toString();
    let secondString = Math.floor(seconds).toString();
    let microSecondString = seconds.toFixed(3);
    microSecondString = microSecondString.substr(microSecondString.indexOf(".") + 1);

    if (minutes < 10) {
      minuteString = "0" + minuteString;
    }
    if (seconds < 10) {
      secondString = "0" + secondString;
    }
    return `${minuteString}:${secondString}.${microSecondString}`;
  }

  getName() {
    const rally = this.evalStore.getRally(this.key);
    if (!rally.key) {
      return;
    }
    return (<span>{rally.league.name} {rally.season.name} {rally.name}</span>);
  }

  getLatestTimestamp() {
    const timestamp = this.evalStore.getRally(this.key).latestTimestamp;
    if (!timestamp) {
      return;
    }
    return new Date(timestamp).toLocaleString("et-EE");
  }

  getLatestRaces() {
    const rally = this.evalStore.getRally(this.key);
    if (!rally.key) {
      return;
    }
    return rally.latestRaces.map(race => {
      return (
          <li key={race.key}>
            {new Date(race.timestamp).toLocaleString("et-EE")}&nbsp;
            Driver: {this.evalStore.getDriver(race.userName).name || race.userName}&nbsp;
            Stage: {race.stage}&nbsp;
            Time: {RallyView.formatRaceTime(race.time)}
          </li>
      );
    });
  }

  render() {
    return (
        <div>
          <p>{this.getName()}</p>
          <p>Latest data time: {this.getLatestTimestamp()}</p>
          <ul>
            {this.getLatestRaces()}
          </ul>
        </div>
    );
  }
}

export default RallyView;
