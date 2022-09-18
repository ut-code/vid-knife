import { useRecoilCallback } from "recoil";
import download from "js-file-download";
import { useState } from "react";
import { processVideo } from "../../common/ffmpeg";
import { requiredVideoState, sortedInOutPointMssState } from "../../store";

export default function useVideoProcessor() {
  const [isStarted, setIsStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const startDownload = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const video = await snapshot.getPromise(requiredVideoState);
        const inOutPointMss = await snapshot.getPromise(
          sortedInOutPointMssState
        );
        setIsStarted(true);
        const convertedVideo = await processVideo(video, inOutPointMss, {
          onProgress(ratio) {
            setProgress(ratio);
          },
        });
        download(convertedVideo, "video.mp4");
      },
    []
  );
  return { isStarted, progress, startDownload };
}
