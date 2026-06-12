import { getStatus, getStatuses, getAllStatuses, demoteWord, finishPage } from "../store";
import type { WordStatus } from "../lib/types";

jest.mock("../lib/storage", () => ({
  readStatuses: jest.fn(),
  writeStatuses: jest.fn(),
}));

jest.mock("@/features/history/store", () => ({
  recordMovement: jest.fn(),
  recordReturn: jest.fn(),
}));

jest.mock("@/features/session/store", () => ({
  hasMoved: jest.fn(() => false),
  markMoved: jest.fn(),
}));

import { readStatuses, writeStatuses } from "../lib/storage";
import { recordMovement, recordReturn } from "@/features/history/store";
import { hasMoved, markMoved } from "@/features/session/store";

const mockRead = readStatuses as jest.Mock;
const mockWrite = writeStatuses as jest.Mock;
const mockRecordMovement = recordMovement as jest.Mock;
const mockRecordReturn = recordReturn as jest.Mock;
const mockHasMoved = hasMoved as jest.Mock;
const mockMarkMoved = markMoved as jest.Mock;

describe("review store", () => {
  let backing: Record<string, WordStatus>;

  beforeEach(() => {
    backing = {};
    mockRead.mockImplementation(() => backing);
    mockWrite.mockImplementation((next: Record<string, WordStatus>) => {
      backing = next;
    });
    mockHasMoved.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStatus", () => {
    it("returns the default status (Unknown, 0 clean reads) for an unseen id", () => {
      expect(getStatus("a")).toEqual({ id: "a", level: 0, cleanReads: 0 });
    });

    it("returns the stored status when present", () => {
      backing = { a: { id: "a", level: 2, cleanReads: 4 } };
      expect(getStatus("a")).toEqual({ id: "a", level: 2, cleanReads: 4 });
    });
  });

  describe("getStatuses", () => {
    it("returns a status per requested id, defaulting missing ones", () => {
      backing = { a: { id: "a", level: 1, cleanReads: 1 } };
      expect(getStatuses(["a", "b"])).toEqual({
        a: { id: "a", level: 1, cleanReads: 1 },
        b: { id: "b", level: 0, cleanReads: 0 },
      });
    });
  });

  describe("getAllStatuses", () => {
    it("returns the full stored map", () => {
      backing = { a: { id: "a", level: 1, cleanReads: 1 } };
      expect(getAllStatuses()).toEqual(backing);
    });
  });

  describe("demoteWord (Engine B)", () => {
    it("demotes the stored status by one level and persists it", () => {
      backing = { a: { id: "a", level: 2, cleanReads: 4 } };
      const result = demoteWord("a");
      expect(result).toEqual({ id: "a", level: 1, cleanReads: 1 });
      expect(getStatus("a")).toEqual({ id: "a", level: 1, cleanReads: 1 });
      expect(mockWrite).toHaveBeenCalledTimes(1);
    });

    it("demotes a never-seen id from the default Unknown (no-op)", () => {
      const result = demoteWord("a");
      expect(result).toEqual({ id: "a", level: 0, cleanReads: 0 });
    });

    it("per-form sharing: demoting an id affects every future read of that id", () => {
      backing = { قل: { id: "قل", level: 3, cleanReads: 9 } };
      demoteWord("قل");
      // Every occurrence of قل (Ikhlāṣ, Falaq, Kāfirūn, ...) reads the same key.
      expect(getStatus("قل").level).toBe(2);
    });

    it("records a demotion in history when the level decreases", () => {
      backing = { a: { id: "a", level: 2, cleanReads: 4 } };
      demoteWord("a");
      expect(mockRecordMovement).toHaveBeenCalledWith(0, 1);
      expect(mockRecordReturn).not.toHaveBeenCalled();
    });

    it("records a return (not a demotion) when already at level 0", () => {
      demoteWord("a");
      expect(mockRecordReturn).toHaveBeenCalledTimes(1);
      expect(mockRecordMovement).not.toHaveBeenCalled();
    });

    it("marks the word moved so it cannot move again this session", () => {
      backing = { a: { id: "a", level: 2, cleanReads: 4 } };
      demoteWord("a");
      expect(mockMarkMoved).toHaveBeenCalledWith(["a"]);
    });

    it("does not demote a word already moved this session (no-op)", () => {
      backing = { a: { id: "a", level: 2, cleanReads: 4 } };
      mockHasMoved.mockImplementation((id: string) => id === "a");
      const result = demoteWord("a");
      expect(result).toEqual({ id: "a", level: 2, cleanReads: 4 });
      expect(mockWrite).not.toHaveBeenCalled();
      expect(mockRecordMovement).not.toHaveBeenCalled();
      expect(mockRecordReturn).not.toHaveBeenCalled();
    });
  });

  describe("finishPage (Engine A)", () => {
    it("promotes untapped ids on the page and persists the result", () => {
      const result = finishPage(["a", "b"], new Set(["b"]));
      expect(result["a"]).toEqual({ id: "a", level: 1, cleanReads: 1 });
      expect(result["b"]).toBeUndefined();
      expect(getStatus("a")).toEqual({ id: "a", level: 1, cleanReads: 1 });
      expect(mockWrite).toHaveBeenCalledTimes(1);
    });

    it("does not change statuses for ids not on the page", () => {
      backing = { z: { id: "z", level: 2, cleanReads: 4 } };
      finishPage(["a"], new Set());
      expect(getStatus("z")).toEqual({ id: "z", level: 2, cleanReads: 4 });
    });

    it("records promotions in history for untapped words that cross a threshold", () => {
      finishPage(["a", "b"], new Set(["b"]));
      expect(mockRecordMovement).toHaveBeenCalledWith(1, 0);
      expect(mockRecordReturn).not.toHaveBeenCalled();
    });

    it("records a return when no word promoted", () => {
      finishPage(["a"], new Set(["a"]));
      expect(mockRecordReturn).toHaveBeenCalledTimes(1);
      expect(mockRecordMovement).not.toHaveBeenCalled();
    });

    it("does not re-promote a word-form already moved this session", () => {
      // 'a' moved earlier this session (e.g. on a previous page); 'b' is fresh.
      mockHasMoved.mockImplementation((id: string) => id === "a");
      const result = finishPage(["a", "b"], new Set());
      expect(result["a"]).toBeUndefined(); // untouched — no promotion
      expect(result["b"]).toEqual({ id: "b", level: 1, cleanReads: 1 });
    });

    it("marks newly promoted word-forms as moved this session", () => {
      finishPage(["a", "b"], new Set(["b"]));
      expect(mockMarkMoved).toHaveBeenCalledWith(["a"]);
    });
  });
});
