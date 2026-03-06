import PublicClientShell from '@/components/layout/PublicClientShell';
import HeaderTwo from '@/layout/headers/header-2';
import Footer from '@/layout/footers/footer';
import ProductClient from './ProductDetailsClient';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';
import { generateProductStructuredData } from '@/utils/productStructuredData';
import { BreadcrumbJsonLd } from '@/utils/breadcrumbStructuredData';
import { FaqJsonLd } from '@/utils/faqStructuredData';
import { CollectionItemListJsonLd } from '@/utils/collectionItemListStructuredData';
import ProductStructuredDataHeadClient from '@/components/seo/ProductStructuredDataHead.client';
import {
  getCollectionProducts,
  getOfficeInformation,
  getProductByIdentifier,
  getProductSlugs,
  getWebsiteFaqs,
} from '@/lib/public-content-api';

export const revalidate = 600;
export const dynamicParams = true;

const pick = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
const stripHtml = (html = '') =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function generateStaticParams() {
  try {
    const slugs = await getProductSlugs({ limit: 500, revalidate });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductByIdentifier(slug, { revalidate });

  const fallbackTitle = String(slug || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const title = pick(product?.productTitle, product?.name, fallbackTitle);
  const description =
    stripHtml(pick(product?.shortProductDescription, product?.description, '')) ||
    'View detailed information about our premium fabric products.';

  const productKeywords = product?.keywords || [];
  const keywordsString = Array.isArray(productKeywords)
    ? productKeywords.join(', ')
    : productKeywords || 'fabric, textile, premium quality, materials';

  const ogImageUrl = pick(product?.image1CloudUrlWeb, product?.image1, product?.img, product?.image, '');
  const robotsTag = product ? 'index, follow' : 'noindex, nofollow';

  return generateSEOMetadata({
    title,
    description,
    keywords: keywordsString,
    path: `/fabric/${slug}`,
    ogImage: ogImageUrl,
    robots: robotsTag,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;

  try {
    const product = await getProductByIdentifier(slug, { revalidate });
    const collectionId = product?.collectionId || product?.collection?.id || product?.collection?._id || product?.collection || null;

    const [websiteFaqs, collectionProducts, officeInfo] = await Promise.all([
      getWebsiteFaqs({ revalidate }),
      collectionId ? getCollectionProducts(collectionId, { limit: 24, revalidate }) : Promise.resolve([]),
      getOfficeInformation({ revalidate: 3600 }),
    ]);

    const productStructuredData = generateProductStructuredData(product);
    const productTitle = pick(product?.productTitle, product?.name, 'Product Details');

    const breadcrumbStructuredData = [
      { name: 'Home', url: '/' },
      { name: 'Fabric', url: '/fabric' },
      { name: productTitle, url: `/fabric/${slug}` },
    ];

    return (
      <>
        <ProductStructuredDataHeadClient productStructuredData={productStructuredData} />
        <BreadcrumbJsonLd breadcrumbItems={breadcrumbStructuredData} />
        <FaqJsonLd product={product} websiteFaqs={websiteFaqs} />
        <CollectionItemListJsonLd
          products={collectionProducts}
          currentProduct={product}
          collectionData={product?.collection}
        />

        <PublicClientShell>
          <HeaderTwo style_2 />
          <ProductClient slug={slug} initialProduct={product} />
          <Footer officeInfo={officeInfo} primary_style />
        </PublicClientShell>
      </>
    );
  } catch (error) {
    console.error('Error in fabric page:', error);

    return (
      <PublicClientShell>
        <HeaderTwo style_2 />
        <ProductClient slug={slug} />
        <Footer primary_style />
      </PublicClientShell>
    );
  }
}
