import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./index";
import { BrandMark } from "@/components/domain/brand-mark";

vi.mock("next/navigation", () => ({
  usePathname: () => "/routes/12",
}));

describe("menu lateral", () => {
  it("mostra a marca, a empresa, os grupos e destaca a tela atual", () => {
    render(<Sidebar brandName="Athonis Teste" />);

    expect(screen.getByRole("img", { name: "Athonis" })).toBeInTheDocument();
    expect(screen.getByText("Athonis Teste")).toBeInTheDocument();
    for (const grupo of ["Operação", "Cadastros", "Análise", "Sistema"]) {
      expect(screen.getByText(grupo)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Rotas" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Pedidos" })).not.toHaveAttribute("aria-current");
  });

  it("recolhido, esconde textos e grupos; o botão alterna o menu", async () => {
    const onToggle = vi.fn();
    render(<Sidebar collapsed onToggleCollapsed={onToggle} />);

    expect(screen.queryByText("Operação")).not.toBeInTheDocument();
    expect(screen.queryByText("Recolher menu")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Expandir menu" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("no menu do celular não há botão de recolher e o clique fecha o menu", async () => {
    const onNavigate = vi.fn();
    render(<Sidebar showToggle={false} onNavigate={onNavigate} />);

    expect(screen.queryByRole("button", { name: /menu/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Pedidos" }));
    expect(onNavigate).toHaveBeenCalled();
  });
});

describe("marca", () => {
  it("o glifo usa a cor do texto e não desenha o fundo", () => {
    const { container } = render(<BrandMark variant="glyph" title="Logo" size={20} />);
    const svg = screen.getByRole("img", { name: "Logo" });
    expect(svg).toHaveAttribute("width", "20");
    expect(container.querySelector("rect")).toBeNull();
    expect(container.querySelector("polyline")).toHaveAttribute("stroke", "currentColor");
  });
});
