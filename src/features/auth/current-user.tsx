"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Papel do usuário logado, para a interface esconder o que ele não pode usar.
 * Vem da sessão, lida no layout do servidor. É só conveniência de tela: quem
 * barra de fato é o backend, que confere o papel em cada requisição.
 */
export type CurrentUser = {
  role?: string;
};

const CurrentUserContext = createContext<CurrentUser>({});

export function CurrentUserProvider({ role, children }: CurrentUser & { children: ReactNode }) {
  return <CurrentUserContext.Provider value={{ role }}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  return { ...user, isAdmin: user.role === "admin" };
}
