import { atom, selector } from "recoil";

export const appStageState = atom({
  key: "root/appStage",
  default: "select" as "select" | "edit" | "export",
});

export const videoState = atom<Blob | null>({
  key: "root/video",
  default: null,
});

export const requiredVideoState = selector<Blob>({
  key: "root/requiredVideo",
  get({ get }) {
    const video = get(videoState);
    if (!video) throw new Error("Invalid precondition");
    return video;
  },
});

export const sortedInOutPointMssState = atom<number[]>({
  key: "root/sortedInOutPointMss",
  default: [],
});
