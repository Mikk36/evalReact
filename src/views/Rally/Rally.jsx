import React, {Component} from "react";
import {observer} from "mobx-react";

@observer(["evalStore"])
class Rally extends Component {
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
    const season = this.evalStore.getSeason(rally.season);
    const league = this.evalStore.getLeague(season.league);
    return (<span>{league.name} {season.name} {rally.name}</span>);
  }

  getLatestTimestamp() {
    const rally = this.evalStore.getRally(this.key);
    if (!rally.eventIDList) {
      return;
    }
    let timestamps = rally.eventIDList.map(id => this.evalStore.getLatestDataTimestamp(id));
    timestamps = timestamps.filter(timestamp => timestamp !== null);
    if (timestamps.length === 0) {
      return;
    }
    timestamps.sort().reverse();
    return new Date(timestamps[0]).toLocaleString("et-EE");
  }

  render() {
    return (
        <div>
          <p>{this.getName()}</p>
          <p>Latest data time: {this.getLatestTimestamp()}</p>
          <ul>
            {
              this.evalStore.getLatestRaces(this.key).map(race => {
                return (
                    <li key={race.key}>
                      {new Date(race.timestamp).toLocaleString("et-EE")}&nbsp;
                      Driver: {this.evalStore.getDriver(race.userName).name}&nbsp;
                      Stage: {race.stage}&nbsp;
                      Time: {Rally.formatRaceTime(race.time)}
                    </li>
                );
              })
            }
          </ul>
        </div>
    );
  }
}

export default Rally;
