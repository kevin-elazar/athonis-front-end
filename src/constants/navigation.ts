import {
  BarChart3,
  LayoutDashboard,
  MapPinned,
  Package,
  Route as RouteIcon,
  Settings,
  Truck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Grupo do menu lateral. */
  section: NavSection;
};

export type NavSection = "Operação" | "Cadastros" | "Análise" | "Sistema";

export const NAV_SECTIONS: NavSection[] = ["Operação", "Cadastros", "Análise", "Sistema"];

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Operação" },
  { label: "Pedidos", href: "/orders", icon: Package, section: "Operação" },
  { label: "Rotas", href: "/routes", icon: RouteIcon, section: "Operação" },
  { label: "Acompanhamento", href: "/tracking", icon: MapPinned, section: "Operação" },
  { label: "Clientes", href: "/customers", icon: Users, section: "Cadastros" },
  { label: "Motoristas", href: "/drivers", icon: UserRound, section: "Cadastros" },
  { label: "Veículos", href: "/vehicles", icon: Truck, section: "Cadastros" },
  { label: "Indicadores", href: "/analytics", icon: BarChart3, section: "Análise" },
  { label: "Configurações", href: "/settings", icon: Settings, section: "Sistema" },
];
