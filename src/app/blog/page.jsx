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

function getFirstBlogImage(blogs) {
  if (!Array.isArray(blogs) || blogs.length === 0) return null;

  const firstBlog = blogs[0];
  const blogImage1 = firstBlog?.blogimage1;
  const blogImage2 = firstBlog?.blogimage2;

  let imageUrl = null;

  if (blogImage1) {
    if (typeof blogImage1 === 'string') {
      imageUrl = blogImage1;
    } else if (typeof blogImage1 === 'object') {
      imageUrl = blogImage1.url || blogImage1.secure_url || blogImage1.src || blogImage1.path;
    }
  }

  if (!imageUrl && blogImage2) {
    if (typeof blogImage2 === 'string') {
      imageUrl = blogImage2;
    } else if (typeof blogImage2 === 'object') {
      imageUrl = blogImage2.url || blogImage2.secure_url || blogImage2.src || blogImage2.path;
    }
  }

  return imageUrl;
}

export async function generateMetadata() {
  const blogs = await getAllBlogs({ revalidate: 600 });
  const firstBlogImage = getFirstBlogImage(blogs);

  const topicMetadata = await getPageSeoMetadata(PAGE_NAMES.BLOG, {
    title: null,
    description: null,
    keywords: null,
  });

  const canonicalFromApi = topicMetadata.alternates?.canonical || null;

  return generateSEOMetadata({
    title: topicMetadata.title,
    description: topicMetadata.description,
    keywords: topicMetadata.keywords,
    path: '/blog',
    canonicalOverride: canonicalFromApi,
    ogImage: firstBlogImage,
    robots: 'index, follow',
  });
}

export default async function BlogPage() {
  const [blogs, topicPageData, officeInfo] = await Promise.all([
    getAllBlogs({ revalidate: 600 }),
    fetchTopicPageByName(PAGE_NAMES.BLOG),
    getOfficeInformation({ revalidate: 3600 }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amrita-fashions.com';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog' },
  ];

  const breadcrumbStructuredData = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ];

  return (
    <>
      <BlogPageJsonLd topicPageData={topicPageData} blogs={blogs} baseUrl={baseUrl} />
      <BreadcrumbJsonLd breadcrumbItems={breadcrumbStructuredData} />

      <PublicClientShell>
        <HeaderTwo style_2={true} />
        <CompactUniversalBreadcrumb items={breadcrumbItems} />
        <BlogContentWrapper blogs={blogs} />
        <Footer officeInfo={officeInfo} primary_style={true} />
      </PublicClientShell>
    </>
  );
}
