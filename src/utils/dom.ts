export const DEBUG = true;
export const dbg = (...args: unknown[]) =>
  DEBUG && console.log("[FTBV]", ...args);

export const getText = (query: string): string | null => {
  const el = document.querySelector<HTMLElement>(query);
  dbg("getText", query, el ? el.innerText : "<not-found>");
  return el?.innerText ?? null;
};
