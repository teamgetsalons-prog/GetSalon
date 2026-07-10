"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Scissors,
  Sparkles,
  User,
  X,
  Search,
  Star,
  Palette,
  Flower2,
  HandMetal,
  HeartHandshake,
  Gem,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Avatar } from "@/components/ui/misc";

const cities = [
  { name: "Lahore", slug: "lahore" },
  { name: "Karachi", slug: "karachi" },
  { name: "Islamabad", slug: "islamabad" },
  { name: "Rawalpindi", slug: "rawalpindi" },
  { name: "Faisalabad", slug: "faisalabad" },
  { name: "Multan", slug: "multan" },
];

const serviceCategories = [
  { name: "Hair", slug: "hair", icon: Scissors },
  { name: "Makeup", slug: "makeup", icon: Sparkles },
  { name: "Facial", slug: "facial", icon: Star },
  { name: "Nails", slug: "nails", icon: Palette },
  { name: "Bridal", slug: "bridal", icon: Flower2 },
  { name: "Massage", slug: "massage", icon: HandMetal },
  { name: "Skin Care", slug: "skin-care", icon: Gem },
  { name: "Waxing", slug: "waxing", icon: HeartHandshake },
];

const navLinks = [
  { href: "/salons", label: "Find Salons", hasDropdown: true },
  { href: "/salons", label: "Services", hasDropdown: true, type: "services" },
  { href: "/top-salons", label: "Top Salons" },
  { href: "/blog", label: "Beauty Blog" },
  { href: "/salons?sort=newest", label: "Offers" },
  { href: "/partner", label: "List Your Salon" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = session?.user;
  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "owner" || user?.role === "staff"
        ? "/salon-dashboard"
        : "/dashboard";

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleDropdownEnter = (key: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(key);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <header className="glass sticky top-0 z-40">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="GetSalons home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-gold-950">
            <Scissors className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Get<span className="text-gold">Salons</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const isFindSalons = link.hasDropdown && !link.type;
            const isServices = link.hasDropdown && link.type === "services";

            if (isFindSalons) {
              return (
                <div
                  key="find-salons"
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter("find-salons")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-gold" : "text-fg-muted hover:text-fg"
                    )}
                  >
                    <Search className="h-3.5 w-3.5" />
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        activeDropdown === "find-salons" && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === "find-salons" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-line bg-card shadow-xl shadow-black/5"
                        onMouseEnter={() => handleDropdownEnter("find-salons")}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="p-2">
                          <Link
                            href="/salons"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-gold-500/10 hover:text-gold"
                          >
                            <MapPin className="h-4 w-4" />
                            All Cities
                          </Link>
                          {cities.map((city) => (
                            <Link
                              key={city.slug}
                              href={`/salons?city=${city.slug}`}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-gold-500/10 hover:text-fg"
                            >
                              <MapPin className="h-3.5 w-3.5 text-gold-500/60" />
                              {city.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if (isServices) {
              return (
                <div
                  key="services"
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter("services")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-gold" : "text-fg-muted hover:text-fg"
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        activeDropdown === "services" && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === "services" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-card shadow-xl shadow-black/5"
                        onMouseEnter={() => handleDropdownEnter("services")}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="p-2">
                          {serviceCategories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/salons?category=${cat.slug}`}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-gold-500/10 hover:text-fg"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold">
                                <cat.icon className="h-4 w-4" />
                              </span>
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-line p-2">
                          <Link
                            href="/salons"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold-500/10"
                          >
                            View All Services
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-gold" : "text-fg-muted hover:text-fg"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {status === "loading" ? (
            <span className="h-9 w-20 animate-pulse rounded-xl bg-bg-soft" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-3 transition-colors hover:border-gold-500/50"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <Avatar src={user.image} name={user.name ?? "U"} size={30} />
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-card py-1.5 shadow-xl"
                    >
                      <MenuLink
                        href={dashboardHref}
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </MenuLink>
                      {user.role === "customer" && (
                        <>
                          <MenuLink
                            href="/dashboard/bookings"
                            icon={<CalendarDays className="h-4 w-4" />}
                            onClick={() => setMenuOpen(false)}
                          >
                            My Bookings
                          </MenuLink>
                          <MenuLink
                            href="/dashboard/favorites"
                            icon={<Heart className="h-4 w-4" />}
                            onClick={() => setMenuOpen(false)}
                          >
                            Favourites
                          </MenuLink>
                        </>
                      )}
                      <MenuLink
                        href="/dashboard/settings"
                        icon={<User className="h-4 w-4" />}
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </MenuLink>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-bg-soft"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-gold-950 transition-colors hover:bg-gold-400"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-line text-fg-muted lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {/* Find Salons Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setMobileExpanded(mobileExpanded === "salons" ? null : "salons")
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Find Salons
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      mobileExpanded === "salons" && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "salons" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6"
                    >
                      <Link
                        href="/salons"
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg"
                      >
                        All Cities
                      </Link>
                      {cities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/salons?city=${city.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg"
                        >
                          {city.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Services Dropdown */}
              <div>
                <button
                  onClick={() =>
                    setMobileExpanded(mobileExpanded === "services" ? null : "services")
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Services
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      mobileExpanded === "services" && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "services" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6"
                    >
                      {serviceCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/salons?category=${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg"
                        >
                          <cat.icon className="h-3.5 w-3.5 text-gold" />
                          {cat.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Simple Links */}
              <Link
                href="/salons?sort=rating"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft hover:text-fg"
              >
                Top Salons
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft hover:text-fg"
              >
                Beauty Blog
              </Link>
              <Link
                href="/salons?sort=newest"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft hover:text-fg"
              >
                Offers
              </Link>
              <Link
                href="/partner"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-bg-soft hover:text-fg"
              >
                List Your Salon
              </Link>

              {!user && (
                <div className="mt-2 flex gap-2 border-t border-line pt-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-xl border border-line py-2 text-center text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-xl bg-gold-500 py-2 text-center text-sm font-semibold text-gold-950"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-soft hover:text-fg"
    >
      {icon}
      {children}
    </Link>
  );
}
