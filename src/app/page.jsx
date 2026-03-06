import HomePageTwoClient from './HomePageTwoClient';
import PublicClientShell from '@/components/layout/PublicClientShell';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import FashionBanner from '@/components/banner/fashion-banner';
import PopularProducts from '@/components/products/fashion/popular-products';
import WeeksFeatured from '@/components/products/fashion/weeks-featured';
import FeatureAreaTwo from '@/components/features/feature-area-2';
import FashionTestimonial from '@/components/testimonial/fashion-testimonial';
import BlogArea from '@/components/blog/fashion/blog-area';
import { getPageSeoMetadata, PAGE_NAMES } from '@/utils/topicPageSeoIntegration';
import { generateMetadata as generateSEOMetadata, getOptimizedLogoUrl } from '@/utils/seo';
import { getAllBlogs, getOfficeInformation, getProducts, getRecentBlogs } from '@/lib/public-content-api';

export const revalidate = 60;

export async function generateMetadata() {
  const logoUrl = getOptimizedLogoUrl();

  const topicMetadata = await getPageSeoMetadata(PAGE_NAMES.HOME, {
    title: null,
    description: null,
    keywords: null,
  });

  const canonicalFromApi = topicMetadata.alternates?.canonical || null;

  return generateSEOMetadata({
    title: topicMetadata.title,
    description: topicMetadata.description,
    keywords: topicMetadata.keywords,
    path: '/',
    canonicalOverride: canonicalFromApi,
    ogImage: '/assets/img/logo/logo.svg',
    ogLogo: logoUrl,
    robots: 'index, follow',
  });
}

export default async function Page() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amrita-fashions.com').replace(/\/+$/, '');

  const [officeInfo, allBlogs, homeProducts] = await Promise.all([
    getOfficeInformation({ revalidate: 3600 }),
    getAllBlogs({ revalidate: 600 }),
    getProducts({ limit: 60, revalidate: 600 }),
  ]);

  const recentBlogs = getRecentBlogs(allBlogs, 3);

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/#home`,
    url: `${siteUrl}/`,
    name: 'Home',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#org` },
    inLanguage: 'en',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <PublicClientShell>
        <HeaderTwo />
        <FashionBanner />
        <PopularProducts initialProducts={homeProducts} />
        <WeeksFeatured initialProducts={homeProducts} />
        <FeatureAreaTwo />
        <FashionTestimonial />
        <BlogArea blogs={recentBlogs} />
        <HomePageTwoClient officeInfo={officeInfo} />
        <Footer officeInfo={officeInfo} />
      </PublicClientShell>
    </>
  );
}
