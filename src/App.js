import "./App.css";

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import Canvas from "./Canvas";
import JoinRoom from "./onboard/joinroom";
import { PlayerContext } from "./playercontext/playercontext";
import Onboard from "./onboard/onboard";
import JoinGame from "./onboard/joingame";

function App() {
  const [didRedirect, setDidRedirect] = React.useState(false);

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true);
  }, []);

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false);
  }, []);

  const [userName, setUserName] = React.useState("");

  return (
    <PlayerContext.Provider
      value={{
        didRedirect: didRedirect,
        playerDidRedirect: playerDidRedirect,
        playerDidNotRedirect: playerDidNotRedirect,
      }}
    >
      <Router>
        <Switch>
          <Route path="/" exact>
            <Onboard setUserName={setUserName} />
          </Route>
          <Route path="/game/:gameid" exact>
            {didRedirect ? (
              <React.Fragment>
                <JoinGame userName={userName} isCreator={true} />
                <Canvas myUserName={userName} />
              </React.Fragment>
            ) : (
              <JoinRoom />
            )}
          </Route>
          <Redirect to="/" />
        </Switch>
      </Router>
    </PlayerContext.Provider>
  );
}

export default App;
