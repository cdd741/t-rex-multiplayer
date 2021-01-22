import { createContext } from "react";

export const PlayerContext = createContext({
  didRedirect: false,
  playerDidRedirect: () => {},
  playerDidNotRedirect: () => {},
});
