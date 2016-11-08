import {observable, computed, action, map} from "mobx";
import Fb from "./FirebaseStore";
import Rally from "./Rally";

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
  @observable _latestDataTimestamps = map({});

  listeningSeasonsList = [];
  listeningRalliesList = [];
  listeningRacesList = [];
  listeningCacheTimestampList = [];

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
   * @returns {Array.<LeagueSpec>}
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
   * @returns {LeagueSpec|Object} League or null
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
   * @returns {Array.<SeasonSpec>} Sorted list of seasons for a league
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
   * @returns {SeasonSpec|Object} Season or null
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
      return this._rallies.get(rallyKey);
    });
    rallies = rallies.filter(rally => typeof rally !== "undefined");
    return rallies.sort(EvalStore.rallyComparator);
  }

  /**
   * Get a single rally
   * @param {string} rallyKey Rally key
   * @returns {Rally|Object} Rally or empty object
   */
  getRally(rallyKey) {
    if (!this._rallies.has(rallyKey)) {
      return {};
    }
    return this._rallies.get(rallyKey);
  }

  /**
   * Get a driver by nick
   * @param {string} nick Nickname
   * @returns {DriverSpec|Object} Driver
   */
  getDriver(nick) {
    if (!this._nicks.has(nick)) {
      return {};
    }
    return this._nicks.get(nick);
  }

  /**
   * Get the latest timestamp of an API Response
   * @param {number} cacheId API cache ID
   * @returns {string|null} Latest timestamp string or null
   */
  getLatestDataTimestamp(cacheId) {
    if (!this._latestDataTimestamps.has(cacheId.toString())) {
      return null;
    }
    return this._latestDataTimestamps.get(cacheId);
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
   * @param {LeagueSpec} league
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
   * @param {LeagueSpec} league
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
   * @param {LeagueSpec} league
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
   * @param {DriverSpec} driver Driver data
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
   * @param {DriverSpec} driver Driver data
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
   * @param {DriverSpec} driver Driver data
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
   * @param {SeasonSpec} season
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
   * @param {SeasonSpec} season
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
   * @param {SeasonSpec} season
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
    Fb.seasons.child(`${seasonKey}/rallies`).on("value", snap => {
      const list = snap.val();
      list.forEach(key => this.listenRally(key));
    });
  }

  /**
   * Set up listeners for a single rally
   * @param {string} rallyKey Rally key
   */
  listenRally(rallyKey) {
    if (this.listeningRalliesList.indexOf(rallyKey) >= 0) {
      return;
    }
    this.listeningRalliesList.push(rallyKey);

    console.log(`Listening for rally ${rallyKey}`);
    const ref = Fb.rallies.orderByKey().equalTo(rallyKey);
    ref.on("child_added", snap => this.rallyAdded(snap.key, snap.val()));
    ref.on("child_changed", snap => this.rallyChanged(snap.key, snap.val()));
    ref.on("child_removed", snap => this.rallyRemoved(snap.key, snap.val()));
  }

  /**
   * Rally added to DB
   * @param {string} key
   * @param {RallySpec} rally
   */
  @action rallyAdded(key, rally) {
    if (this._rallies.has(key)) {
      throw new Error("Why do we already have this rally!?");
    }
    this._rallies.set(key, new Rally(key, rally, this));
  }

  /**
   * Rally changed in DB
   * @param {string} key
   * @param {RallySpec} rally
   */
  @action rallyChanged(key, rally) {
    if (!this._rallies.has(key)) {
      throw new Error("Why do we not have this rally yet!?");
    }
    this._rallies.get(key).updateRally(rally);
  }

  /**
   * Rally removed from DB
   * @param {string} key
   * @param {RallySpec} rally
   */
  @action rallyRemoved(key, rally) {
    if (!this._rallies.has(key)) {
      throw new Error("Why are we missing this rally!?");
    }
    this._rallies.delete(key);
  }

  /**
   * Listen to races of a rally
   * @param {string} key Rally key
   */
  @action listenRaces(key) {
    if (this.listeningRacesList.includes(key)) {
      return;
    }
    this.listeningRacesList.push(key);
    if (this._rallies.has(key)) {
      this._rallies.get(key).listenRaces();
    }
  }

  /**
   * Listen for timestamps of API responses for a rally
   * @param {string} rallyKey Rally key
   */
  listenRallyDataTimestamps(rallyKey) {
    if (!this._rallies.has(rallyKey)) {
      return;
    }
    const rally = this._rallies.get(rallyKey);
    if (!rally.hasOwnProperty("eventIDList")) {
      return;
    }
    rally.eventIDList.forEach(id => this.listenLatestDataTimestamp(id));
  }

  /**
   * Listen for the latest timestamp of an API response
   * @param {number} cacheId API response ID
   */
  listenLatestDataTimestamp(cacheId) {
    if (this.listeningCacheTimestampList.includes(cacheId)) {
      return;
    }
    this.listeningCacheTimestampList.push(cacheId);

    console.log(`Listening cache timestamp for ${cacheId}`);

    Fb.apiCache.child(`${cacheId}/timestamp`).on("value", snap => this.setLatestDataTimestamp(cacheId, snap.val()));
  }

  /**
   * Save the latest timestamp of an API response
   * @param {number} cacheId
   * @param {string} timestamp
   */
  @action setLatestDataTimestamp(cacheId, timestamp) {
    this._latestDataTimestamps.set(cacheId.toString(), timestamp);
  }

  /**
   * Sort leagues by order property
   * @param {LeagueSpec} league1 League for sorting
   * @param {LeagueSpec} league2 League for sorting
   * @returns {number} Sorting comparator result
   */
  static leagueComparator(league1, league2) {
    return league1.order - league2.order;
  }

  /**
   * Sort seasons by name
   * @param {SeasonSpec} season1 League for sorting
   * @param {SeasonSpec} season2 League for sorting
   * @returns {number} Sorting comparator result
   */
  static seasonComparator(season1, season2) {
    return season1.name.localeCompare(season2.name, "en", {sensitivity: "base"});
  }

  /**
   * Sort rallies by name
   * @param {RallySpec} rally1 Rally for sorting
   * @param {RallySpec} rally2 Rally for sorting
   * @returns {number} Sorting comparator result
   */
  static rallyComparator(rally1, rally2) {
    return rally1.name.localeCompare(rally2.name, "en", {sensitivity: "base"});
  }

  /**
   * League
   * @typedef {Object} LeagueSpec
   * @property {string} name
   * @property {number} order
   * @property {Array.<string>|undefined} seasons
   */

  /**
   * Season
   * @typedef {Object} SeasonSpec
   * @property {string} name
   * @property {string} league
   * @property {number} stages
   * @property {Array.<string>|undefined} rallies
   * @property {string|undefined} key
   */

  /**
   * Rally
   * @typedef {Object} RallySpec
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
   * @typedef {Object} DriverSpec
   * @property {string} name
   * @property {Array.<string>} nicks
   */

  /**
   * Nick
   * @typedef {Object} NickSpec
   * @property {string} name
   */

  /**
   * Race
   * @typedef {Object} RaceSpec
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
