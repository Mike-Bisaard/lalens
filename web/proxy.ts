import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  console.log('[proxy]', path, user ? user.id.slice(0,8) : 'no-user')

  // Protect dashboard routes
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Mandatory setup gate: logged-in user with no shop must complete setup first
  if (user && path.startsWith('/dashboard') && path !== '/dashboard/setup') {
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    console.log('[proxy] shop check:', shop ? shop.id.slice(0,8) : 'NO SHOP')
    if (!shop) {
      return NextResponse.redirect(new URL('/dashboard/setup', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Only run proxy on routes that actually need auth checking.
  // Public routes (shop pages, home, orders) are excluded so Vercel can cache them.
  matcher: ['/dashboard/:path*', '/login', '/register', '/auth/:path*'],
}
