import React, {Component} from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {Link} from "react-router";

@observer(["evalStore"])
class LeagueView extends Component {
  evalStore = null;

  /**
   * League constructor
   * @param {EvalStore} evalStore EvalStore
   * @param {Object} params Params
   */
  constructor({evalStore, params}) {
    super();
    this.evalStore = evalStore;
    this.key = params.key;
  }

  @computed get league() {
    console.log("Getting league", this.key);
    return this.evalStore.getLeague(this.key);
  }

  render() {
    return (
        <div>
          <p>{this.league.name}</p>
          <ul>
            {
              this.evalStore.getSeasons(this.key).map(season => {
                return (
                    <li key={season.key}><Link to={`/season/${season.key}`}>{season.name}</Link></li>
                );
              })
            }
          </ul>
        </div>
    );
  }
}

export default LeagueView;
