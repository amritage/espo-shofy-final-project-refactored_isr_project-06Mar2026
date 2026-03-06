import PublicClientShell from '@/components/layout/PublicClientShell';
import HeaderTwo from '@/layout/headers/header-2';
import BlogContentWrapper from '@/components/blog/blog-grid/blog-content-wrapper';
import Footer from '@/layout/footers/footer';
import CompactUniversalBreadcrumb from '@/components/breadcrumb/compact-universal-breadcrumb';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import { BreadcrumbJsonLd } from '@/utils/breadcrumbStructuredData';
import { getPageSeoMetadata, fetchTopicPageByName, PAGE_NAMES } from '@/utils/topicPageSeoIntegration';
import { BlogPageJsonLd } from '@/utils/blogPageStructuredData';
import { getAllBlogs, getOfficeInformation } from '@/lib/public-content-api';

export const revalidate = 60;
export const dynamicParams = true;

function getFirstBlogImage(blogs) {
  if (!Array.isArray(blogs) || blogs.length === 0) return null;
  const first = blogs[0];
  const img = first?.blogimage1 || first?.blogimage2;
  if (!img) return null;
  return typeof img === 'string' ? img : img.url || img.secure_url || img.src || img.path || null;
}

export async function generateStaticParams() {
  try {
    const blogs = await getAllBlogs({ revalidate: 600 });
    const tagSet = new Set();

    for (const blog of blogs) {
      const tags = Array.isArray(blog?.tags) ? blog.tags : [];
      tags.forEach((tag) => {
        const clean = String(tag || '').trim();
        if (clean) tagSet.add(encodeURIComponent(clean));
      });
    }

    return Array.from(tagSet).map((tagname) => ({ tagname }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { tagname } = await params;
  const decodedTag = decodeURIComponent(tagname);

  const blogs = await getAllBlogs({ revalidate: 600 });
  const firstBlogImage = getFirstBlogImage(blogs);

  const topicMetadata = await getPageSeoMetadata(PAGE_NAMES.BLOG, {
    title: null,
    description: null,
    keywords: null,
  });

  const canonicalFromApi = topicMetadata.alternates?.canonical || null;

  return generateSEOMetadata({
    title: `${decodedTag} - ${topicMetadata.title || 'Blog'}`,
    description: topicMetadata.description,
    keywords: topicMetadata.keywords,
    path: `/blog/tag/${tagname}`,
    canonicalOverride: canonicalFromApi,
    ogImage: firstBlogImage,
    robots: 'index, follow',
  });
}

export default async function BlogTagPage({ params }) {
  const { tagname } = await params;
  const decodedTag = decodeURIComponent(tagname);

  const [blogs, topicPageData, officeInfo] = await Promise.all([
    getAllBlogs({ revalidate: 600 }),
    fetchTopicPageByName(PAGE_NAMES.BLOG),
    getOfficeInformation({ revalidate: 3600 }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amrita-fashions.com';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: decodedTag },
  ];

  const breadcrumbStructuredData = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: decodedTag, url: `/blog/tag/${tagname}` },
  ];

  return (
    <>
      <BlogPageJsonLd topicPageData={topicPageData} blogs={blogs} baseUrl={baseUrl} />
      <BreadcrumbJsonLd breadcrumbItems={breadcrumbStructuredData} />

      <PublicClientShell>
        <HeaderTwo style_2={true} />
        <CompactUniversalBreadcrumb items={breadcrumbItems} />
        <BlogContentWrapper tagname={decodedTag} blogs={blogs} />
        <Footer officeInfo={officeInfo} primary_style={true} />
      </PublicClientShell>
    </>
  );
}
