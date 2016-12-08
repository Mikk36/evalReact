import {observable, computed, action, map} from "mobx";
import Fb from "./FirebaseStore";
import Race from "./Race";

export default class Rally {
  @observable key = "rally key";
  @observable name = "rally name";
  @observable leagueKey = "league key";
  @observable seasonKey = "season key";
  @observable finished = true;
  @observable eventIDList = [];
  @observable eventData = map({});
  @observable restarterList = [];
  @observable races = map({});
  _listeningForRaces = false;
  @observable latestRaces = [];

  eventDataListeners = {};

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

    this.createEventDataListeners();

    this.updateRally(rally);

    if (this.evalStore.listeningRacesList.includes(key)) {
      this.listenRaces();
    }
  }

  createEventDataListeners() {
    this.eventDataListeners.added = snap => this.addEventData(snap.key, snap.val());
    this.eventDataListeners.changed = snap => this.updateEventData(snap.key, snap.val());
    this.eventDataListeners.removed = snap => this.removeEventData(snap.key);
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
    if (!this.compareEventIDArrays(this.eventIDList, rally.eventIDList)) {
      this.unListenEventData();
      this.eventIDList.replace(rally.eventIDList);
      this.listenEventData();
    }
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
   * @return {Season} Season of the rally
   */
  @computed get season() {
    return this.evalStore.getSeason(this.seasonKey);
  }

  @computed get stages() {
    const season = this.evalStore.getSeason(this.seasonKey);
    if (!season.name) return 0;
    return season.stages;
  }

  @computed get restarters() {
    const list = [];
    for (const name of this.restarterList) {
      list.push(this.evalStore._drivers.get(name));
    }
    return list;
  }

  @computed get latestTimestamp() {
    if (this.eventData.size === 0) {
      return;
    }
    let timestamps = [];
    this.eventData.forEach(event => {
      timestamps.push(event.timestamp);
    });
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
  addRace(key, race) {
    this.updateRace(key, race);
  }

  /**
   * Update a race of the rally
   * @param {string} key Race key
   * @param {RaceSpec} race Race data
   */
  @action updateRace(key, race) {
    this.races.set(key, new Race(key, race, this.evalStore, this));
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
  listenRaces() {
    if (this._listeningForRaces) {
      return;
    }
    this._listeningForRaces = true;

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
      const race = new Race(raceSnap.key, raceSnap.val(), this.evalStore, this);
      latestRaces.push(race);
    });
    latestRaces.reverse();
    this.latestRaces.replace(latestRaces);
  }

  listenEventData() {
    this.eventIDList.forEach(id => {
      const ref = Fb.eventData.orderByKey().equalTo(String(id));
      ref.on("child_added", this.eventDataListeners.added);
      ref.on("child_changed", this.eventDataListeners.changed);
      ref.on("child_removed", this.eventDataListeners.removed);
    });
  }

  unListenEventData() {
    this.eventIDList.forEach(id => {
      const ref = Fb.eventData.child(id);
      ref.off("child_added", this.eventDataListeners.added);
      ref.off("child_changed", this.eventDataListeners.changed);
      ref.off("child_removed", this.eventDataListeners.removed);
    });
  }

  /**
   * Add an event
   * @param {string} key Event key
   * @param {EventSpec} data Event data
   */
  addEventData(key, data) {
    this.updateEventData(key, data);
  }

  /**
   * Update an event
   * @param {string} key Event key
   * @param {EventSpec} data Event data
   */
  @action updateEventData(key, data) {
    this.eventData.set(key, data);
  }

  /**
   * Remove an event
   * @param {string} key Event key
   */
  @action removeEventData(key) {
    this.eventData.delete(key);
  }

  /**
   * Compare two arrays of event IDs and return true, if equal
   * @param {Array.<number>} oldArray Old array of event IDs
   * @param {Array.<number>} newArray New array of event IDs
   * @returns {boolean} True, if arrays are equal
   */
  compareEventIDArrays(oldArray, newArray) {
    return oldArray.length === newArray.length && oldArray.every((id, i) => id === newArray[i]);
  }

  /**
   * Get races for a stage
   * @param {number} stage Stage number
   * @returns {Array.<RaceSpec>} Array of races ordered by time
   */
  getRaces(stage) {
    const races = [];
    this.races.forEach(/** RaceSpec */ race => {
      if (race.stage === stage) races.push(race);
    });

    races.sort((race1, race2) => race1.time - race2.time);

    return races;
  }
}
