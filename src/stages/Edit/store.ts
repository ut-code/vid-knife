import { atom, selector } from "recoil";
import { getVideoMetadata } from "../../common/ffmpeg";
import { safeCreateObjectUrl } from "../../common/utils";
import { requiredVideoState } from "../../store";

export const isPlayingState = atom({
  key: "edit/isPlaying",
  default: false,
});

export type SelectionState = {
  primaryMs: number;
  secondaryMs: number | null;
};
export const selectionState = atom<SelectionState>({
  key: "edit/selection",
  default: { primaryMs: 0, secondaryMs: null },
});

export const videoUrlState = selector({
  key: "edit/videoUrl",
  get({ get }) {
    const video = get(requiredVideoState);
    return safeCreateObjectUrl(video);
  },
});

export const videoMetadataState = selector({
  key: "edit/videoMetadata",
  get({ get }) {
    const video = get(requiredVideoState);
    return getVideoMetadata(video);
  },
});
