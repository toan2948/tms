import { createClient } from "../supabase/client";

export async function signIn(
  email: string,
  password: string
): Promise<string | null> {
  const supabase = createClient();

  if (!email || !password) return "Email and password are required.";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error login:", error.message);
    return error.message;
  }

  return null;
}

export async function getUser() {
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
