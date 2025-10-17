import { Stats } from "./stats";

declare global {
  interface Window {
    updateStats?: (s: Stats) => void;
  }
}
