import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function useMyRole() {
  return useQuery({
    queryKey: ["my-role"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role);
      return roles.includes("admin") ? "admin" : roles[0] ?? null;
    },
  });
}

export function StaffNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: role } = useMyRole();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            UZA<span className="text-muted-foreground"> Mobility</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/dashboard"
              activeProps={{ className: "text-foreground font-medium" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              Instructor
            </Link>
            {role === "admin" && (
              <Link
                to="/manage"
                activeProps={{ className: "text-foreground font-medium" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="transition-colors hover:text-foreground"
              >
                Management
              </Link>
            )}
            <Link
              to="/institutions"
              activeProps={{ className: "text-foreground font-medium" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              Banks
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {role && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{role}</span>
          )}
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
