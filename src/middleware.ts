import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    const { pathname } = request.nextUrl;

    // Public paths
    if (pathname === "/" || pathname.startsWith("/api/login") || pathname.startsWith("/api/setup")) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const role = payload.role as string;

    // Role based protection
    if (pathname.startsWith("/teacher") && role !== "teacher") {
        return NextResponse.redirect(new URL("/student", request.url));
    }

    if (pathname.startsWith("/student") && role !== "student") {
        return NextResponse.redirect(new URL("/teacher", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/teacher/:path*", "/student/:path*"],
};
