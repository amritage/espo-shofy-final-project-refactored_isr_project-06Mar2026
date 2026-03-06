'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const LazyFloatingButtons = dynamic(() => import('@/components/common/FloatingButtons'), {
  ssr: false,
  loading: () => null,
});

const LazyFloatingChatbot = dynamic(() => import('@/components/chatbot/FloatingChatbot'), {
  ssr: false,
  loading: () => null,
});

const HIDDEN_PREFIXES = ['/checkout', '/profile', '/order', '/login', '/register', '/forgot'];
const HIDDEN_ROUTES = new Set(['/cart', '/wishlist', '/compare']);

export default function ClientOnlyFloating() {
  const pathname = usePathname() || '/';
  const shouldHide = HIDDEN_ROUTES.has(pathname) || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;

  return (
    <>
      <LazyFloatingButtons />
      <LazyFloatingChatbot />
    </>
  );
}
