import { styled } from "@mui/material";
import { useRecoilValue } from "recoil";
import SelectStage from "./stages/Select";
import EditStage from "./stages/Edit";
import ExportStage from "./stages/Export";
import AppBar from "./components/AppBar";
import { appStageState } from "./store";

const Root = styled("div")({
  display: "grid",
  width: "100%",
  height: "100%",
  gridTemplateRows: "max-content 1fr",
});

export default function App() {
  const stage = useRecoilValue(appStageState);

  return (
    <Root>
      <AppBar />
      {(() => {
        if (stage === "select") return <SelectStage />;
        if (stage === "edit") return <EditStage />;
        return <ExportStage />;
      })()}
    </Root>
  );
}
