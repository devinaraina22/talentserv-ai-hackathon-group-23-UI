import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/onboarding",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
]);

function isDemoLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
  }
});

/** CI e2e runs without real Clerk keys — skip auth middleware entirely. */
export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (process.env.E2E_TEST_MODE === "true") {
    return NextResponse.next();
  }

  const demoSession = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  if (isDemoLoginEnabled() && demoSession) {
    if (request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isDemoLoginEnabled() && !isPublicRoute(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
