import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
} from "@mui/material";
import { Brightness6 as Brightness6Icon } from "mdi-material-ui";
import { useToggleColorMode } from "../../common/theme";

function AppBar() {
  const toggleColorMode = useToggleColorMode();

  return (
    <MuiAppBar position="static">
      <Toolbar variant="dense">
        <Typography sx={{ flexGrow: 1 }}>VidKnife</Typography>
        <IconButton
          aria-label="toggle color mode"
          edge="end"
          sx={{ ml: 2 }}
          onClick={toggleColorMode}
        >
          <Brightness6Icon />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
}

export default AppBar;
