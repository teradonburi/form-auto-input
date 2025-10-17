/** DOM 内の文字列を数値 h(10 進表現) に変換 */
export const parseHours = (raw: string | null | undefined): number => {
  if (!raw) return 0;
  let trimmed = raw.replace(/[^0-9.:]/g, "");
  // 先頭に : などが残った場合は除去
  trimmed = trimmed.replace(/^[:.]+/, "");
  if (trimmed.includes(":")) {
    const [h, m] = trimmed.split(":").map(Number);
    return h + m / 60;
  }

  if (trimmed.includes(".")) {
    // 小数部は 100 分率そのまま (例 0.75 = 45 分)
    return Number(trimmed);
  }

  // コロンも小数点も含まない場合、HHMMやHMM 形式とみなして末尾2桁を分と解釈
  if (/^\d{3,4}$/.test(trimmed)) {
    const num = Number(trimmed);
    const minutes = num % 100;
    const hours = Math.floor(num / 100);
    return hours + minutes / 60;
  }

  return Number(trimmed);
};

/** 時間 (h) → "hh:mm" 文字列 */
export const hoursToHHMM = (h: number): string => {
  const totalMinutes = Math.round(h * 60);
  const hh = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
};
