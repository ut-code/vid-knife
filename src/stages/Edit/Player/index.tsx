import { styled } from "@mui/material";
import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { throttle } from "throttle-debounce";
import { isPlayingState, selectionState, videoUrlState } from "../store";

const Root = styled("div")({
  position: "relative",
  overflow: "hidden",
});

const Video = styled("video")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
});

function Player() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = useRecoilValue(videoUrlState);
  const [selection, setSelection] = useRecoilState(selectionState);
  const isPlaying = useRecoilValue(isPlayingState);

  useEffect(() => {
    let isCleanedUp = false;
    const player = videoRef.current;
    if (!player || !isPlaying) return undefined;
    const next = () => {
      if (isCleanedUp) return;
      setSelection(
        (previous) =>
          ({
            primaryMs: Math.round(player.currentTime * 1000),
            secondaryMs: null,
          } ?? previous)
      );
      requestAnimationFrame(next);
    };
    next();
    return () => {
      isCleanedUp = true;
    };
  }, [isPlaying, setSelection]);

  const throttledCall = useRef(
    throttle<(f: () => void) => void>(300, (f) => f())
  );
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying) return;
    throttledCall.current(() => {
      video.currentTime = selection.primaryMs / 1000;
    });
  }, [isPlaying, selection.primaryMs]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.play();
    else videoRef.current.pause();
  }, [isPlaying]);

  return (
    <Root>
      <Video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={(e) => {
          if (isPlaying)
            setSelection({
              primaryMs: Math.round(e.currentTarget.currentTime * 1000),
              secondaryMs: null,
            });
        }}
      />
    </Root>
  );
}

export default Player;
