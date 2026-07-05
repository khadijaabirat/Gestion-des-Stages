import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Try to get role from cookies (since we use Sanctum, we don't have a raw token anymore)
  const role = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // Protect private routes (dashboards)
  const isDashboardRoute = path.startsWith('/etudiant') || 
                           path.startsWith('/entreprise/') || path === '/entreprise' || 
                           path.startsWith('/admin');

  if (isDashboardRoute) {
    if (!role) {
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (path.startsWith('/etudiant') && role !== 'etudiant') {
      return NextResponse.redirect(new URL(role ? `/${role}/dashboard` : '/login', request.url));
    }
    if ((path.startsWith('/entreprise/') || path === '/entreprise') && role !== 'entreprise') {
      return NextResponse.redirect(new URL(role ? `/${role}/dashboard` : '/login', request.url));
    }
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(role ? `/${role}/dashboard` : '/login', request.url));
    }
  }

  // Prevent authenticated users from visiting login/register pages
  const isAuthRoute = path === '/login' || path === '/register';
  if (isAuthRoute && role) {
    // Redirect logged-in users to their respective dashboards
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, static files, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)'],
};
