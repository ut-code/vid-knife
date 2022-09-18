import { styled, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useSetRecoilState } from "recoil";
import { appStageState, videoState } from "../../store";

const Root = styled("div")(({ theme }) => ({
  padding: theme.spacing(4),
}));

export default function SelectStage() {
  const setAppStageState = useSetRecoilState(appStageState);
  const setVideoState = useSetRecoilState(videoState);
  const dropzone = useDropzone({
    multiple: false,
    accept: { "video/mp4": [".mp4"] },
    onDropAccepted(files) {
      const file = files[0];
      if (!file) throw new Error("No file specified");
      setVideoState(file);
      setAppStageState("edit");
    },
  });

  return (
    <Root
      {...dropzone.getRootProps()}
      sx={{
        backgroundColor: dropzone.isDragActive ? "action.selected" : undefined,
      }}
    >
      <input {...dropzone.getInputProps()} />
      <Typography variant="h3" paragraph>
        Select
      </Typography>
      <Typography>
        Drag and drop your video file or click here to start editing. Currently
        only video/mp4 files are supported.
      </Typography>
    </Root>
  );
}
