import {
  Button,
  LinearProgress,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import useVideoProcessor from "./store";

const Root = styled("div")(({ theme }) => ({
  padding: theme.spacing(4),
}));

function ExportStage() {
  const { isStarted, progress, startDownload } = useVideoProcessor();
  const percentage = progress * 100;

  return (
    <Root>
      <Typography variant="h3" paragraph>
        Export
      </Typography>
      <Typography paragraph>See the Console to watch the progress.</Typography>
      <Stack direction="row" gap={2}>
        <Button variant="outlined" disabled={isStarted} onClick={startDownload}>
          Start
        </Button>
      </Stack>
      {isStarted && (
        <>
          <LinearProgress
            sx={{ mt: 4 }}
            variant="determinate"
            value={percentage}
          />
          <Typography sx={{ mt: 1 }} color="textSecondary" align="center">
            Exporting: {percentage.toFixed(2)}%
          </Typography>
        </>
      )}
    </Root>
  );
}

export default ExportStage;
