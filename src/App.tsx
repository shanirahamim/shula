import React from "react";
import "./App.css";
import { Box, Grid, Typography } from "@mui/material";
import { GameBoardGrid } from "./GameBoardGrid";

function App() {
  return (
    <Box>
      <Grid container>
        <Grid item>
          <Typography variant={"h4"}>"SHULA"</Typography>
        </Grid>
      </Grid>
      <GameBoardGrid />
    </Box>
  );
}

export default App;
