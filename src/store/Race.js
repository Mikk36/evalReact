import {observable, action, computed} from "mobx";

export default class Race {
  @observable key = "race key";
  @observable rallyKey = "rally key";
  @observable stage = 0;
  @observable time = 0;
  @observable userName = "driver nickname";
  @observable timestamp = "timestamp";
  @observable car = "car name";
  @observable assists = false;

  evalStore = null;

  /**
   * Race constructor
   * @param {string} key Race key
   * @param {RaceSpec} race Race data
   * @param {EvalStore} evalStore EvalStore
   * @param {Rally} rally Rally
   */
  constructor(key, race, evalStore, rally) {
    this.evalStore = evalStore;
    this.key = key;
    this.rally = rally;
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

  @computed get vehicleClass() {
    return this.rally.season.getCarClass(this.car);
  }
}
