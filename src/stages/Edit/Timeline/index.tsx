import { styled } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { formatMs } from "../../../common/utils";
import { isPlayingState, selectionState, videoMetadataState } from "../store";
import { sortedInOutPointMssState } from "../../../store";

const timelinePaddingX = 50;
const rulerHeight = 25;
const rulerMinTickIntervalWidth = 80;
const rulerTickIntervalMsCandidates = [
  100,
  200,
  500,
  1000,
  1000 * 2,
  1000 * 5,
  1000 * 10,
  1000 * 15,
  1000 * 20,
  1000 * 30,
  1000 * 40,
  1000 * 60 * 1,
  1000 * 60 * 2,
  1000 * 60 * 5,
  1000 * 60 * 10,
  1000 * 60 * 15,
  1000 * 60 * 20,
  1000 * 60 * 30,
  1000 * 60 * 40,
  1000 * 60 * 60,
];

const Root = styled("div")(({ theme }) => ({
  overflowX: "scroll",
  userSelect: "none",
  "&::-webkit-scrollbar": {
    height: "10px",
  },
  "&::-webkit-scrollbar-track": {
    border: `solid ${theme.palette.divider}`,
    borderWidth: "1px 0 0 0",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.text.secondary,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.text.primary,
  },
}));

const Content = styled("div")({
  display: "grid",
  gridTemplateRows: "max-content 1fr",
  position: "relative",
  height: "100%",
});

const Ruler = styled("div")(({ theme }) => ({
  height: `${rulerHeight}px`,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  borderWidth: "1px 0",
}));

const RulerTicks = styled("svg")(({ theme }) => ({
  display: "block",
  color: theme.palette.text.secondary,
}));

const Main = styled("div")({
  position: "relative",
});

const Duration = styled("div")({
  position: "absolute",
  top: 0,
  height: "100%",
  opacity: 0.5,
});

const LiveDuration = styled(Duration)({
  backgroundColor: "#afa",
});

const DeadDuration = styled(Duration)({
  backgroundColor: "#faf",
});

const Cursor = styled("div")<{ variant: "primary" | "secondary"; x: number }>(
  ({ theme, variant, x }) => {
    const widthPx = { primary: 2, secondary: 1 }[variant];
    return {
      position: "absolute",
      top: 0,
      width: `${widthPx}px`,
      height: "100%",
      transform: `translateX(${x - widthPx / 2}px)`,
      backgroundColor: {
        primary: theme.palette.text.primary,
        secondary: theme.palette.text.secondary,
      }[variant],
    };
  }
);

const Selection = styled("div")<{ x1: number; x2: number }>(
  ({ theme, x1, x2 }) => ({
    position: "absolute",
    top: 0,
    left: `${Math.min(x1, x2)}px`,
    width: `${Math.abs(x1 - x2)}px`,
    height: "100%",
    backgroundColor: theme.palette.text.primary,
    opacity: 0.2,
  })
);

