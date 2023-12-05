import React, { useEffect, useState } from "react";
import "./App.css";
import { Button, Grid } from "@mui/material";
import { CellStates } from "./enums/CellStates";
import { GameStates } from "./enums/GameStates";

const getRandomRoundNumber = (matrixSize: number) =>
  Math.round(Math.random() * matrixSize);

function generateUniqueRandomPositions(count: number, matrixSize: number) {
  const positionsSet = new Set();

  while (positionsSet.size < count) {
    const position = [
      getRandomRoundNumber(matrixSize),
      getRandomRoundNumber(matrixSize),
    ];
    const positionString = JSON.stringify(position);

    // Check if the position is unique
    if (!positionsSet.has(positionString)) {
      positionsSet.add(positionString);
    }
  }

  // Convert Set back to an array of arrays
  return Array.from(positionsSet).map((pos) => JSON.parse(pos as string));
}

function MainGrid() {
  function initializeBoard() {
    const matrixSize = 10;

    const numberOfBombs = 4;

    //const bombs1 = new Array(numberOfBombs);
    const bombs = generateUniqueRandomPositions(numberOfBombs, matrixSize - 1);
    /* .filter((bomb, index, self) => {
        // Check if the current bomb is unique by comparing it with the previous bombs
        return (
          index ===
          self.findIndex(
            (otherBomb) => bomb[0] === otherBomb[0] && bomb[1] === otherBomb[1],
          )
        );
      });
    // todo make sure they are uniuq
    // choose bombs locations on startup
    /*const bombs = [
      [0, 1],
      [0, 3],
      [1, 4],
      [2, 3],
    ];*/
    /*const bombs = [
      [0, 1],
      [0, 0],
    ];*/

    const newBoardMatrix = new Array(matrixSize);
    const calcProxMatrix = new Array(matrixSize);

    for (let row = 0; row < matrixSize; row++) {
      newBoardMatrix[row] = new Array(matrixSize).fill(CellStates.CLEAR);
      calcProxMatrix[row] = new Array(matrixSize).fill(-1);
    }

    bombs.forEach((bombLocation) => {
      newBoardMatrix[bombLocation[0]][bombLocation[1]] = CellStates.BOMB;
    });
    return { matrixSize, newBombs: bombs, newBoardMatrix, calcProxMatrix };
  }

  const { matrixSize, newBombs, newBoardMatrix, calcProxMatrix } =
    initializeBoard();

  const [matrix, setMatrix] = useState(newBoardMatrix);

  const [proxMatrix, setProxMatrix] = useState(calcProxMatrix);

  const [bombs, setBombs] = useState(newBombs);

  const [gameState, setGameState] = useState(GameStates.WIP);

  useEffect(() => {
    let revealedCount = 0;
    // todo: check if won
    for (let rowNum = 0; rowNum < matrixSize; rowNum++) {
      for (let colNum = 0; colNum < matrixSize; colNum++) {
        if (proxMatrix[rowNum][colNum] !== -1) {
          revealedCount = revealedCount + 1;
        }
      }
    }
    console.log("total revealed:", revealedCount);
    if (revealedCount === matrixSize * matrixSize - bombs.length) {
      console.log("WON!");
      setGameState(GameStates.SUCCESS);
    }
  }, [proxMatrix]);

  function restart() {
    const { matrixSize, newBombs, newBoardMatrix, calcProxMatrix } =
      initializeBoard();

    debugger;
    setGameState(GameStates.WIP);
    setMatrix(newBoardMatrix);
    setProxMatrix(calcProxMatrix);
    setBombs(newBombs);
  }
  function scan(row: any, col: any) {
    // scanning tree using direction vector

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, 0],
      [1, -1],
      [1, 1],
    ];

    const visited = new Array(matrixSize);

    for (let row = 0; row < matrixSize; row++) {
      visited[row] = new Array(matrixSize).fill(-1);
    }

    const stack = [[row, col]]; // init with current location

    let currLocation: number[];

    let currentValue;

    let totalBombsAround = 0;

    const totalRounds = 10;
    let rounds = 0;

    let calcProxMatrix = new Array();

    for (let row = 0; row < matrixSize; row++) {
      calcProxMatrix[row] = [...proxMatrix[row]];
    }

    while (
      stack.length && //) {
      rounds < totalRounds
    ) {
      currLocation = stack.pop() as number[];

      if (
        currLocation?.length &&
        currLocation[0] >= 0 &&
        currLocation[1] < matrixSize &&
        visited[currLocation[0]][currLocation[1]] === -1
      ) {
        currentValue = matrix[currLocation[0]][currLocation[1]];

        visited[currLocation[0]][currLocation[1]] = 1;
        console.log("scan:", currLocation[0], currLocation[1]);

        if (currentValue == CellStates.BOMB) {
          // throw new Error("HIT BOMB!!"); // todo handle state and allow restart
          setGameState(GameStates.FAILED);
        }
        totalBombsAround = 0;
        directions.forEach((direction) => {
          if (
            direction[0] + currLocation[0] >= 0 &&
            direction[0] + currLocation[0] < matrixSize &&
            direction[1] + currLocation[1] >= 0 &&
            direction[1] + currLocation[1] < matrixSize
          ) {
            if (
              matrix[direction[0] + currLocation[0]][
                direction[1] + currLocation[1]
              ] === CellStates.BOMB
            ) {
              totalBombsAround = totalBombsAround + 1;
            } else {
              // found nearby cell.
              stack.push([
                direction[0] + currLocation[0],
                direction[1] + currLocation[1],
              ]);
            }
          }
        });

        calcProxMatrix[currLocation[0]][currLocation[1]] = totalBombsAround;

        rounds++;
      }
    }

    setProxMatrix(calcProxMatrix);

    console.log(calcProxMatrix);
  }
  //

  return (
    <div>
      {gameState === GameStates.WIP && (
        <Grid container direction="row">
          {matrix.map((row, rowNum) => (
            <Grid container spacing={3} key={rowNum}>
              {row.map((col: any, colNum: any) => (
                <Grid
                  item
                  key={colNum}
                  onClick={(e) => {
                    scan(rowNum, colNum);
                  }}
                >
                  <Button
                    style={{
                      background:
                        proxMatrix[rowNum][colNum] === -1
                          ? "darkgray"
                          : "lightgray",
                      height: "50px",
                      width: "50px",
                    }}
                  >
                    {col === CellStates.BOMB && "he"}
                    {col === CellStates.BOMB &&
                      proxMatrix[rowNum][colNum] !== -1 && <div>B</div>}
                    <div>
                      {proxMatrix[rowNum][colNum] !== -1 &&
                      proxMatrix[rowNum][colNum] !== 0
                        ? proxMatrix[rowNum][colNum]
                        : ""}
                    </div>
                  </Button>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      )}
      {gameState === GameStates.SUCCESS && <div>YAY!</div>}
      {gameState === GameStates.FAILED && <div>BOOM!!</div>}
      <Button
        onClick={() => {
          restart();
        }}
      >
        RETRY
      </Button>
    </div>
  );
}

function App() {
  return <MainGrid />;
}

export default App;
