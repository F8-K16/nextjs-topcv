"use client";

import { useEffect, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const iconClass = "h-[18px] w-[18px]";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 aria-expanded:bg-zinc-200 aria-expanded:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white dark:aria-expanded:bg-zinc-800! dark:aria-expanded:text-white! dark:data-[state=open]:bg-zinc-800! dark:data-[state=open]:text-white!"
          aria-label="Giao diện sáng hoặc tối"
        >
          {!mounted ? (
            <Sun className={`${iconClass} opacity-40`} strokeWidth={1.75} />
          ) : resolvedTheme === "dark" ? (
            <Moon className={iconClass} strokeWidth={1.75} />
          ) : (
            <Sun className={iconClass} strokeWidth={1.75} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>Giao diện</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-between gap-3"
          onClick={() => setTheme("light")}
        >
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Sáng
          </span>
          {theme === "light" ? (
            <Check className="h-4 w-4 shrink-0 opacity-80" />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between gap-3"
          onClick={() => setTheme("dark")}
        >
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Tối
          </span>
          {theme === "dark" ? (
            <Check className="h-4 w-4 shrink-0 opacity-80" />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-between gap-3"
          onClick={() => setTheme("system")}
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Theo hệ thống
          </span>
          {theme === "system" ? (
            <Check className="h-4 w-4 shrink-0 opacity-80" />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
