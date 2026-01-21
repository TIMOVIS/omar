import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/student-signup', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Skip middleware for public routes to avoid unnecessary Supabase calls
  if (isPublicRoute) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // For authenticated users, fetch profile once and use it for all checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single() as { data: { organization_id: string | null; role: string } | null }

  const hasOrganization = profile?.organization_id != null
  const isStudent = profile?.role === 'student'
  const isOnboardingRoute = request.nextUrl.pathname === '/onboarding'
  const isStudentRoute = request.nextUrl.pathname.startsWith('/my-sessions')
  const isTrainerRoute = ['/today', '/schedule', '/students', '/programmes', '/locations', '/trainers', '/sessions'].some(
    route => request.nextUrl.pathname.startsWith(route)
  )

  // Redirect from login if already authenticated
  if (request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = isStudent ? '/my-sessions' : '/today'
    return NextResponse.redirect(url)
  }

  // Redirect root based on role
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = isStudent ? '/my-sessions' : '/today'
    return NextResponse.redirect(url)
  }

  // Students should only access student routes
  if (isStudent) {
    if (isTrainerRoute || isOnboardingRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/my-sessions'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Trainers/admins should not access student-only routes
  if (!isStudent && isStudentRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  // Redirect to onboarding if no organization (unless already there)
  if (!hasOrganization && !isOnboardingRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  // Redirect away from onboarding if already has organization
  if (hasOrganization && isOnboardingRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
