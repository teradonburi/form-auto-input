import { FC, useState } from "react";
import {
  Stack,
  TextField,
  Typography,
  Divider,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  AppConfig,
  localStorageHandlers,
  DEFAULT_CONFIG,
} from "../utils/localStorage/localStorageSchema";
import { scanDailyTable } from "../dom/scanDaily";
import { calculateStats } from "../functions/calculateStats";
import { useTranslation } from "react-i18next";

/**
 * ユーザー設定（セレクタ・文字列など）を編集するフォーム
 * 編集内容はその場で localStorage に保存されます（反映にはページ再読み込みが必要）
 */
export const ConfigEditor: FC = () => {
  const { t, i18n } = useTranslation();
  const store = localStorageHandlers.config;
  const [config, setConfig] = useState<AppConfig>(() => store.getValue());

  const update = (partial: Partial<AppConfig>) => {
    const next = {
      ...config,
      ...partial,
      selectors: {
        ...config.selectors,
        ...partial.selectors,
      },
      strings: {
        ...config.strings,
        ...partial.strings,
      },
    } as AppConfig;
    setConfig(next);
    store.setValue(next);

    // 即時再計算して表示を更新
    try {
      const scan = scanDailyTable();
      const stats = calculateStats(scan);
      window.updateStats?.(stats);
    } catch (err) {
      console.error("設定変更後の再計算に失敗", err);
    }
  };

  return (
    <Stack spacing={2} divider={<Divider flexItem />}>
      {/* Selectors */}
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t("selectorSettings")}</Typography>
        <TextField
          label={t("tableSpecific")}
          size="small"
          fullWidth
          value={config.selectors.tableSpecific}
          onChange={(e) =>
            update({
              selectors: { tableSpecific: e.target.value },
            } as Partial<AppConfig>)
          }
        />
        <TextField
          label={t("dailyRows")}
          size="small"
          fullWidth
          value={config.selectors.dailyRows}
          onChange={(e) =>
            update({
              selectors: { dailyRows: e.target.value },
            } as Partial<AppConfig>)
          }
        />
        <TextField
          label={t("scheduleCell")}
          size="small"
          fullWidth
          value={config.selectors.scheduleCell}
          onChange={(e) =>
            update({
              selectors: { scheduleCell: e.target.value },
            } as Partial<AppConfig>)
          }
        />
        <TextField
          label={t("workedHoursCell")}
          size="small"
          fullWidth
          value={config.selectors.workedHoursCell}
          onChange={(e) =>
            update({
              selectors: { workedHoursCell: e.target.value },
            } as Partial<AppConfig>)
          }
        />
        <TextField
          label={t("startEndCells")}
          size="small"
          fullWidth
          value={config.selectors.startEndCells}
          onChange={(e) =>
            update({
              selectors: { startEndCells: e.target.value },
            } as Partial<AppConfig>)
          }
        />
      </Stack>

      {/* Strings */}
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t("keywordSettings")}</Typography>
        <TextField
          label={t("flexKeyword")}
          size="small"
          fullWidth
          value={config.strings.flexKeyword}
          onChange={(e) =>
            update({
              strings: { flexKeyword: e.target.value },
            } as Partial<AppConfig>)
          }
        />
      </Stack>

      {/* Reset */}
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t("others")}</Typography>

        {/* Language selector */}
        <FormControl size="small" fullWidth>
          <InputLabel id="lang-select-label">{t("language")}</InputLabel>
          <Select
            labelId="lang-select-label"
            label={t("language")}
            value={i18n.language}
            onChange={(e) => {
              const lng = e.target.value;
              i18n.changeLanguage(lng);
            }}
            MenuProps={{
              PaperProps: {
                sx: { zIndex: 30000 },
              },
            }}
          >
            <MenuItem value="ja">日本語</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="error"
          onClick={() => update(DEFAULT_CONFIG)}
        >
          {t("reset")}
        </Button>
      </Stack>
    </Stack>
  );
};
