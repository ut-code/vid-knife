import { Button, Divider, styled, SxProps } from "@mui/material";
import {
  Pause as PauseIcon,
  Play as PlayIcon,
  ArrowRight as ArrowRightIcon,
  ArrowCollapseLeft as ArrowCollapseLeftIcon,
  ArrowCollapseRight as ArrowCollapseRightIcon,
  VectorSquarePlus as VectorSquarePlusIcon,
  VectorSquareRemove as VectorSquareRemoveIcon,
  Export as ExportIcon,
} from "mdi-material-ui";
import { useRecoilCallback, useRecoilState, useSetRecoilState } from "recoil";
import { formatMs } from "../../../common/utils";
import { appStageState, sortedInOutPointMssState } from "../../../store";
import { isPlayingState, selectionState } from "../store";

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  border: `1px solid ${theme.palette.divider}`,
  borderStyle: "solid none none none",
}));

const Clock = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
  color: theme.palette.text.secondary,
  fontSize: theme.typography.button.fontSize,
}));

const ToolbarButton = styled(Button)(({ theme }) => ({
  gap: theme.spacing(1),
  borderRadius: 0,
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
}));

const iconSx: SxProps = {
  fontSize: "body1.fontSize",
  color: "text.secondary",
};

export default function Toolbar() {
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [selection, setSelection] = useRecoilState(selectionState);
  const editBySelection = useRecoilCallback(
    ({ snapshot, set }) =>
      async (mode: "include" | "exclude") => {
        const { primaryMs, secondaryMs } = await snapshot.getPromise(
          selectionState
        );
        if (secondaryMs === null) return;
        const selectionStartMs = Math.min(primaryMs, secondaryMs);
        const selectionEndMs = Math.max(primaryMs, secondaryMs);
        set(sortedInOutPointMssState, (previousMss) => {
          const maxIndexBeforeSelectionStart = previousMss.reduce(
            (maxI, ms, i) => (ms < selectionStartMs ? i : maxI),
            -1
          );
          const maxIndexBeforeSelectionEnd = previousMss.reduce(
            (maxI, ms, i) => (ms <= selectionEndMs ? i : maxI),
            -1
          );
          const nextMss = previousMss.filter(
            (ms) => ms < selectionStartMs || selectionEndMs < ms
          );
          const mod = { include: 0, exclude: 1 }[mode];
          if ((maxIndexBeforeSelectionStart + 2) % 2 === mod) {
            nextMss.push(selectionStartMs);
          }
          if ((maxIndexBeforeSelectionEnd + 2) % 2 === mod) {
            nextMss.push(selectionEndMs);
          }
          return nextMss.sort((a, b) => a - b);
        });
      }
  );
  const setAppStage = useSetRecoilState(appStageState);

  return (
    <Root>
      <Clock>
        {selection.secondaryMs !== null && (
          <>
            <span>{formatMs(selection.secondaryMs)}</span>
            <ArrowRightIcon sx={iconSx} />
          </>
        )}
        <span>{formatMs(selection.primaryMs)}</span>
      </Clock>
      <Divider orientation="vertical" />
      <ToolbarButton
        onClick={() => {
          setIsPlaying(false);
          setSelection({ primaryMs: 0, secondaryMs: null });
        }}
      >
        <ArrowCollapseLeftIcon sx={iconSx} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          setIsPlaying(!isPlaying);
        }}
      >
        {isPlaying ? <PauseIcon sx={iconSx} /> : <PlayIcon sx={iconSx} />}
      </ToolbarButton>
      <ToolbarButton>
        <ArrowCollapseRightIcon sx={iconSx} />
      </ToolbarButton>
      {selection.secondaryMs !== null && (
        <>
          <Divider orientation="vertical" />
          <ToolbarButton
            onClick={() => {
              editBySelection("include");
            }}
          >
            <VectorSquarePlusIcon sx={iconSx} /> Include
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              editBySelection("exclude");
            }}
          >
            <VectorSquareRemoveIcon sx={iconSx} /> Exclude
          </ToolbarButton>
        </>
      )}
      <Divider orientation="vertical" />
      <ToolbarButton
        onClick={() => {
          setAppStage("export");
        }}
      >
        <ExportIcon sx={iconSx} /> Export
      </ToolbarButton>
    </Root>
  );
}
