import { CircularProgress, styled } from "@mui/material";
import { Suspense } from "react";
import Timeline from "./Timeline";
import Toolbar from "./Toolbar";
import Player from "./Player";

const Root = styled("div")({
  display: "grid",
  gridTemplateRows: "1fr max-content 100px",
});

const TimelineFallback = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

function EditStage() {
  return (
    <Root>
      <Player />
      <Toolbar />
      <Suspense
        fallback={
          <TimelineFallback>
            <CircularProgress />
          </TimelineFallback>
        }
      >
        <Timeline />
      </Suspense>
    </Root>
  );
}

export default EditStage;
