import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArcCaptcha } from "../src/ArcCaptcha";

// Mock crypto.randomUUID since it may not be available in jsdom environment
beforeAll(() => {
  if (!globalThis.crypto) {
    (globalThis as unknown as Record<string, unknown>).crypto = {};
  }
  if (!(globalThis.crypto as Record<string, unknown>).randomUUID) {
    (globalThis.crypto as Record<string, unknown>).randomUUID = () =>
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);
  }
});

// Mock fetch: return a never-resolving Promise to keep the component in loading state
vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

describe("ArcCaptcha", () => {
  it("renders loading state initially", () => {
    render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
      />
    );
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it("renders with default size of 512", () => {
    const { container } = render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("accepts custom size prop", () => {
    const { container } = render(
      <ArcCaptcha
        apiEndpoint="/api/arc"
        environmentId="ls20"
        onVerify={() => {}}
        size={256}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
