import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button, Grid } from "@mui/material";

enum CellStates {
  CLEAR = 0,
  BOMB = 1,
  VISIBLE = 2,
}

enum GameStates {
  WIP = 0,
  FAILED = 1, 
  SUCCESS = 2
}

function MainGrid() {
  const matrixSize = 5;

  // choose bombs locations on startup

  const bombs = [[0,1], [0,3], [1,4], [2,3]];
  /*const bombs = [
    [0, 1],
    [0, 0],
  ];*/

  const tmpMatrix = new Array(matrixSize);
  const calcProxMatrix = new Array(matrixSize);

  for (let row = 0; row < matrixSize; row++) {
    tmpMatrix[row] = new Array(matrixSize).fill(CellStates.CLEAR);

    calcProxMatrix[row] = new Array(matrixSize).fill(-1);
    // todo:  // place bombs on matrix from here to save performence
  }

  bombs.forEach((bombLocation) => {
    tmpMatrix[bombLocation[0]][bombLocation[1]] = CellStates.BOMB;
  });

  const [matrix, setMatrix] = useState(tmpMatrix);

  const [proxMatrix, setProxMatrix] = useState(calcProxMatrix);

  const [gameState, setGameState] = useState(GameStates.WIP);

  useEffect(()=> {

    let revealedCount = 0;
    // todo: check if won
    for(let rowNum =0; rowNum < matrixSize; rowNum++){
      for(let colNum =0; colNum < matrixSize; colNum++){
        
        if(proxMatrix[rowNum][colNum] !== -1){
          revealedCount = revealedCount + 1
        } 
      }
    }
    console.log("total revealed:", revealedCount);
    if(revealedCount === matrixSize * matrixSize -bombs.length ){
      console.log("WON!");
      setGameState(GameStates.SUCCESS);
    }


  }, [proxMatrix])

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

    while (stack.length && rounds < totalRounds) {
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
            // found nearby cell.
            stack.push([
              direction[0] + currLocation[0],
              direction[1] + currLocation[1],
            ]);

            if (
              matrix[direction[0] + currLocation[0]][
                direction[1] + currLocation[1]
              ] === CellStates.BOMB
            ) {
              totalBombsAround = totalBombsAround + 1;
            }
          }
        });

        calcProxMatrix[currLocation[0]][currLocation[1]] = totalBombsAround;
        console.log( totalBombsAround);

        rounds++;

        console.log(calcProxMatrix);
      }
    }

    setProxMatrix(calcProxMatrix);

    console.log(calcProxMatrix);
  }
  //

  return (
    <div>
       {gameState === GameStates.WIP && <Grid container direction="row">
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
                      proxMatrix[rowNum][colNum] === -1 ? "darkgray" : "lightgray",
                      height : "50px",
                      width : "50px"
                  }}
                >
                
                  {col === CellStates.BOMB && proxMatrix[rowNum][colNum] !== -1 && <div>B</div>}
                  <div>{proxMatrix[rowNum][colNum] !== -1 && proxMatrix[rowNum][colNum] !==0 ?
                   proxMatrix[rowNum][colNum]: ""}</div>
                </Button>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>}
      {gameState === GameStates.SUCCESS && <div>YAY!</div>}
      {gameState === GameStates.FAILED && <div>BOOM!!</div>}
      <Button>RETRY</Button>
    </div>
  );
}

function App() {
  return <MainGrid />;
}

export default App;
