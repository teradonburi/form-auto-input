import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, Container, Button, Stack, Typography } from '@mui/material';

const triggerRun = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // content script already runs on all pages; re-init trigger via custom event
      document.dispatchEvent(new CustomEvent('form-auto-input:run'));
    },
  });
};

const App = () => {
  return (
    <Container sx={{ p: 2, width: 280 }}>
      <CssBaseline />
      <Stack spacing={2}>
        <Typography variant="subtitle1">AI Form Autofill</Typography>
        <Button variant="contained" onClick={triggerRun}>実行</Button>
      </Stack>
    </Container>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);


