"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, History } from "lucide-react";

const TABS = [
  { href: "/", label: "หน้าแรก", icon: House },
  { href: "/history", label: "ประวัติ", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch border-t border-purple-100 bg-white/90 backdrop-blur">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
              active ? "text-purple-600" : "text-purple-300"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
