import {observable, computed, action, map} from "mobx";

export default class Season {
  @observable key = "season key";
  @observable name = "season name";
  @observable leagueKey = "league key";
  @observable rallyList = [];
  @observable classes = map({});

  evalStore = null;

  /**
   * Rally constructor
   * @param {string} key Rally key
   * @param {SeasonSpec} season Season data
   * @param {EvalStore} evalStore EvalStore
   */
  constructor(key, season, evalStore) {
    this.evalStore = evalStore;
    this.key = key;

    this.updateSeason(season);
  }

  /**
   * Update rally
   * @param {SeasonSpec} season
   */
  @action updateSeason(season) {
    this.name = season.name;
    this.leagueKey = season.league;
    this.rallyList.replace(season.rallies);
    this.classes.clear();
    // Object.keys(season.classes).map(key => this.classes.set(key, season.classes[key]));
    this.classes.merge(season.classes);
    console.log(this.classes.entries());
  }

  /**
   * Get the league of the rally
   * @returns {LeagueSpec} League of the rally
   */
  @computed get league() {
    return this.evalStore.getLeague(this.leagueKey);
  }

  @computed get rallies() {
    let rallies = this.rallyList.map(rallyKey => {
      if (!this.evalStore._rallies.has(rallyKey)) {
        return;
      }
      return this.evalStore._rallies.get(rallyKey);
    });
    rallies = rallies.filter(rally => typeof rally !== "undefined");
    return rallies.sort(Season.rallyComparator);
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
   * Return car class, if found
   * @param {string} name Car name
   * @returns {CarClassSpec|Object} Car class or empty object
   */
  getCarClass(name) {
    const classes = this.classes.entries();
    for (let classEntry of classes) {
      /**
       * @type CarClassSpec
       */
      const carClass = classEntry[1];
      if (carClass.cars.includes(name)) {
        carClass.key = classEntry[0];
        return carClass;
      }
    }
    return {};
  }
}
