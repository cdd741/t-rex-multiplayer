import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "./playercontext/playercontext";
import VideoChatApp from "./connection/videochat";
const socket = require("./connection/socket").socket;

const Canvas = (props) => {
  const [p1Direction, setP1Direction] = useState(0);
  const [p2Direction, setP2Direction] = useState(0);
  const [p1JumpHeight, setP1JumpHeight] = useState(0);
  const [p2JumpHeight, setP2JumpHeight] = useState(0);
  const [p1Jump, setP1Jump] = useState(false);
  const [p2Jump, setP2Jump] = useState(false);
  const iAmPlayerOne = props.player;
  const maxHeight = 225;
  const canvasWidth = 500;
  const canvasHeight = 300;
  const canvasRef = useRef(null);

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#00000";
    ctx.beginPath();

    if (p1JumpHeight === 0) {
      setP1Jump(false);
    } else if (p1JumpHeight === maxHeight) {
      setP1Direction(1);
    }

    if (p1Jump === true) {
      ctx.rect(50, 250 - p1JumpHeight, 50, 50);
      setP1JumpHeight(p1JumpHeight - p1Direction);
    } else {
      ctx.rect(50, 250, 50, 50);
    }

    if (p2JumpHeight === 0) {
      setP2Jump(false);
    } else if (p2JumpHeight === maxHeight) {
      setP2Direction(1);
    }

    if (p2Jump === true) {
      ctx.rect(125, 250 - p2JumpHeight, 50, 50);
      setP2JumpHeight(p2JumpHeight - p2Direction);
    } else {
      ctx.rect(125, 250, 50, 50);
    }

    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    // console.log(p1JumpHeight, p1Jump);

    // draw
    const render = () => {
      draw(context);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === " ") {
        console.log(iAmPlayerOne, "key press jump");
        jump(iAmPlayerOne);
        console.log("socket");
        socket.emit("jump", {
          gameId: props.gameId,
          isPlayerOne: iAmPlayerOne,
        });
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    socket.on("opponent jump", (info) => {
      console.log(info.isPlayerOne, " jump");
      jump(info.isPlayerOne);
    });
  }, []);

  const jump = (playerOne) => {
    if (playerOne) {
      setP1Jump(true);
      setP1JumpHeight(1);
      setP1Direction(-1);
      console.log("p1 jump");
    } else {
      setP2Jump(true);
      setP2JumpHeight(1);
      setP2Direction(-1);
      console.log("p2 jump");
    }

    // if (playerOne === iAmPlayerOne) {
    // }
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      {...props}
      style={{ border: "1px solid #000000" }}
    />
  );
};

const GameWrapper = (props) => {
  const domainName = "http://localhost:3000";
  const player = React.useContext(PlayerContext);
  const { gameid } = useParams();
  const [opponentSocketId, setOpponentSocketId] = React.useState("");
  const [opponentDidJoinTheGame, didJoinGame] = React.useState(false);
  const [opponentUserName, setUserName] = React.useState("");
  const [gameSessionDoesNotExist, doesntExist] = React.useState(false);

  React.useEffect(() => {
    socket.on("playerJoinedRoom", (statusUpdate) => {
      console.log(
        "A new player has joined the room! Username: " +
          statusUpdate.userName +
          ", Game id: " +
          statusUpdate.gameId +
          " Socket id: " +
          statusUpdate.mySocketId
      );
      if (socket.id !== statusUpdate.mySocketId) {
        setOpponentSocketId(statusUpdate.mySocketId);
      }
    });

    socket.on("status", (statusUpdate) => {
      console.log(statusUpdate);
      alert(statusUpdate);
      if (
        statusUpdate === "This game session does not exist." ||
        statusUpdate === "There are already 2 people playing in this room."
      ) {
        doesntExist(true);
      }
    });

    socket.on("start game", (opponentUserName) => {
      console.log("START!");
      if (opponentUserName !== props.myUserName) {
        setUserName(opponentUserName);
        didJoinGame(true);
      } else {
        socket.emit("request username", gameid);
      }
    });

    socket.on("give userName", (socketId) => {
      if (socket.id !== socketId) {
        console.log("give userName stage: " + props.myUserName);
        socket.emit("recieved userName", {
          userName: props.myUserName,
          gameId: gameid,
        });
      }
    });

    socket.on("get Opponent UserName", (data) => {
      if (socket.id !== data.socketId) {
        setUserName(data.userName);
        console.log("data.socketId: data.socketId");
        setOpponentSocketId(data.socketId);
        didJoinGame(true);
      }
    });
  }, []);

  return (
    <React.Fragment>
      {opponentDidJoinTheGame ? (
        <div>
          <h4> Opponent: {opponentUserName} </h4>
          <div style={{ display: "flex" }}>
            <Canvas gameId={gameid} player={player.didRedirect} />
            <VideoChatApp
              mySocketId={socket.id}
              opponentSocketId={opponentSocketId}
              myUserName={props.myUserName}
              opponentUserName={opponentUserName}
            />
          </div>
          <h4> You: {props.myUserName} </h4>
        </div>
      ) : gameSessionDoesNotExist ? (
        <div>
          <h1 style={{ textAlign: "center", marginTop: "200px" }}> :( </h1>
        </div>
      ) : (
        <div>
          <h1
            style={{
              textAlign: "center",
              marginTop: String(window.innerHeight / 8) + "px",
            }}
          >
            Hey <strong>{props.myUserName}</strong>, copy and paste the URL
            below to send to your friend:
          </h1>
          <textarea
            style={{
              marginLeft: String(window.innerWidth / 2 - 290) + "px",
              marginTop: "30" + "px",
              width: "580px",
              height: "30px",
            }}
            onFocus={(event) => {
              console.log("sd");
              event.target.select();
            }}
            value={domainName + "/game/" + gameid}
            type="text"
          ></textarea>
          <br></br>

          <h1 style={{ textAlign: "center", marginTop: "100px" }}>
            {" "}
            Waiting for other opponent to join the game...{" "}
          </h1>
        </div>
      )}
    </React.Fragment>
  );
};

export default GameWrapper;
