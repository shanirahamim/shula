import { CellStates } from "./enums/CellStates";
import React, { useEffect, useState } from "react";
import { GameStates } from "./enums/GameStates";
import { DIRECTIONS } from "./common/DIRECTIONS";
import { Button, Grid, Typography } from "@mui/material";
import { generateUniqueRandomPositions } from "./common/RandomHelper";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import CircleIcon from "@mui/icons-material/Circle";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";

function initializeBoard(matrixSize: number) {
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
  const [matrixSize, setMatrixSize] = useState(10); //

  const { newBombs, newBoardMatrix, calcProxMatrix } =
    initializeBoard(matrixSize);
  const [matrix, setMatrix] = useState(newBoardMatrix);

  const [proxMatrix, setProxMatrix] = useState(calcProxMatrix);

  const [bombs, setBombs] = useState(newBombs);

  const [gameState, setGameState] = useState(GameStates.WIP);

  const [toRevealCellCount, setToRevealCellCount] = useState("?");

  function calcLeftToRevealCellCount(revealedCount: number) {
    const totalRevealCells = matrixSize * matrixSize - bombs.length;

    return totalRevealCells - revealedCount;
  }

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
    const toRevealCellCountNew = calcLeftToRevealCellCount(revealedCount);
    if (toRevealCellCountNew === 0) {
      setGameState(GameStates.SUCCESS);
    }

    setToRevealCellCount(toRevealCellCountNew.toString());
  }, [proxMatrix, bombs, matrixSize]);

  function restart() {
    const { newBombs, newBoardMatrix, calcProxMatrix } =
      initializeBoard(matrixSize);

    setGameState(GameStates.WIP);
    setMatrix(newBoardMatrix);
    setProxMatrix(calcProxMatrix);
    setBombs(newBombs);
  }
  function scan(row: any, col: any) {
    if (gameState !== GameStates.WIP) {
      return;
    }
    // scanning tree using direction vector
    const stack = [[row, col]]; // init with current location

    let currLocation: number[];

    let currentValue;

    let totalBombsAround = 0;

    const totalRounds = 10;
    let rounds = 0;

    let calcProxMatrix = [];

    for (let row = 0; row < matrixSize; row++) {
      calcProxMatrix[row] = [...proxMatrix[row]];
    }

    while (stack.length && rounds < totalRounds) {
      currLocation = stack.shift() as number[];

      if (
        currLocation?.length &&
        currLocation[0] >= 0 &&
        currLocation[1] < matrixSize &&
        calcProxMatrix[currLocation[0]][currLocation[1]] === -1
      ) {
        currentValue = matrix[currLocation[0]][currLocation[1]];

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
      {gameState === GameStates.WIP && (
        <div>
          <Typography variant={"h5"}>
            Lets Play!
            <SentimentSatisfiedAltIcon />({toRevealCellCount} empty cells left
            to reveal)
          </Typography>
        </div>
      )}
      {gameState === GameStates.SUCCESS && (
        <div>
          YAY! <TagFacesIcon />
        </div>
      )}
      {gameState === GameStates.FAILED && (
        <div>
          BOOM!!
          <MoodBadIcon />
        </div>
      )}
      <Button
        onClick={() => {
          restart();
        }}
      >
        RETRY
      </Button>
      <Grid container direction="row">
        {matrix.map((row, rowNum) => (
          <Grid container spacing={3} key={rowNum}>
            {row.map((col: any, colNum: any) => (
              <Grid
                item
                key={colNum}
                onClick={() => {
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
                  {col === CellStates.BOMB && gameState !== GameStates.WIP && (
                    <CircleIcon />
                  )}
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
    </div>
  );
}
