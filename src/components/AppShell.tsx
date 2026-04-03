import { NavLink, Outlet } from "react-router-dom";
import { ShoppingBag, FileText, CheckSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: ShoppingBag, end: true },
  { to: "/logs", label: "Logs de API", icon: FileText, end: false },
  { to: "/backlog", label: "Backlog", icon: CheckSquare, end: false },
  { to: "/pendencias", label: "Pendências", icon: AlertTriangle, end: false },
];

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">
              Orderly <span className="text-primary">v2</span>
            </p>
            <p className="text-[10px] text-muted-foreground">Checkout</p>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Navegação principal" className="flex flex-col gap-1 p-2 pt-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
