import { NextRequest, NextResponse } from 'next/server'
import { searchSite } from '@/lib/site-search'

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  return NextResponse.json({ results: searchSite(query) })
}
