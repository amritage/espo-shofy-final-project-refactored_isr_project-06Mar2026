import { NextResponse } from 'next/server';
import { getProductByIdentifier } from '@/lib/public-content-api';

export const revalidate = 600;

export async function GET(request) {
  const identifier = request.nextUrl.searchParams.get('id') || '';

  if (!identifier) {
    return NextResponse.json({ success: false, data: null, error: 'Missing product identifier' }, { status: 400 });
  }

  const product = await getProductByIdentifier(identifier, { revalidate });

  return NextResponse.json({
    success: Boolean(product),
    data: product || null,
  });
}
