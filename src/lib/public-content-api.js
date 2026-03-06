import 'server-only';

const DEFAULT_REVALIDATE = 600;
const API_BASE = String(process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const COMPANY_FILTER = String(process.env.NEXT_PUBLIC_COMPANY_FILTER || '').trim();

function encodeValue(value) {
  return encodeURIComponent(String(value ?? '').replace(/#$/, '').trim());
}

function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}

async function fetchJson(path, { revalidate = DEFAULT_REVALIDATE, cache, headers = {} } = {}) {
  if (!API_BASE) return null;

  const requestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (cache) {
    requestInit.cache = cache;
  } else {
    requestInit.next = { revalidate };
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, requestInit);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getOfficeInformation({ revalidate = 3600 } = {}) {
  const payload = await fetchJson('/companyinformation', { revalidate });
  const companies = normalizeArrayPayload(payload);

  if (!companies.length) return null;
  if (!COMPANY_FILTER) return companies[0] ?? null;

  return (
    companies.find((company) => String(company?.name || '').trim() === COMPANY_FILTER) ||
    companies[0] ||
    null
  );
}

export async function getAllBlogs({ revalidate = DEFAULT_REVALIDATE } = {}) {
  const payload = await fetchJson('/blog', { revalidate });
  const blogs = normalizeArrayPayload(payload);

  return blogs.filter((blog) => !blog?.deleted && (!blog?.status || blog.status === 'Approved'));
}

export function sortBlogsByDate(blogs = []) {
  return [...blogs].sort((a, b) => {
    const aTime = new Date(a?.publishedAt || a?.createdAt || a?.modifiedAt || 0).getTime();
    const bTime = new Date(b?.publishedAt || b?.createdAt || b?.modifiedAt || 0).getTime();
    return bTime - aTime;
  });
}

export function getRecentBlogs(blogs = [], limit = 3) {
  return sortBlogsByDate(blogs).slice(0, limit);
}

export function filterBlogsByTag(blogs = [], tagname = '') {
  const needle = String(tagname || '').trim().toLowerCase();
  if (!needle) return blogs;

  return blogs.filter((blog) =>
    Array.isArray(blog?.tags) &&
    blog.tags.some((tag) => String(tag || '').trim().toLowerCase() === needle)
  );
}

export async function getProducts({ limit = 60, page = 1, revalidate = DEFAULT_REVALIDATE } = {}) {
  const payload = await fetchJson(`/product/?limit=${limit}&page=${page}`, { revalidate });
  return normalizeArrayPayload(payload);
}

export function filterProductsByMerchTags(products = [], requiredTags = []) {
  const required = requiredTags.map((tag) => String(tag || '').trim()).filter(Boolean);
  if (!required.length) return products;

  return products.filter((product) => {
    const productTags = Array.isArray(product?.merchTags) ? product.merchTags : [];
    return required.every((tag) => productTags.includes(tag));
  });
}

async function getFirstFromField(fieldName, value, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const cleanValue = String(value || '').replace(/#$/, '').trim();
  if (!cleanValue) return null;

  const payload = await fetchJson(`/product/fieldname/${fieldName}/${encodeValue(cleanValue)}`, {
    revalidate,
  });
  const products = normalizeArrayPayload(payload);
  return products[0] || null;
}

export async function getProductByIdentifier(identifier, { revalidate = DEFAULT_REVALIDATE } = {}) {
  const cleanIdentifier = String(identifier || '').replace(/#$/, '').trim();
  if (!cleanIdentifier) return null;

  const lookups = [
    () => getFirstFromField('productslug', cleanIdentifier, { revalidate }),
    () => getFirstFromField('fabricCode', cleanIdentifier, { revalidate }),
    () => getFirstFromField('aiTempOutput', cleanIdentifier, { revalidate }),
    async () => {
      const payload = await fetchJson(`/product/${encodeValue(cleanIdentifier)}`, { revalidate });
      if (payload?.data && !Array.isArray(payload.data)) return payload.data;
      if (payload && !Array.isArray(payload) && payload.id) return payload;
      return null;
    },
  ];

  for (const lookup of lookups) {
    const product = await lookup();
    if (product) return product;
  }

  const fallbackProducts = await getProducts({ limit: 60, revalidate });
  return (
    fallbackProducts.find((product) => {
      const productId = product?.id || product?._id;
      return (
        productId === cleanIdentifier ||
        product?.productslug === cleanIdentifier ||
        product?.aiTempOutput === cleanIdentifier ||
        product?.fabricCode === cleanIdentifier
      );
    }) || null
  );
}

export async function getCollectionProducts(collectionId, { limit = 24, revalidate = DEFAULT_REVALIDATE } = {}) {
  const cleanCollectionId = String(collectionId || '').trim();
  if (!cleanCollectionId) return [];

  const payload = await fetchJson(
    `/product/fieldname/collectionId/${encodeValue(cleanCollectionId)}?limit=${limit}`,
    { revalidate }
  );

  const products = normalizeArrayPayload(payload);
  if (products.length) return products;

  const fallbackProducts = await getProducts({ limit: Math.max(limit, 80), revalidate });
  return fallbackProducts.filter((product) => {
    return (
      product?.collectionId === cleanCollectionId ||
      product?.collection === cleanCollectionId ||
      product?.collection_id === cleanCollectionId ||
      product?.collection?.id === cleanCollectionId ||
      product?.collection?._id === cleanCollectionId
    );
  });
}

export async function getWebsiteFaqs({ revalidate = DEFAULT_REVALIDATE } = {}) {
  const payload = await fetchJson('/websitefaq', { revalidate });
  const rows = normalizeArrayPayload(payload);
  return rows;
}

export async function getProductSlugs({ limit = 500, revalidate = DEFAULT_REVALIDATE } = {}) {
  const products = await getProducts({ limit, revalidate });

  return products
    .map((product) => product?.productslug || product?.aiTempOutput || product?.fabricCode || product?.id)
    .filter((slug) => typeof slug === 'string' && slug.trim() !== '');
}
