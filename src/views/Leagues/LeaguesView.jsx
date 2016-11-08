import React, {Component} from "react";
import {observer} from "mobx-react";
import {Link} from "react-router";

@observer(["evalStore"])
class LeaguesView extends Component {
  evalStore = null;

  constructor({evalStore}) {
    super();

    this.evalStore = evalStore;
  }

  render() {
    return (
        <div>
          <p>Liigad</p>
          <ul>
            {
              this.evalStore.leagues.map(league => {
                return (
                    <li key={league.key}><Link to={`/league/${league.key}`}>{league.name}</Link></li>
                );
              })
            }
          </ul>
        </div>
    );
  }
}

export default LeaguesView;
