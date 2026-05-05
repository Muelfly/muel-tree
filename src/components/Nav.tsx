"use client";

import { useState } from "react";
import Link from "next/link";
import { muelProducts } from "@/config/apps";

const navItems = [
  { label: "Home", href: "/" },
  ...muelProducts.map((product) => ({
    label: product.name,
    href: product.route,
  })),
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-ink/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-0">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
              M
            </span>
            <span className="text-xl font-bold text-ink">Muel</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-ink/60 transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream md:hidden"
            aria-label="메뉴 열기"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-ink" />
              <span className="block h-0.5 w-5 bg-ink" />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-white px-6 py-6 transition duration-200 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
              M
            </span>
            <span className="text-2xl font-bold text-ink">Muel</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-xl text-ink"
            aria-label="메뉴 닫기"
          >
            x
          </button>
        </div>

        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-5 text-3xl font-bold text-ink"
              >
                {item.label}
                <span className="text-base">-&gt;</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
