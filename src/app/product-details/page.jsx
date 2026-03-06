import PublicClientShell from '@/components/layout/PublicClientShell';
import HeaderTwo from '@/layout/headers/header-2';
import ProductDetailsClient from './ProductDetailsClient';
import Footer from '@/layout/footers/footer';
import { generateMetadata as generateSEOMetadata, getOptimizedLogoUrl } from '@/utils/seo';
import { generateProductStructuredData } from '@/utils/productStructuredData';
import { getOfficeInformation, getProductByIdentifier } from '@/lib/public-content-api';

export const revalidate = 600;

async function getProductData(productId) {
  return getProductByIdentifier(productId, { revalidate });
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const productId = sp?.id || '6431364df5a812bd37e765ac';
  const product = await getProductData(productId);
  const logoUrl = getOptimizedLogoUrl();

  const productTitle = product?.productTitle || product?.name || product?.title || 'Product Details';
  const productDescription = product?.shortProductDescription || product?.fullProductDescription || product?.description || 'View detailed information about our fabric product.';
  const firstImage = product?.image1CloudUrlWeb || product?.image1 || product?.img || product?.image || null;
  const productKeywords = product?.keywords || [];
  const keywordsString = Array.isArray(productKeywords)
    ? productKeywords.join(', ')
    : productKeywords || 'fabric, textile, premium quality, materials';
  const robotsTag = product ? 'index, follow' : 'noindex, nofollow';
  const canonicalSlug = product?.productslug || product?.slug || product?.aiTempOutput || product?.fabricCode || null;

  return generateSEOMetadata({
    title: `${productTitle} - Shofy`,
    description: productDescription,
    keywords: keywordsString,
    path: `/product-details?id=${productId}`,
    canonicalOverride: canonicalSlug ? `/fabric/${canonicalSlug}` : null,
    ogImage: firstImage,
    ogLogo: logoUrl,
    robots: robotsTag,
  });
}

export default async function ProductDetailsPage({ searchParams }) {
  const sp = await searchParams;
  const productId = sp?.id || '6431364df5a812bd37e765ac';

  const [product, officeInfo] = await Promise.all([
    getProductData(productId),
    getOfficeInformation({ revalidate: 3600 }),
  ]);

  const productStructuredData = generateProductStructuredData(product);

  return (
    <>
      {productStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
        />
      ) : null}

      <PublicClientShell>
        <HeaderTwo style_2={true} />
        <ProductDetailsClient productId={productId} initialProduct={product} />
        <Footer officeInfo={officeInfo} primary_style={true} />
      </PublicClientShell>
    </>
  );
}
