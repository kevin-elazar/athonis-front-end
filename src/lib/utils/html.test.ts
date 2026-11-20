import { describe, expect, it } from "vitest";
import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  it("neutraliza marcação e atributos", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe("&#60;img src=x onerror=&#34;alert(1)&#34;&#62;");
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &#38; Jerry&#39;s");
  });

  it("mantém texto comum intacto", () => {
    expect(escapeHtml("Van 1 — Bruno")).toBe("Van 1 — Bruno");
  });
});
