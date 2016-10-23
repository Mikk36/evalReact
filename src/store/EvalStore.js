import {observable, computed, action, map} from "mobx";
import Fb from "./FirebaseStore";

/**
 * EvalStore
 */
class EvalStore {
  @observable _drivers = map({});
  @observable _nicks = map({});
  @observable _leagues = map({});
  @observable _seasons = map({});
  @observable _rallies = map({});
  @observable _races = map({});
  @observable _latestRaces = map({});

  listeningSeasonsList = [];
  listeningRalliesList = [];
  listeningRacesList = [];

  /**
   * EvalStore constructor
   */
  constructor() {
    this.setupListeners();

    // autorun(() => {
    //   console.log("leagues", this.leagues);
    // });
  }

  /**
   * Get a sorted array of leagues
   * @returns {Array.<League>}
   */
  @computed get leagues() {
    const leagues = [];
    this._leagues.forEach((league, key) => {
      leagues.push({key, ...league});
    });
    return leagues.sort(EvalStore.leagueComparator);
  }

  /**
   * Get a single league
   * @param {string} leagueKey League key
   * @returns {League|Object} League or null
   */
  getLeague(leagueKey) {
    if (!this._leagues.has(leagueKey)) {
      return {};
    }
    return this._leagues.get(leagueKey);
  }

  /**
   * Get a sorted array of seasons
   * @param {string} leagueKey League key
   * @returns {Array.<Season>} Sorted list of seasons for a league
   */
  getSeasons(leagueKey) {
    if (!this._leagues.has(leagueKey)) {
      return [];
    }
    const league = this._leagues.get(leagueKey);
    let seasons = league.seasons.map(seasonKey => {
      if (!this._seasons.has(seasonKey)) {
        return;
      }
      const season = this._seasons.get(seasonKey);
      season.key = seasonKey;
      return season;
    });
    seasons = seasons.filter(season => typeof season !== "undefined");
    return seasons.sort(EvalStore.seasonComparator);
  }

  /**
   * Get a single season
   * @param {string} seasonKey Season key
   * @returns {Season|Object} Season or null
   */
  getSeason(seasonKey) {
    if (!this._seasons.has(seasonKey)) {
      return {};
    }
    return this._seasons.get(seasonKey);
  }

  /**
   * Get a sorted array of rallies
   * @param {string} seasonKey Season key
   * @returns {Array.<Rally>} Sorted list of rallies for a season
   */
  getRallies(seasonKey) {
    if (!this._seasons.has(seasonKey)) {
      return [];
    }
    const season = this._seasons.get(seasonKey);
    let rallies = season.rallies.map(rallyKey => {
      if (!this._rallies.has(rallyKey)) {
        return;
      }
      const rally = this._rallies.get(rallyKey);
      rally.key = rallyKey;
      return rally;
    });
    rallies = rallies.filter(rally => typeof rally !== "undefined");
    return rallies.sort(EvalStore.rallyComparator);
  }

  /**
   * Get a single rally
   * @param {string} rallyKey Rally key
   * @returns {Rally|Object} Rally or null
   */
  getRally(rallyKey) {
    if (!this._rallies.has(rallyKey)) {
      return {};
    }
    return this._rallies.get(rallyKey);
  }

  /**
   * Get latest races of a rally
   * @param {string} rallyKey Rally key
   * @returns {Array.<Race>|[]} Rally or null
   */
  getLatestRaces(rallyKey) {
    if (!this._latestRaces.has(rallyKey)) {
      return [];
    }
    return this._latestRaces.get(rallyKey);
  }

  /**
   * Get a driver by nick
   * @param {string} nick Nickname
   * @returns {Driver|Object} Driver
   */
  getDriver(nick) {
    if (!this._nicks.has(nick)) {
      return {};
    }
    return this._nicks.get(nick);
  }

  /**
   * Set up listeners for database
   */
  setupListeners() {
    this.setupLeagues();
    this.setupDrivers();
  }

  /**
   * Set up leagues listeners
   */
  setupLeagues() {
    const ref = Fb.leagues;
    ref.on("child_added", snap => this.leagueAdded(snap.key, snap.val()));
    ref.on("child_changed", snap => this.leagueChanged(snap.key, snap.val()));
    ref.on("child_removed", snap => this.leagueRemoved(snap.key, snap.val()));
  }

  /**
   * League added to DB
   * @param {string} key
   * @param {League} league
   */
  @action leagueAdded(key, league) {
    if (this._leagues.has(key)) {
      throw new Error("Why do we already have this league!?");
    }
    this._leagues.set(key, league);
    this.listenSeasons(key);
  }

  /**
   * League changed in DB
   * @param {string} key
   * @param {League} league
   */
  @action leagueChanged(key, league) {
    if (!this._leagues.has(key)) {
      throw new Error("Why do we not have this league yet!?");
    }
    this._leagues.set(key, league);
  }

