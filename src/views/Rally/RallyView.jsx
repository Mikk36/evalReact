import React, {Component} from "react";
import {observer} from "mobx-react";
import {computed} from "mobx";
import {Tab, Tabs, Table} from "react-toolbox";
import Moment from "moment";

@observer(["evalStore"])
class RallyView extends Component {
  evalStore = null;

  state = {
    tabIndex: 0
  };

  setActiveTab = null;

  /**
   * Season constructor
   * @param {EvalStore} evalStore EvalStore
   * @param {Object} params Params
   */
  constructor({evalStore, params}) {
    super();
    this.evalStore = evalStore;
    this.key = params.key;

    this.initMethods();

    this.evalStore.listenRally(this.key);
    this.evalStore.listenRaces(this.key);

    // 0.9830000000000041
    console.log(RallyView.formatDifference(0.95000000001));
  }

  @computed get rally() {
    console.log("Getting rally", this.key);
    return this.evalStore.getRally(this.key);
  }

  static formatRaceTime(time) {
    const t = Moment.utc(time * 1000);
    return t.format("mm:ss.SSS");
  }

  static formatDifference(time) {
    const t = Moment.utc(time * 1000);
    return t.format("+mm:ss.S");
  }

  getName() {
    if (!this.rally.key) {
      return;
    }
    return (<span>{this.rally.league.name} {this.rally.season.name} {this.rally.name}</span>);
  }

  getLatestTimestamp() {
    if (!this.rally.latestTimestamp) {
      return;
    }
    return new Date(this.rally.latestTimestamp).toLocaleString("et-EE");
  }

  getLatestRaces() {
    if (!this.rally.key) {
      return;
    }
    return this.rally.latestRaces.map(race => {
      return (
          <li key={race.key}>
            {new Date(race.timestamp).toLocaleString("et-EE")}&nbsp;
            Class: {race.vehicleClass.name}&nbsp;
            Driver: {this.evalStore.getDriver(race.userName).name || race.userName}&nbsp;
            Stage: {race.stage}&nbsp;
            Time: {RallyView.formatRaceTime(race.time)}
          </li>
      );
    });
  }

  initMethods() {
    this.setActiveTab = newIndex => {
      this.setState({tabIndex: newIndex});
    };
  }

  RaceModel = {
    place: {type: Number, title: "Koht"},
    name: {type: String, title: "Nimi"},
    time: {type: String, title: "Aeg"},
    diffToFirst: {type: String, title: "Vahe esimesega"},
    diffToPrevious: {type: String, title: "Vahe eelmisega"}
  };

  getTabs() {
    if (!this.rally.key) return [];

    const tabs = [];
    const stages = this.rally.season.stages;
    for (let stageNum = 1; stageNum <= stages; stageNum++) {
      const races = this.rally.getRaces(stageNum);
      const data = races.map((race, index) => {
        // if (index !== 0 && race.stage === 6 && race.driver !== null && race.driver.name === "Ken Kivi") {
        //   console.log("times: ", race.time, races[index - 1].time);
        //   console.log("difference: ", race.time - races[index - 1].time);
        //   console.log(RallyView.formatDifference(race.time - races[index - 1].time));
        // }
        return {
          place: index + 1,
          name: this.evalStore.getDriver(race.userName).name || race.userName,
          time: RallyView.formatRaceTime(race.time),
          diffToFirst: index !== 0 ? RallyView.formatDifference(race.time - races[0].time) : "",
          diffToPrevious: index !== 0 ? RallyView.formatDifference(race.time - races[index - 1].time) : ""
        };
      });
      tabs.push(<Tab key={stageNum} label={"SS" + stageNum}>
        <Table
            model={this.RaceModel}
            source={data}
            selectable={false}
        />
      </Tab>);
    }
    return tabs;
  }

  render() {
    return (
        <div>
          <p>{this.getName()}</p>
          <p>Latest data time: {this.getLatestTimestamp()}</p>
          <Tabs index={this.state.tabIndex} onChange={this.setActiveTab}>
            <Tab label="Värskeimad sõidud">
              <ul>
                {this.getLatestRaces()}
              </ul>
            </Tab>
            <Tab label="Üld">Blah</Tab>
            <Tab label="Üld tiimid">Tiimid</Tab>
            {
              this.getTabs()
            }
          </Tabs>
        </div>
    );
  }
}

export default RallyView;
