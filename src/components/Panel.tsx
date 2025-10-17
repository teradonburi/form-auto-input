import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Button,
} from "@mui/material";
import { Stats } from "../types/stats";
import { hoursToHHMM } from "../functions/parser";
import { CollapseCard } from "./CollapseCard";
import { FC, useState } from "react";
import { ConfigEditor } from "./ConfigEditor";
import { useTranslation } from "react-i18next";
import { CalculationModal } from "./CalculationModal";

interface PanelProps {
  /** 統計情報 */
  stats: Stats;
}

export const Panel: FC<PanelProps> = ({ stats }) => {
  const { t } = useTranslation();
  const sign = stats.flexBalanceHours >= 0 ? "+" : "−";
  const balanceAbs = Math.abs(stats.flexBalanceHours);

  const balanceHH = hoursToHHMM(balanceAbs);
  const remainingOTHH = hoursToHHMM(stats.remainingOvertimeHours);
  const workedHH = hoursToHHMM(stats.totalWorkedHours);
  const maxWorkHH = hoursToHHMM(stats.maxAllowedWorkHours);

  const flexPercent = Math.min(
    100,
    (stats.totalWorkedHours / stats.scheduledHours) * 100
  );
  const otPercent = Math.min(
    100,
    (stats.totalWorkedHours / stats.maxAllowedWorkHours) * 100
  );

  const [calcOpen, setCalcOpen] = useState(false);

  console.log("stats", stats);

  return (
    <Card
      sx={{
        position: "fixed",
        top: "20vh",
        right: 16,
        zIndex: 1,
        minWidth: 260,
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(255,255,255,0.85)",
      }}
    >
      <div>ああああああ</div>
      <CardContent
        sx={{
          pt: 1,
          px: 1,
          "&:last-child": { pb: 1 },
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <CollapseCard title={t("flexBalance")} storageKey="flexBalance">
          <Typography
            variant="h6"
            fontWeight={700}
            color={stats.flexBalanceHours >= 0 ? "success.main" : "error.main"}
          >
            {sign} {balanceHH} h
          </Typography>
          <LinearProgress
            variant="determinate"
            value={flexPercent}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </CollapseCard>

        {/* Overtime */}
        <CollapseCard title={t("overtime")} storageKey="overtime">
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {remainingOTHH} h
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              （{workedHH} / {maxWorkHH} h）
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={otPercent}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </CollapseCard>

        {/* Details list */}
        <CollapseCard title={t("details")} storageKey="details">
          <Typography variant="body2">
            {t("average")}:{" "}
            {t("averageValue", {
              value: stats.averageWorkedHoursPerDay.toFixed(2),
            })}
          </Typography>
          <Typography variant="body2">
            {t("remainingHours")} :{" "}
            {t("remainingValue", {
              value: stats.remainingScheduledHours.toFixed(2),
              days: stats.remainingWorkDays,
            })}
          </Typography>
          <Typography variant="body2">
            {t("workingDays")} :{" "}
            {t("workingDaysValue", {
              completed: stats.completedWorkDays,
              total: stats.totalWorkDays,
            })}
          </Typography>
          <Typography variant="body2">
            {t("requiredAverage")} :{" "}
            {t("requiredAverageValue", {
              value: stats.requiredDailyAverage.toFixed(2),
            })}
          </Typography>
          {stats.todayTargetExitTime && (
            <Typography variant="body2">
              {t("targetExit")}: {stats.todayTargetExitTime}
            </Typography>
          )}
        </CollapseCard>

        {/* Settings */}
        <CollapseCard title={t("settings")} storageKey="settings">
          <ConfigEditor />
        </CollapseCard>

        {/* Calculation Basis Button */}
        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => setCalcOpen(true)}
        >
          {t("calcBasis")}
        </Button>

        {/* Modal */}
        <CalculationModal
          open={calcOpen}
          onClose={() => setCalcOpen(false)}
          stats={stats}
        />
      </CardContent>
    </Card>
  );
};
