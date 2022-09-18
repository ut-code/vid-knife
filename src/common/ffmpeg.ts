import { createFFmpeg } from "@ffmpeg/ffmpeg";

async function createFFmpegInstance() {
  const ffmpeg = createFFmpeg({
    log: true,
    /**
     * Because @ffmpeg/ffmpeg automatically seeks `ffmpeg-core.worker.js` and `ffmpeg-core.wasm` in the same directory of `corePath`, we cannot use Vite's static asset bundling feature.
     * This behavior can be overwritten by `workerPath` and `wasmPath` properties, but they are available only after @ffmpeg/core@11, which has some critical bugs.
     * @see https://github.com/ffmpegwasm/ffmpeg.wasm/pull/375
     * Currently @ffmpeg/core is copied into the output directory by [vite-plugin-static-copy plugin](https://www.npmjs.com/package/vite-plugin-static-copy)
     */
    corePath: "/ffmpeg/ffmpeg-core.js",
  });
  await ffmpeg.load();
  return ffmpeg;
}

const inputFileName = "input";
const demuxerFileName = "demuxer";
const outputFileName = "output";

export type VideoMetadata = {
  lengthMs: number;
};

export async function getVideoMetadata(video: Blob): Promise<VideoMetadata> {
  const ffmpeg = await createFFmpegInstance();
  await ffmpeg.FS(
    "writeFile",
    inputFileName,
    new Uint8Array(await video.arrayBuffer())
  );

  let lengthMs = NaN;
  ffmpeg.setLogger((log) => {
    const match = log.message.match(
      /Duration: (?<hour>\d\d):(?<min>\d\d):(?<sec>\d\d).(?<ms10>\d\d)/
    );
    const { hour, min, sec, ms10 } = match?.groups ?? {};
    if (hour && min && sec && ms10)
      lengthMs =
        parseInt(hour, 10) * 3600_000 +
        parseInt(min, 10) * 60_000 +
        parseInt(sec, 10) * 1000 +
        parseInt(ms10, 10) * 10;
  });
  await ffmpeg.run("-i", inputFileName);
  if (Number.isNaN(lengthMs)) throw new Error("Unsupported video format");
  return { lengthMs };
}

export type ProcessVideoOptions = {
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
};

export async function processVideo(
  video: Blob,
  sortedInOutPointMss: number[],
  options?: ProcessVideoOptions
): Promise<Blob> {
  const { onProgress, signal } = options ?? {};

  const ffmpeg = await createFFmpegInstance();
  if (onProgress) ffmpeg.setProgress(({ ratio }) => onProgress(ratio));
  signal?.addEventListener("abort", () => {
    ffmpeg.exit();
  });

  await ffmpeg.FS(
    "writeFile",
    inputFileName,
    new Uint8Array(await video.arrayBuffer())
  );

  const fragments: { start: number | null; end: number | null }[] = [];
  for (const [i, ms] of sortedInOutPointMss.entries()) {
    if (i % 2) {
      fragments.push({ start: ms, end: null });
    } else {
      const lastFragment = fragments.pop() ?? { start: null, end: null };
      lastFragment.end = ms;
      fragments.push(lastFragment);
    }
  }

  /** @see https://ffmpeg.org/ffmpeg-formats.html#concat */
  let demuxerFileContent = "";
  for (const fragment of fragments) {
    demuxerFileContent += `file ${inputFileName}\n`;
    if (fragment.start !== null)
      demuxerFileContent += `inpoint ${fragment.start / 1000}\n`;
    if (fragment.end !== null)
      demuxerFileContent += `outpoint ${fragment.end / 1000}\n`;
  }
  await ffmpeg.FS(
    "writeFile",
    demuxerFileName,
    new TextEncoder().encode(demuxerFileContent)
  );

  await ffmpeg.run(
    "-f",
    "concat",
    "-i",
    demuxerFileName,
    "-f",
    "mp4",
    outputFileName
  );

  return new Blob([ffmpeg.FS("readFile", outputFileName)]);
}
