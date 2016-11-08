import React, {Component} from "react";
import {observer} from "mobx-react";
import {Link} from "react-router";

@observer(["evalStore"])
class SeasonView extends Component {
  evalStore = null;

  /**
   * Season constructor
   * @param {EvalStore} evalStore EvalStore
   * @param {Object} params Params
   */
  constructor({evalStore, params}) {
    super();
    this.evalStore = evalStore;
    this.key = params.key;

    this.evalStore.listenRallies(this.key);
  }

  getName() {
    const season = this.evalStore.getSeason(this.key);
    const league = this.evalStore.getLeague(season.league);
    return (<span>{league.name} {season.name}</span>);
  }

  render() {
    return (
        <div>
          <p>{this.getName()}</p>
          <ul>
            {
              this.evalStore.getRallies(this.key).map(rally => {
                return (
                    <li key={rally.key}><Link to={`/rally/${rally.key}`}>{rally.name}</Link></li>
                );
              })
            }
          </ul>
        </div>
    );
  }
}

export default SeasonView;
