import { CellStates } from "./enums/CellStates";
import React, { useEffect, useState } from "react";
import { GameStates } from "./enums/GameStates";
import { DIRECTIONS } from "./common/DIRECTIONS";
import { Button, Grid } from "@mui/material";
import { generateUniqueRandomPositions } from "./common/RandomHelper";

function initializeBoard() {
  const matrixSize = 10;

  const numberOfBombs = 4;

  const bombs = generateUniqueRandomPositions(numberOfBombs, matrixSize - 1);

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

export function GameBoardGrid() {
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
    if (revealedCount === matrixSize * matrixSize - bombs.length) {
      setGameState(GameStates.SUCCESS);
    }
  }, [proxMatrix]);

  function restart() {
    const { newBombs, newBoardMatrix, calcProxMatrix } = initializeBoard();

    setGameState(GameStates.WIP);
    setMatrix(newBoardMatrix);
    setProxMatrix(calcProxMatrix);
    setBombs(newBombs);
  }
  function scan(row: any, col: any) {
    if (gameState === GameStates.FAILED) {
      return;
    }
    // scanning tree using direction vector
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

    while (stack.length && rounds < totalRounds) {
      currLocation = stack.shift() as number[];

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
          setGameState(GameStates.FAILED);
        }
        totalBombsAround = 0;
        DIRECTIONS.forEach((direction) => {
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
  }
  //

  return (
    <div>
      {(gameState === GameStates.WIP || gameState === GameStates.FAILED) && (
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
                    {col === CellStates.BOMB &&
                      gameState === GameStates.FAILED &&
                      "B"}
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
