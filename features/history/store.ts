import {
  dailyMovement,
  monthlyMovement,
  returnGrid,
  totalReturns,
  withMovement,
  withReturn,
} from "./lib/engine";
import { readHistory, writeHistory } from "./lib/storage";

export function recordReturn(now: Date = new Date()): void {
  writeHistory(withReturn(readHistory(), now));
}

export function recordMovement(
  promotions: number,
  demotions: number,
  now: Date = new Date()
): void {
  writeHistory(withMovement(readHistory(), now, promotions, demotions));
}

export function getTotalReturns(): number {
  return totalReturns(readHistory());
}

export function getMonthlyMovement(now: Date = new Date()): { promotions: number; demotions: number } {
  return monthlyMovement(readHistory(), now);
}

export function getReturnGrid(now: Date = new Date()): boolean[][] {
  return returnGrid(readHistory(), now);
}

export function getDailyMovement(now: Date = new Date()): { up: number; down: number }[] {
  return dailyMovement(readHistory(), now);
}
