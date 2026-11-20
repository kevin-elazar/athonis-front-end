"use client";

import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container, Icon, Inline, Text } from "@/components/ui/primitives";
import { ThemeMenu } from "@/components/ui/theme-menu";
import { BrandMark } from "@/components/domain/brand-mark";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { gsap } from "@/lib/gsap/register";

export function AuthHeader() {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  function handleBack() {
    router.push("/");
  }

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: headerRef, dependencies: [reducedMotion] },
  );

  return (
    <header
      ref={headerRef}
      className="border-border-subtle bg-surface shrink-0 border-b"
    >
      <Container width="default">
        <Inline justify="between" align="center" className="h-16">
          <Inline gap={3} align="center">
            <BrandMark size={34} />
            <Text weight="bold" className="text-heading-4 text-foreground tracking-[0.14em]">
              ATHONIS
            </Text>
          </Inline>
          <Inline gap={2} align="center">
            <ThemeMenu />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
            >
              <Icon icon={ArrowLeft} size="sm" />
              Voltar
            </Button>
          </Inline>
        </Inline>
      </Container>
    </header>
  );
}
