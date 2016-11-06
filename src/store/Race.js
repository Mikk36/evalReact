import {observable, action} from "mobx";

export default class Race {
  @observable key = "race key";
  @observable rallyKey = "rally key";
  @observable stage = 0;
  @observable time = 0;
  @observable userName = "driver nickname";
  @observable timestamp = "timestamp";
  @observable car = "car name";
  @observable assists = false;

  /**
   * Race constructor
   * @param {string} key Race key
   * @param {RaceSpec} race Race data
   * @param {EvalStore} evalStore EvalStore
   * @param {string} rallyKey Rally key
   */
  constructor(key, race, evalStore, rallyKey) {
    this.evalStore = evalStore;
    this.key = key;
    this.rallyKey = rallyKey;
    this.updateRace(race);
  }

  /**
   * Update a race
   * @param {RaceSpec} race Race data
   */
  @action updateRace(race) {
    this.stage = race.stage;
    this.time = race.time;
    this.userName = race.userName;
    this.timestamp = race.timestamp;
    this.car = race.car;
    this.assists = race.assists;
  }
}
