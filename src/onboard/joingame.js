import React from "react";
import { useParams } from "react-router-dom";
const socket = require("../connection/socket").socket;

const JoinGameRoom = (gameid, userName, isCreator) => {
  const idData = {
    gameId: gameid,
    userName: userName,
    isCreator: isCreator,
  };
  socket.emit("playerJoinGame", idData);
  console.log("join game");
};

const JoinGame = (props) => {
  const { gameid } = useParams();
  JoinGameRoom(gameid, props.userName, props.isCreator);
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Welcome to Play with Friend!</h1>
    </div>
  );
};

export default JoinGame;
