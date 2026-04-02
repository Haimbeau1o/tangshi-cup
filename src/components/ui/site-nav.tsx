import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/players", label: "选手库" },
  { href: "/formats", label: "赛制库" },
  { href: "/seasons", label: "赛季" },
  { href: "/chronicle", label: "编年史" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#09090c]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-white/15 bg-[#15151b] text-lg font-black text-cyan-300">
            唐
          </span>
          <div>
            <p className="font-display text-2xl uppercase tracking-[0.18em] text-stone-50">Tangshi Cup</p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Private Valorant Invitational</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition hover:bg-white/8 hover:text-stone-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
