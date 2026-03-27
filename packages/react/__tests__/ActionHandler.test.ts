import { describe, it, expect } from "vitest";
import { keyToAction, isSimpleAction, createActionPayload } from "../src/ActionHandler";
import { GameAction } from "../src/types";

describe("keyToAction", () => {
  it("maps ArrowUp to ACTION1", () => {
    expect(keyToAction("ArrowUp")).toBe(GameAction.ACTION1);
  });
  it("maps ArrowDown to ACTION2", () => {
    expect(keyToAction("ArrowDown")).toBe(GameAction.ACTION2);
  });
  it("maps ArrowLeft to ACTION3", () => {
    expect(keyToAction("ArrowLeft")).toBe(GameAction.ACTION3);
  });
  it("maps ArrowRight to ACTION4", () => {
    expect(keyToAction("ArrowRight")).toBe(GameAction.ACTION4);
  });
  it("maps Space to ACTION5", () => {
    expect(keyToAction(" ")).toBe(GameAction.ACTION5);
  });
  it("maps z to ACTION7 (undo)", () => {
    expect(keyToAction("z")).toBe(GameAction.ACTION7);
  });
  it("returns null for unmapped keys", () => {
    expect(keyToAction("q")).toBeNull();
  });
});

describe("isSimpleAction", () => {
  it("returns true for ACTION1-5 and ACTION7", () => {
    expect(isSimpleAction(GameAction.ACTION1)).toBe(true);
    expect(isSimpleAction(GameAction.ACTION7)).toBe(true);
  });
  it("returns false for ACTION6 (complex)", () => {
    expect(isSimpleAction(GameAction.ACTION6)).toBe(false);
  });
});

describe("createActionPayload", () => {
  it("creates simple action payload", () => {
    const payload = createActionPayload(GameAction.ACTION1, "game1", "guid1");
    expect(payload).toEqual({ game_id: "game1", guid: "guid1" });
  });
  it("creates complex action payload with coordinates", () => {
    const payload = createActionPayload(GameAction.ACTION6, "game1", "guid1", 32, 48);
    expect(payload).toEqual({ game_id: "game1", guid: "guid1", x: 32, y: 48 });
  });
});