  /**
   * League removed from DB
   * @param {string} key
   * @param {League} league
   */
  @action leagueRemoved(key, league) {
    if (!this._leagues.has(key)) {
      throw new Error("Why are we missing this league!?");
    }
    this._leagues.delete(key);
  }

  /**
   * Set up drivers listeners
   */
  setupDrivers() {
    const ref = Fb.drivers;
    ref.on("child_added", snap => this.driverAdded(snap.key, snap.val()));
    ref.on("child_changed", snap => this.driverChanged(snap.key, snap.val()));
    ref.on("child_removed", snap => this.driverRemoved(snap.key, snap.val()));
  }

  /**
   * Driver added to DB
   * @param {string} name Driver name
   * @param {Driver} driver Driver data
   */
  @action driverAdded(name, driver) {
    if (this._drivers.has(name)) {
      throw new Error("Why do we already have this driver!?");
    }
    this._drivers.set(name, driver);
    Object.keys(driver.nicks).forEach(nickKey => {
      const nick = driver.nicks[nickKey];
      this._nicks.set(nick, {name: name});
    });
  }

  /**
   * Driver changed in DB
   * @param {string} name Driver name
   * @param {Driver} driver Driver data
   */
  @action driverChanged(name, driver) {
    if (!this._drivers.has(name)) {
      throw new Error("Why do we not have this driver yet!?");
    }
    Object.keys(driver.nicks).forEach(nickKey => {
      const nick = driver.nicks[nickKey];
      this._nicks.delete(nick);
    });
    this._drivers.set(name, driver);
    Object.keys(driver.nicks).forEach(nickKey => {
      const nick = driver.nicks[nickKey];
      this._nicks.set(nick, {name: name});
    });
  }

  /**
   * Driver removed from DB
   * @param {string} name Driver name
   * @param {Driver} driver Driver data
   */
  @action driverRemoved(name, driver) {
    if (!this._drivers.has(name)) {
      throw new Error("Why are we missing this driver!?");
    }
    Object.keys(driver.nicks).forEach(nickKey => {
      const nick = driver.nicks[nickKey];
      this._nicks.delete(nick);
    });
    this._drivers.delete(name);
  }

  /**
   * Set up listeners for seasons of specific league
   * @param {string} leagueKey League key
   */
  listenSeasons(leagueKey) {
    if (this.listeningSeasonsList.indexOf(leagueKey) >= 0) {
      return;
    }
    this.listeningSeasonsList.push(leagueKey);

    const ref = Fb.seasons.orderByChild("league").equalTo(leagueKey);
    ref.on("child_added", snap => this.seasonAdded(snap.key, snap.val()));
    ref.on("child_changed", snap => this.seasonChanged(snap.key, snap.val()));
    ref.on("child_removed", snap => this.seasonRemoved(snap.key, snap.val()));
  }

  /**
   * Season added to DB
   * @param {string} key
   * @param {Season} season
   */
  @action seasonAdded(key, season) {
    if (this._seasons.has(key)) {
      throw new Error("Why do we already have this season!?");
    }
    this._seasons.set(key, season);
  }

  /**
   * Season changed in DB
   * @param {string} key
   * @param {Season} season
   */
  @action seasonChanged(key, season) {
    if (!this._seasons.has(key)) {
      throw new Error("Why do we not have this season yet!?");
    }
    this._seasons.set(key, season);
  }

  /**
   * Season removed from DB
   * @param {string} key
   * @param {Season} season
   */
  @action seasonRemoved(key, season) {
    if (!this._seasons.has(key)) {
      throw new Error("Why are we missing this season!?");
    }
    this._seasons.delete(key);
  }

  /**
   * Set up listeners for rallies of a specific season
   * @param {string} seasonKey Season key
   */
  listenRallies(seasonKey) {
    if (this.listeningRalliesList.indexOf(seasonKey) >= 0) {
      return;
    }
    this.listeningRalliesList.push(seasonKey);

    console.log(`Listening rallies for ${seasonKey}`);
    const ref = Fb.rallies.orderByChild("season").equalTo(seasonKey);
    ref.on("child_added", snap => this.rallyAdded(snap.key, snap.val()));
    ref.on("child_changed", snap => this.rallyChanged(snap.key, snap.val()));
    ref.on("child_removed", snap => this.rallyRemoved(snap.key, snap.val()));
  }

  listenRally(rallyKey) {
    if (this._rallies.has(rallyKey)) {
      return;
    }
    Fb.rallies.child(rallyKey).once("value", snap => {
      this.listenRallies(snap.val().season);
    });
  }

  /**
   * Rally added to DB
   * @param {string} key
   * @param {Rally} rally
   */
  @action rallyAdded(key, rally) {
    if (this._rallies.has(key)) {
      throw new Error("Why do we already have this rally!?");
    }
    this._rallies.set(key, rally);
  }

  /**
   * Rally changed in DB
   * @param {string} key
   * @param {Rally} rally
   */
  @action rallyChanged(key, rally) {
    if (!this._rallies.has(key)) {
      throw new Error("Why do we not have this rally yet!?");
    }
    this._rallies.set(key, rally);
  }

