// tms/utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // base response that will carry any cookie updates from Supabase
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // update cookies on the incoming request (so subsequent reads see them)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // mirror them into the response we’ll forward/return
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value }) => {
            // NOTE: Next's types don't expose an options object here
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    }
  );

  // ⚠️ Do not add code between client creation and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLogin = pathname.startsWith("/login");
  const isAuth = pathname.startsWith("/auth");

  // 1) Unauthenticated -> redirect to /login
  if (!user && !isLogin && !isAuth) {
    const url = new URL("/login", request.url);
    const redirect = NextResponse.redirect(url);

    // copy cookies from supabaseResponse into the redirect
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirect.cookies.set(name, value);
    });

    return redirect;
  }

  // 2) Authenticated visiting /login -> redirect to /
  if (user && isLogin) {
    const url = new URL("/", request.url);
    const redirect = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirect.cookies.set(name, value);
    });

    return redirect;
  }

  // 3) Otherwise continue
  return supabaseResponse;
}
