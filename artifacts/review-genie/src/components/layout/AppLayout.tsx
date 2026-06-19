import React from "react";
import { Link, useLocation } from "wouter";
import { Star, Home, Clock, BarChart2, Briefcase, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background relative selection:bg-primary/20">
        <Sidebar className="border-r border-border bg-sidebar/50 backdrop-blur-xl">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <Link href="/" className="flex items-center gap-2 w-full text-foreground hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-tr from-amber-500 to-orange-500 rounded-md p-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">ReviewGenie</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/"}>
                      <Link href="/">
                        <Home />
                        <span>Generator</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/history"}>
                      <Link href="/history">
                        <Clock />
                        <span>History</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/analytics"}>
                      <Link href="/analytics">
                        <BarChart2 />
                        <span>Analytics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/profile"}>
                      <Link href="/profile">
                        <Briefcase />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/tips"}>
                      <Link href="/tips">
                        <Lightbulb />
                        <span>Tips</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto">
          <header className="h-16 flex md:hidden items-center px-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
            <SidebarTrigger />
            <span className="ml-4 font-bold tracking-tight">ReviewGenie</span>
          </header>
          <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
