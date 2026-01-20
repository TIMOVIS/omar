import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/student-signup', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/today'
    return NextResponse.redirect(url)
  }

  // Check if authenticated user has an organization (skip for public routes)
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    const hasOrganization = profile?.organization_id != null
    const isStudent = profile?.role === 'student'
    const isOnboardingRoute = request.nextUrl.pathname === '/onboarding'
    const isStudentRoute = request.nextUrl.pathname.startsWith('/my-sessions')
    const isTrainerRoute = ['/today', '/schedule', '/students', '/programmes', '/locations', '/trainers', '/sessions'].some(
      route => request.nextUrl.pathname.startsWith(route)
    )

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
  }

  // Redirect root based on role
  if (user && request.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'student' ? '/my-sessions' : '/today'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
