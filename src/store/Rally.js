import {observable, computed, action, map} from "mobx";
import Fb from "./FirebaseStore";

export default class Rally {
  @observable key = "rally key";
  @observable name = "rally name";
  @observable leagueKey = "league key";
  @observable seasonKey = "season key";
  @observable finished = true;
  @observable eventIDList = [];
  @observable restarterList = [];
  @observable races = map({});
  _listeningForRaces = false;
  @observable latestRaces = [];

  evalStore = null;

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

    if (this.evalStore.listeningRacesList.includes(key)) {
      this.listenRaces();
    }
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

  /**
   * Add a race to the rally
   * @param {string} key Race key
   * @param {RaceSpec} race Race data
   */
  @action addRace(key, race) {
    this.updateRace(key, race);
  }

  /**
   * Update a race of the rally
   * @param {string} key Race key
   * @param {RaceSpec} race Race data
   */
  @action updateRace(key, race) {
    this.races.set(key, race);
  }

  /**
   * Remove a race from the rally
   * @param {string} key Race key
   */
  @action removeRace(key) {
    this.races.delete(key);
  }

  /**
   * Set up listeners for races
   */
  @action listenRaces() {
    if (this._listeningForRaces) {
      return;
    }

    console.log(`Listening races for ${this.key}`);

    const ref = Fb.races.child(this.key);
    ref.on("child_added", snap => this.addRace(snap.key, snap.val()));
    ref.on("child_changed", snap => this.updateRace(snap.key, snap.val()));
    ref.on("child_removed", snap => this.removeRace(snap.key));
    ref.orderByChild("timestamp").limitToLast(10).on("value", snap => this.setLatestRaces(snap));
  }

  /**
   * Set the latest races
   * @param {firebase.database.DataSnapshot} snap
   */
  @action setLatestRaces(snap) {
    const latestRaces = [];
    snap.forEach(raceSnap => {
      const race = raceSnap.val();
      race.key = raceSnap.key;
      latestRaces.push(race);
    });
    latestRaces.reverse();
    this.latestRaces.replace(latestRaces);
  }
}
