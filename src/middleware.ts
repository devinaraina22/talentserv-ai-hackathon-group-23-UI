import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)", "/api/user/role(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const { userId } = await auth();
  if (userId && !isPublicRoute(request) && !isOnboardingRoute(request)) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return NextResponse.next();

    try {
      const fs = await import("fs");
      const path = await import("path");
      const storePath = path.join(process.cwd(), "data", "store.json");
      if (fs.existsSync(storePath)) {
        const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        const hasRole = store.user_profiles?.some(
          (p: { clerk_user_id: string }) => p.clerk_user_id === userId
        );
        if (!hasRole && !url.pathname.startsWith("/onboarding")) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
      }
    } catch {
      /* continue */
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
