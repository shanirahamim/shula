import React from "react";
import "./App.css";
import { Box, Grid, styled, Typography } from "@mui/material";
import { GameBoardGrid } from "./ShulaGame/GameBoardGrid";

const GameContainerGrid = styled(Grid)`
  background: lightblue;
  width: 80%;
  border: 10px solid black;
  position: absolute;
  height: 96%;
  top: 2%;
  left: 10%;
`;
function App() {
  return (
    <Box>
      <GameContainerGrid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <Typography variant={"h4"}>"SHULA"</Typography>
        </Grid>
        <GameBoardGrid />
      </GameContainerGrid>
    </Box>
  );
}

export default App;
