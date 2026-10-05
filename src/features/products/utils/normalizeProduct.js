export const normalizeProduct = (product, index = 0) => {
  const seller = product.seller ?? product.farmer ?? null;

  return {
    ...product,
    id: product.id ?? product.productId,
    name: product.name ?? product.productName ?? 'Farm product',
    description: product.description ?? '',
    price: Number(product.price ?? 0),
    unit: product.unit ?? 'kg',
    stock_quantity: Number(product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0),
    category_id: product.categoryId ?? product.category_id ?? product.category?.id,
    category_name: product.categoryName ?? product.category_name ?? product.category?.name ?? 'Other',
    image_url: product.imageUrl ?? product.image_url ?? product.image ?? null,
    rating: Number(product.rating ?? product.averageRating ?? 0),
    reviews_count: Number(product.reviewsCount ?? product.reviews_count ?? 0),
    is_organic: Boolean(product.isOrganic ?? product.is_organic),
    seller,
    seller_id: product.sellerId ?? product.seller_id ?? seller?.id,
    seller_name: seller?.displayName ?? seller?.name ?? product.sellerName ?? product.seller_name,
    status: product.status ?? 'Published',
    code: product.code ?? `#${product.id ?? product.productId ?? index + 1}`,
  };
};