import React, {Component} from "react";
import {observer} from "mobx-react";
import {Link} from "react-router";

@observer(["evalStore"])
class League extends Component {
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

  render() {
    return (
        <div>
          <p>{this.evalStore.getLeague(this.key).name}</p>
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

export default League;
