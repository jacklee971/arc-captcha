import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArcCaptcha } from "../src/ArcCaptcha";

// crypto.randomUUID가 jsdom 환경에서 지원되지 않을 수 있으므로 모킹
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

// fetch 모킹: 초기 로딩 상태를 보여주기 위해 resolve 하지 않는 Promise 반환
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
