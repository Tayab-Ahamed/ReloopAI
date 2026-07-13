import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/brand/Logo";
import { BRAND } from "@/lib/brand";

export function TeamSwitcher(): JSX.Element {
  const { user } = useAuth();
  const role = user?.role || "Guest";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent2-500 text-white">
            <Logo variant="mark" className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{BRAND.name}</span>
            <span className="truncate text-xs text-foreground/60">{role}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
