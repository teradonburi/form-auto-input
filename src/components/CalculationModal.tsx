import { FC } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Stats } from "../types/stats";
import { useTranslation } from "react-i18next";

interface CalculationModalProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
}

export const CalculationModal: FC<CalculationModalProps> = ({
  open,
  onClose,
  stats,
}) => {
  const { t } = useTranslation();

  // Derived intermediate values for explanation
  const dailyExpected = stats.totalWorkDays
    ? stats.scheduledHours / stats.totalWorkDays
    : 0;
  const expectedUntilNow = dailyExpected * stats.completedWorkDays;
  const overtimeLimitMonthly = 45; // h
  const maxAllowed = stats.scheduledHours + overtimeLimitMonthly;

  const num = (v: number) => v.toFixed(2);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slots={{ transition: Slide }}
      slotProps={{ transition: { direction: "up" } }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {t("calcBasis")}
          </Typography>
        </Toolbar>
      </AppBar>

      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Overview */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("details")}
          </Typography>
          <Stack
            spacing={0.5}
            divider={<Divider flexItem />}
            sx={{ fontFamily: "monospace" }}
          >
            <Typography variant="body2">
              {t("monthlyScheduledHours")}: {num(stats.scheduledHours)} h
            </Typography>
            <Typography variant="body2">
              {t("monthlyWorkedHours")}: {num(stats.totalWorkedHours)} h
            </Typography>
          </Stack>
        </Paper>

        {/* Flex balance formula */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("calcFlex")}
          </Typography>
          <Stack spacing={0.5} sx={{ fontFamily: "monospace" }}>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("dailyExpectedFormula", {
                sh: num(stats.scheduledHours),
                days: stats.totalWorkDays,
                daily: num(dailyExpected),
              })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("expectedUntilNowFormula", {
                daily: num(dailyExpected),
                completed: stats.completedWorkDays,
                until: num(expectedUntilNow),
              })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("flexBalanceFormula", {
                worked: num(stats.totalWorkedHours),
                until: num(expectedUntilNow),
                balance: num(stats.flexBalanceHours),
              })}
            </Typography>
          </Stack>
        </Paper>

        {/* Overtime formula */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("calcOvertime")}
          </Typography>
          <Stack spacing={0.5} sx={{ fontFamily: "monospace" }}>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("overtimeLimitLabel", { limit: overtimeLimitMonthly })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("maxAllowedFormula", {
                sh: num(stats.scheduledHours),
                limit: overtimeLimitMonthly,
                max: num(maxAllowed),
              })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("remainingOTFormula", {
                max: num(maxAllowed),
                worked: num(stats.totalWorkedHours),
                remain: num(stats.remainingOvertimeHours),
              })}
            </Typography>
          </Stack>
        </Paper>

        {/* Required average formula */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("calcRequiredAvg")}
          </Typography>
          <Stack spacing={0.5} sx={{ fontFamily: "monospace" }}>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("remainingScheduledFormula", {
                sh: num(stats.scheduledHours),
                worked: num(stats.totalWorkedHours),
                remaining: num(stats.remainingScheduledHours),
              })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("remainingDaysLabel", { days: stats.remainingWorkDays })}
            </Typography>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {t("requiredDailyAvgFormula", {
                remaining: num(stats.remainingScheduledHours),
                days: stats.remainingWorkDays,
                avg: num(stats.requiredDailyAverage),
              })}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Dialog>
  );
};
