import React, { useEffect, useState } from "react";
import "./App.css";
import { Box } from "@mui/material";
import { GameBoardGrid } from "./GameBoardGrid";

function App() {
  return (
    <Box>
      <GameBoardGrid />
    </Box>
  );
}

export default App;
