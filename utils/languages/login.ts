import { createClient } from "../supabase/client";

export async function getProfile() {
  const supabase = createClient();
  const {
    data: { user },
    error: loginError,
  } = await supabase.auth.getUser();

  if (loginError) {
    console.error("Error fetching user:", loginError.message);
    return null;
  }

  if (!user) {
    console.warn("No user found");
    return null;
  }
  // Fetch user profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile || null;
}
type Role = "admin" | "dev" | "editor";
type Action = "delete" | "edit_name" | "edit_value" | "add";

const permissions: Record<Role, Action[]> = {
  admin: ["delete", "edit_name", "edit_value", "add"],
  dev: ["delete", "edit_name", "edit_value", "add"],
  editor: ["edit_value"],
};

export function canAccess(role: Role | null, action: Action): boolean {
  if (!role) return false;
  return permissions[role]?.includes(action);
}
export const isDevOrAdmin = (role: string | null | undefined) =>
  role === "admin" || role === "dev";
