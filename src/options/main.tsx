import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, Container, Typography, TextField, Switch, FormControlLabel, Button, Stack } from '@mui/material';
import type { AppSettings } from '../utils/settings';
import { loadSettings } from '../utils/settings';

const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  useEffect(() => {
    (async () => {
      setSettings(await loadSettings());
    })();
  }, []);
  return { settings, setSettings } as const;
};

const saveSettings = async (s: AppSettings) => {
  await chrome.storage.local.set({ settings: s });
};

const App = () => {
  const { settings, setSettings } = useSettings();
  const [local, setLocal] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (settings) setLocal(settings);
  }, [settings]);

  const canSave = useMemo(() => !!local, [local]);

  if (!local) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <CssBaseline />
      <Typography variant="h6" gutterBottom>AI Form Autofill - Options</Typography>
      <Stack spacing={2}>
        <TextField
          label="Locale"
          value={local.locale}
          onChange={(e) => setLocal({ ...local, locale: e.target.value })}
        />
        <FormControlLabel
          control={<Switch checked={!!local.openai.enabled} onChange={(e) => setLocal({ ...local, openai: { ...local.openai, enabled: e.target.checked } })} />}
          label="Enable OpenAI"
        />
        <TextField
          label="OpenAI API Key"
          type="password"
          value={local.openai.apiKey ?? ''}
          onChange={(e) => setLocal({ ...local, openai: { ...local.openai, apiKey: e.target.value } })}
        />
        <TextField
          label="Model"
          value={local.openai.model ?? ''}
          onChange={(e) => setLocal({ ...local, openai: { ...local.openai, model: e.target.value } })}
        />
        <TextField
          label="Temperature"
          type="number"
          value={local.openai.temperature ?? 0}
          onChange={(e) => setLocal({ ...local, openai: { ...local.openai, temperature: Number(e.target.value) } })}
        />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            disabled={!canSave}
            onClick={async () => {
              if (!local) return;
              await saveSettings(local);
              setSettings(local);
            }}
          >Save</Button>
          <Button
            variant="outlined"
            onClick={() => setLocal(settings!)}
          >Reset</Button>
        </Stack>
      </Stack>
    </Container>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);