  /**
   * Rally removed from DB
   * @param {string} key
   * @param {Rally} rally
   */
  @action rallyRemoved(key, rally) {
    if (!this._rallies.has(key)) {
      throw new Error("Why are we missing this rally!?");
    }
    this._rallies.delete(key);
  }

  /**
   * Set up listeners for races of a specific rally
   * @param {string} rallyKey Season key
   */
  @action listenRaces(rallyKey) {
    if (this.listeningRacesList.indexOf(rallyKey) >= 0) {
      return;
    }
    this.listeningRacesList.push(rallyKey);

    console.log(`Listening races for ${rallyKey}`);
    this._races.set(rallyKey, map({}));

    const ref = Fb.races.child(rallyKey);
    ref.on("child_added", snap => this.raceAdded(rallyKey, snap.key, snap.val()));
    ref.on("child_changed", snap => this.raceChanged(rallyKey, snap.key, snap.val()));
    ref.on("child_removed", snap => this.raceRemoved(rallyKey, snap.key, snap.val()));
    ref.orderByChild("timestamp").limitToLast(10).on("value", snap => this.setLatestRaces(rallyKey, snap));
  }

  /**
   * Race added to DB
   * @param {string} rallyKey
   * @param {string} key
   * @param {Race} race
   */
  @action raceAdded(rallyKey, key, race) {
    if (this._races.get(rallyKey).has(key)) {
      throw new Error("Why do we already have this race!?");
    }
    race.key = key;
    this._races.get(rallyKey).set(key, race);
  }

  /**
   * Race changed in DB
   * @param {string} rallyKey
   * @param {string} key
   * @param {Race} race
   */
  @action raceChanged(rallyKey, key, race) {
    if (!this._races.get(rallyKey).has(key)) {
      throw new Error("Why do we not have this race yet!?");
    }
    race.key = key;
    this._races.get(rallyKey).set(key, race);
  }

  /**
   * Race removed from DB
   * @param {string} rallyKey
   * @param {string} key
   * @param {Race} race
   */
  @action raceRemoved(rallyKey, key, race) {
    if (!this._races.get(rallyKey).has(key)) {
      throw new Error("Why are we missing this race!?");
    }
    this._races.get(rallyKey).delete(key);
  }

  /**
   * Set latest races for a rally
   * @param {string} rallyKey
   * @param {firebase.database.DataSnapshot} snap
   */
  @action setLatestRaces(rallyKey, snap) {
    const latestRaces = [];
    snap.forEach(raceSnap => {
      const race = raceSnap.val();
      race.key = raceSnap.key;
      latestRaces.push(race);
    });
    latestRaces.reverse();
    this._latestRaces.set(rallyKey, latestRaces);
  }

  /**
   * Sort leagues by order property
   * @param {League} league1 League for sorting
   * @param {League} league2 League for sorting
   * @returns {number} Sorting comparator result
   */
  static leagueComparator(league1, league2) {
    return league1.order - league2.order;
  }

  /**
   * Sort seasons by name
   * @param {Season} season1 League for sorting
   * @param {Season} season2 League for sorting
   * @returns {number} Sorting comparator result
   */
  static seasonComparator(season1, season2) {
    return season1.name.localeCompare(season2.name, "en", {sensitivity: "base"});
  }

  /**
   * Sort rallies by name
   * @param {Rally} rally1 Rally for sorting
   * @param {Rally} rally2 Rally for sorting
   * @returns {number} Sorting comparator result
   */
  static rallyComparator(rally1, rally2) {
    return rally1.name.localeCompare(rally2.name, "en", {sensitivity: "base"});
  }

  /**
   * League
   * @typedef {Object} League
   * @property {string} name
   * @property {number} order
   * @property {Array.<string>|undefined} seasons
   */

  /**
   * Season
   * @typedef {Object} Season
   * @property {string} name
   * @property {string} league
   * @property {number} stages
   * @property {Array.<string>|undefined} rallies
   * @property {string|undefined} key
   */

  /**
   * Rally
   * @typedef {Object} Rally
   * @property {string} name
   * @property {string} league
   * @property {string} season
   * @property {boolean} finished
   * @property {Array.<number>|undefined} eventIDList
   * @property {Array.<string>|undefined} restarters
   * @property {string|undefined} key
   */

  /**
   * Driver
   * @typedef {Object} Driver
   * @property {string} name
   * @property {Array.<string>} nicks
   */

  /**
   * Nick
   * @typedef {Object} Nick
   * @property {string} name
   */

  /**
   * Race
   * @typedef {Object} Race
   * @property {boolean} assists
   * @property {string} car
   * @property {number} stage
   * @property {number} time
   * @property {string} timestamp
   * @property {string} userName
   * @property {string} key
   */
}

const evalStore = new EvalStore();
window.evalStore = evalStore;
export default evalStore;
