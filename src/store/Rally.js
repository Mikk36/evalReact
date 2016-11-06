import {observable, computed, action} from "mobx";

export default class Rally {
  @observable key = "rally key";
  @observable name = "rally name";
  @observable leagueKey = "league key";
  @observable seasonKey = "season key";
  @observable finished = true;
  @observable eventIDList = [];
  @observable restarterList = [];

  /**
   * Rally constructor
   * @param {string} key Rally key
   * @param {RallySpec} rally Rally data
   * @param {EvalStore} evalStore EvalStore
   */
  constructor(key, rally, evalStore) {
    this.evalStore = evalStore;
    this.key = key;
    this.updateRally(rally);
  }

  /**
   * Update rally
   * @param {RallySpec} rally
   */
  @action updateRally(rally) {
    this.name = rally.name;
    this.leagueKey = rally.league;
    this.seasonKey = rally.season;
    this.finished = rally.finished;
    this.eventIDList.replace(rally.eventIDList);
    this.restarterList.replace(rally.restarters);
  }

  /**
   * Get the league of the rally
   * @returns {LeagueSpec} League of the rally
   */
  @computed get league() {
    return this.evalStore.getLeague(this.leagueKey);
  }

  /**
   * Get the season of the rally
   * @return {SeasonSpec} Season of the rally
   */
  @computed get season() {
    return this.evalStore.getSeason(this.seasonKey);
  }

  @computed get restarters() {
    const list = [];
    for (const name of this.restarterList) {
      list.push(this.evalStore._drivers.get(name));
    }
    return list;
  }

  @computed get latestTimestamp() {
    if (this.eventIDList.length === 0) {
      return;
    }
    this.evalStore.listenRallyDataTimestamps(this.key);
    let timestamps = this.eventIDList.map(id => this.evalStore.getLatestDataTimestamp(id));
    timestamps = timestamps.filter(timestamp => timestamp !== null);
    if (timestamps.length === 0) {
      return;
    }
    timestamps.sort().reverse();

    return timestamps[0];
  }

  @computed get latestRaces() {
    return this.evalStore.getLatestRaces(this.key);
  }
}
