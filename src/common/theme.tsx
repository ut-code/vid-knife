import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  PaletteMode,
} from "@mui/material";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToggleColorModeContext = createContext<(() => void) | null>(null);

const createCustomTheme = (colorMode: PaletteMode) =>
  createTheme({
    palette: {
      mode: colorMode,
      primary: { main: "#00d372" },
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          variant: "outlined",
          elevation: 0,
          color: "default",
        },
        styleOverrides: {
          root: {
            borderStyle: "none",
            borderBottomStyle: "solid",
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiButton: {
        defaultProps: {
          color: "inherit",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
    },
  });

export default function ThemeProvider({
  children,
}: PropsWithChildren<Record<string, unknown>>) {
  const [colorMode, setColorMode] = useState<PaletteMode>("light");
  const toggleColorMode = useCallback(() => {
    setColorMode(
      (previous) => (({ light: "dark", dark: "light" } as const)[previous])
    );
  }, []);
  const theme = useMemo(() => createCustomTheme(colorMode), [colorMode]);

  return (
    <ToggleColorModeContext.Provider value={toggleColorMode}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ToggleColorModeContext.Provider>
  );
}

export function useToggleColorMode() {
  const toggleColorMode = useContext(ToggleColorModeContext);
  if (!toggleColorMode) throw new Error();
  return toggleColorMode;
}
