import { Box, Typography, Collapse, ButtonBase } from "@mui/material";
import { FC, useState } from "react";
import { localStorageHandlers } from "../utils/localStorage/localStorageSchema";
import ExpandLessIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/KeyboardArrowDown";

interface CollapseCardProps {
  /** カードのタイトル */
  title: string;
  /** カードのストレージキー */
  storageKey: string;
  /** カードの子要素 */
  children: React.ReactNode;
}

export const CollapseCard: FC<CollapseCardProps> = ({
  title,
  children,
  storageKey,
}) => {
  const store = localStorageHandlers.panelCollapse;
  const initial = store.getValue()[storageKey] ?? false;
  const [collapsed, setCollapsed] = useState(initial);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      const map = store.getValue();
      store.setValue({ ...map, [storageKey]: next });
      return next;
    });
  };

  return (
    <Box>
      <ButtonBase
        onClick={toggle}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          py: 0.5,
          px: 1,
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </ButtonBase>
      <Collapse in={!collapsed} timeout="auto" unmountOnExit sx={{ pb: 1 }}>
        <Box sx={{ p: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
};