function Timeline() {
  const { lengthMs: videoLengthMs } = useRecoilValue(videoMetadataState);
  const [selection, setSelection] = useRecoilState(selectionState);
  const setIsPlaying = useSetRecoilState(isPlayingState);
  const sortedInOutPointMss = useRecoilValue(sortedInOutPointMssState);
  const [timelineWidth, setTimelineWidth] = useState(
    document.documentElement.clientWidth
  );
  const [cursorTimeMs, setCursorTimeMs] = useState<number | null>(null);
  const analysis = useMemo(() => {
    const timelineContentWidth = timelineWidth - timelinePaddingX * 2;
    const msWidth = timelineContentWidth / videoLengthMs;
    const rulerTickIntervalMs = rulerTickIntervalMsCandidates.find(
      (c) => msWidth * c >= rulerMinTickIntervalWidth
    );
    if (!rulerTickIntervalMs) throw new Error("Input video is too long");
    const rulerTicks: { x: number; ms: number }[] = [];
    for (let ms = 0; ms < videoLengthMs; ms += rulerTickIntervalMs) {
      rulerTicks.push({ x: timelinePaddingX + msWidth * ms, ms });
    }
    const durationToWidth = (ms: number) => ms * msWidth;
    const widthToDuration = (width: number) => width / msWidth;
    const timestampToX = (ms: number) => timelinePaddingX + durationToWidth(ms);
    const xToTimestamp = (x: number) => widthToDuration(x - timelinePaddingX);
    return {
      timelineContentWidth,
      rulerMsWidth: msWidth,
      rulerTickIntervalMs,
      rulerTicks,
      durationToWidth,
      widthToDuration,
      timestampToX,
      xToTimestamp,
    };
  }, [timelineWidth, videoLengthMs]);

  return (
    <Root
      onWheel={(e) => {
        if (e.ctrlKey) {
          setTimelineWidth((previous) =>
            Math.max(
              previous * 1.001 ** -e.deltaY,
              Math.min(document.documentElement.clientWidth, previous)
            )
          );
        }
      }}
    >
      <Content
        style={{ minWidth: `${timelineWidth}px` }}
        onMouseDown={(e) => {
          const timeMs = analysis.xToTimestamp(e.clientX);
          if (timeMs >= 0) {
            setIsPlaying(false);
            setSelection({ primaryMs: timeMs, secondaryMs: null });
          }
        }}
        onMouseMove={(e) => {
          const timeMs = analysis.xToTimestamp(e.clientX);
          if (timeMs >= 0) {
            // eslint-disable-next-line no-bitwise
            if (e.buttons & 1) {
              setSelection((previous) => ({
                primaryMs: timeMs,
                secondaryMs:
                  previous.secondaryMs === null
                    ? previous.primaryMs
                    : previous.secondaryMs,
              }));
            } else {
              setCursorTimeMs(timeMs);
            }
            return;
          }
          setCursorTimeMs(null);
        }}
        onMouseOut={() => {
          setCursorTimeMs(null);
        }}
      >
        <Ruler>
          <RulerTicks
            viewBox={`0,0,${timelineWidth},${rulerHeight}`}
            style={{ height: `${rulerHeight}px` }}
          >
            {analysis.rulerTicks.map((tick) => (
              <Fragment key={tick.ms}>
                <text
                  x={tick.x}
                  y={rulerHeight - 10}
                  fill="currentColor"
                  textAnchor="middle"
                  fontSize={rulerHeight / 2}
                >
                  {formatMs(tick.ms)}
                </text>
                <line
                  x1={tick.x}
                  y1={rulerHeight - 5}
                  x2={tick.x}
                  y2={rulerHeight}
                  stroke="currentColor"
                />
              </Fragment>
            ))}
          </RulerTicks>
        </Ruler>
        <Main>
          {[...sortedInOutPointMss, videoLengthMs].map((inOutPointMs, i) => {
            if (inOutPointMs === 0) return null;
            const DurationComponent = i % 2 === 0 ? LiveDuration : DeadDuration;
            const previousMs = sortedInOutPointMss[i - 1] ?? 0;
            const durationMs = inOutPointMs - previousMs;
            return (
              <DurationComponent
                key={inOutPointMs}
                style={{
                  left: `${analysis.timestampToX(previousMs)}px`,
                  width: `${analysis.durationToWidth(durationMs)}px`,
                }}
              />
            );
          })}
        </Main>
        <Cursor
          variant="primary"
          x={analysis.timestampToX(selection.primaryMs)}
        />
        {selection["secondaryMs"] !== null && (
          <>
            <Cursor
              variant="primary"
              x={analysis.timestampToX(selection.secondaryMs)}
            />
            <Selection
              x1={analysis.timestampToX(selection.primaryMs)}
              x2={analysis.timestampToX(selection.secondaryMs)}
            />
          </>
        )}
        {cursorTimeMs !== null && (
          <Cursor variant="secondary" x={analysis.timestampToX(cursorTimeMs)} />
        )}
      </Content>
    </Root>
  );
}

export default Timeline;
