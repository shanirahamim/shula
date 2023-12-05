import { GameStates } from "../enums/GameStates";
import { Button, Grid, Typography } from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import React from "react";

export function GameControl(props: {
  gameState: GameStates;
  toRevealCellCount: string;
  restart: () => void;
}) {
  return (
    <Grid
      item
      container
      direction="row"
      justifyContent="space-around"
      alignItems="center"
    >
      {props.gameState === GameStates.WIP && (
        <Grid item>
          <Typography variant={"h5"}>
            Lets Play!
            <SentimentSatisfiedAltIcon />({props.toRevealCellCount} empty cells
            left to reveal)
          </Typography>
        </Grid>
      )}
      {props.gameState === GameStates.SUCCESS && (
        <Grid item>
          <Typography variant={"h5"}>
            YAY! <TagFacesIcon />
          </Typography>
        </Grid>
      )}
      {props.gameState === GameStates.FAILED && (
        <Grid item>
          <Typography variant={"h5"}>
            BOOM!!
            <MoodBadIcon />
          </Typography>
        </Grid>
      )}
      <Grid item>
        <Button onClick={props.restart}>RETRY</Button>
      </Grid>
    </Grid>
  );
}
