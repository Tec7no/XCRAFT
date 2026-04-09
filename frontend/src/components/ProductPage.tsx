import * as React from 'react';
import { ChevronLeft, ChevronRight, Heart, CheckCircle2, ShieldCheck, Truck, RotateCcw } from './icons';
import { Product, ColorOption, makeVariantKey } from '../types';
import ImagePlaceholder from './ImagePlaceholder';
import Breadcrumbs from './ui/breadcrumbs';
import ReviewList from './reviews/ReviewList';
import ReviewForm from './reviews/ReviewForm';
import { useStorageState } from '../utils/storage';
import { Review } from '@/types';
import { Star, MessageSquare } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import SizeGuideModal from './SizeGuideModal';
import { Ruler } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { EditableText } from './ui/editable-text';
import { useLanguage } from '../i18n/LanguageContext';


interface ProductPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, color: string, size: string) => void;
  onProductClick: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  catalog: Product[];
  onToggleCompare?: (product: Product) => void;
  compareList?: Product[];
}

const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onProductClick,
  isWishlisted,
  onToggleWishlist,
  catalog,
  onToggleCompare,
  compareList
}) => {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const dir = isRTL ? 'rtl' : 'ltr';
  const filteredImages = product.images.filter(Boolean);
  const images = filteredImages.length ? filteredImages : [''];
  const [selectedImageIdx, setSelectedImageIdx] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);

  // Similar Products logic - use catalog from API
  const similarProducts = React.useMemo(() => {
    return catalog
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [catalog, product]);

  // Reviews state
  const [allReviews, setAllReviews] = useStorageState<Review[]>('product_reviews', []);
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [showSizeGuide, setShowSizeGuide] = React.useState(false);

  // Filter reviews for this product
  const reviews = React.useMemo(() =>
    allReviews.filter(r => r.productId === product.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allReviews, product.id]);

  const handleAddReview = (newReviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setAllReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
  };

  // Get available sizes (now just string[])
  const availableSizes = React.useMemo(() =>
    Array.isArray(product.sizes) ? product.sizes : [],
    [product.sizes]
  );

  // Helper to get variant stock for a size+color combination
  const getVariantQty = React.useCallback((size: string, hex: string): number => {
    if (!product.variantStock) return product.stock ?? 0;
    const key = makeVariantKey(size, hex);
    const stock = product.variantStock as any;
    if (typeof stock.get === 'function') return stock.get(key) ?? 0;
    return stock[key] ?? 0;
  }, [product.variantStock, product.stock]);

  // Check if current selection is out of stock
  const selectedVariantStock = selectedSize && selectedColor
    ? getVariantQty(selectedSize, selectedColor.hex)
    : 0;
  const outOfStock = product.stock <= 0 || 
    (selectedColor !== null && selectedSize !== null && selectedVariantStock <= 0);


  React.useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIdx(0);
    setSelectedSize(availableSizes[0] || null);
    // Use defaultColorHex if set, otherwise first color
    const defaultColor = product.defaultColorHex
      ? (product.colors ?? []).find(c => c.hex === product.defaultColorHex) || (product.colors ?? [])[0]
      : (product.colors ?? [])[0];
    setSelectedColor(defaultColor || null);
  }, [product.id, availableSizes, product.colors, product.defaultColorHex]);

  const handleNextImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setSelectedImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize && selectedVariantStock > 0) {
      onAddToCart(product, selectedColor.hex, selectedSize);
    }
  };

  // Use color-specific image if available, otherwise use gallery images
  const displayImages = React.useMemo(() => {
    // Use color-specific images if available
    const colorImgs = selectedColor?.images?.length
      ? selectedColor.images
      : selectedColor?.image
        ? [selectedColor.image]
        : [];
    // If selected color has its own images, show ONLY those
    // Otherwise show the general product images
    return colorImgs.length > 0 ? colorImgs : images;
  }, [selectedColor, images]);

  // When color changes, reset image index to 0 so we see the color-specific image (if any)
  React.useEffect(() => {
    if (selectedColor?.image) {
      setSelectedImageIdx(0);
    }
  }, [selectedColor]);

  const currentImage = displayImages[selectedImageIdx] || '';
  const hasImage = Boolean(currentImage);


  return (
    <div className="bg-background/80 backdrop-blur-sm pb-24 md:pb-12 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-10">
          <Breadcrumbs
            items={[
              { label: <EditableText k={`category_${product.category.toLowerCase()}`} as="span" />, onClick: onBack },
              { label: lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name) }
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-3/5 space-y-6">
            <div className="relative aspect-[3/4] bg-muted overflow-hidden group border border-border shadow-sm rounded-sm">
              {hasImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlaceholder className="w-full h-full" label={t('product_image_coming_soon')} />
              )}

              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-6 pointer-events-none">
                <button
                  onClick={lang === 'ar' ? handleNextImage : handlePrevImage}
                  className="p-4 bg-background/60 backdrop-blur-md hover:bg-secondary text-primary hover:text-secondary-foreground rounded-full shadow-lg pointer-events-auto transition-all"
                  aria-label="Previous image"
                >
                  {lang === 'ar' ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
                </button>
                <button
                  onClick={lang === 'ar' ? handlePrevImage : handleNextImage}
                  className="p-4 bg-background/60 backdrop-blur-md hover:bg-secondary text-primary hover:text-secondary-foreground rounded-full shadow-lg pointer-events-auto transition-all"
                  aria-label="Next image"
                >
                  {lang === 'ar' ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
                </button>
              </div>

              <div className="absolute top-6 left-6">
                <Badge className="bg-[#C8A96A] hover:bg-[#b09358] text-white border-none rounded-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  <EditableText k="product_premium_selection" defaultValue="Premium Selection" as="span" />
                </Badge>
              </div>

              <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold text-[#0D0D0D] uppercase border border-[#D8D2C8]">
                {Math.min(selectedImageIdx + 1, displayImages.length)} / {displayImages.length}
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto py-2">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`flex-shrink-0 w-28 aspect-[3/4] border-2 transition-all ${selectedImageIdx === i ? 'border-secondary scale-105 shadow-md' : 'border-border opacity-60 hover:opacity-100'}`}
                >
                  {img ? (
                    <img src={img} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" label={t('product_no_image')} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/5 flex flex-col">
            <div className="space-y-10 sticky top-32">
              <div>
                <p className="text-[10px] font-bold text-[#C8A96A] uppercase tracking-widest mb-4"><EditableText k="product_limitedCollection" as="span" /></p>
                <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#0D0D0D] tracking-tight leading-[1.1] mb-6">
                  {lang === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name)}
                </h1>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"><EditableText k="product_article" as="span" /> {product.code}</span>
                </div>
              </div>

              <Separator className="bg-[#D8D2C8]" />

              <div className="flex items-baseline gap-6 py-2">
                <span className="text-4xl font-serif text-[#0D0D0D] tracking-tight">EGP {product.salePrice.toLocaleString()}</span>
                {product.originalPrice > product.salePrice && (
                  <span className="text-xl text-muted-foreground line-through font-serif">EGP {product.originalPrice.toLocaleString()}</span>
                )}
                <Badge variant="outline" className="text-[#C8A96A] border-[#C8A96A] rounded-none px-3 py-1 uppercase tracking-widest ml-auto">
                  <EditableText k="product_save" as="span" /> {product.discount}%
                </Badge>
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-end border-b border-[#D8D2C8] rounded-none h-auto p-0 bg-transparent">
                  {product.specifications && product.specifications.length > 0 && (
                    <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:text-[#0D0D0D] text-muted-foreground uppercase tracking-widest text-[10px] font-bold px-0 pb-3 ml-6 bg-transparent">
                      <EditableText k="product_tab_specs" as="span" />
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C8A96A] data-[state=active]:text-[#0D0D0D] text-muted-foreground uppercase tracking-widest text-[10px] font-bold px-0 pb-3 ml-6 bg-transparent">
                    <EditableText k="product_tab_description" as="span" />
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-6 animate-in slide-in-from-top-2 duration-500">
                  <p className={`text-muted-foreground text-sm leading-relaxed font-sans ${textAlign}`} dir={dir}>
                    {lang === 'ar' ? (product.description_ar || product.description) : (product.description_en || product.description) || t('product_description_fallback')}
                  </p>
                </TabsContent>

                {product.specifications && (
                  <TabsContent value="specs" className="pt-6 animate-in slide-in-from-top-2 duration-500 space-y-6">
                    {product.specifications.map((section) => (
                      <div key={section.id} className="space-y-3" dir={dir}>
                        <h4 className={`font-bold text-sm text-[#0D0D0D] border-b border-[#D8D2C8] pb-1 w-fit ${textAlign}`}>{lang === 'ar' ? (section.title_ar || section.title) : (section.title_en || section.title)}</h4>
                        <div className="grid grid-cols-1 gap-y-2 text-sm">
                          {section.items.map((item, i) => (
                            <div key={i} className="flex justify-between md:justify-start md:gap-8 border-b border-muted/40 pb-1 last:border-0" dir={dir}>
                              <span className={`text-muted-foreground min-w-[120px] ${textAlign}`}>{lang === 'ar' ? (item.label_ar || item.label) : (item.label_en || item.label)}</span>
                              <span className={`font-medium text-[#0D0D0D] ${textAlign}`}>{lang === 'ar' ? (item.value_ar || item.value) : (item.value_en || item.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                )}
              </Tabs>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-5 tracking-widest"><EditableText k="product_selectColor" as="span" /> <span className="text-primary ml-2">{selectedColor?.name || selectedColor?.hex}</span></p>
                  <div className="flex gap-4">
                    {(product.colors ?? []).map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border transition-all ${selectedColor?.hex === color.hex ? 'border-[#C8A96A] scale-110 ring-1 ring-[#C8A96A]' : 'border-[#D8D2C8] hover:scale-105'}`}
                      >
                        <div className="w-full h-full rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-5">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest"><EditableText k="product_selectSize" as="span" /> <span className="text-primary ml-2">{selectedSize}</span></p>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C8A96A] hover:underline"
                    >
                      <Ruler size={12} /> <EditableText k="product_sizeGuide" as="span" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                    {availableSizes.map((size) => {
                      const variantQty = selectedColor ? getVariantQty(size, selectedColor.hex) : 0;
                      const isUnavailable = variantQty <= 0;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={isUnavailable}
                          className={`py-3 sm:py-4 px-1 text-[10px] sm:text-[11px] font-bold transition-all uppercase tracking-tighter sm:tracking-widest border relative ${isUnavailable
                            ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border line-through'
                            : selectedSize === size
                              ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] shadow-md'
                              : 'bg-transparent text-muted-foreground border-[#D8D2C8] hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
                            }`}
                        >
                          {size}
                          {!isUnavailable && variantQty <= 3 && (
                            <span className="absolute -top-1 sm:-top-1.5 -right-1 sm:-right-1.5 bg-[#C8A96A] text-white text-[7px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded-none">
                              {variantQty}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex gap-5 pt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock || !selectedColor || !selectedSize}
                  className={`flex-grow bg-[#0D0D0D] text-white py-6 font-bold uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2A2A2A]'
                    }`}
                >
                  {outOfStock ? <EditableText k="product_outOfStock" as="span" /> : <EditableText k="product_secureToBag" as="span" />}
                </button>
                <button
                  onClick={() => onToggleWishlist(product)}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`px-8 border transition-all ${isWishlisted ? 'border-[#C8A96A] text-[#C8A96A] bg-[#C8A96A]/5' : 'border-[#D8D2C8] text-muted-foreground hover:border-[#0D0D0D] hover:text-[#0D0D0D]'}`}
                >
                  <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                </button>

              </div>



              {/* Stock Pulse Indicator */}
              {selectedVariantStock > 0 && selectedVariantStock < 5 && (
                <div className="flex items-center gap-2 text-destructive animate-pulse mt-4 bg-destructive/5 p-3 rounded border border-destructive/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    <EditableText k="product_lowStock" as="span" />: <EditableText k="product_only" as="span" /> {selectedVariantStock} <EditableText k="product_left" as="span" />!
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-border pt-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
              <MessageSquare className="text-secondary" /> <EditableText k="product_customerReviews" as="span" />
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">({reviews.length})</span>
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-[#0D0D0D] text-white px-6 py-2 rounded-none font-bold uppercase text-xs tracking-widest hover:bg-[#C8A96A] hover:text-[#0D0D0D] transition-all"
              >
                <EditableText k="product_writeReview" as="span" />
              </button>
            </div>
          </div>

          {showReviewForm && (
            <div className="mb-10">
              <ReviewForm
                productId={product.id}
                onSubmit={handleAddReview}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <ReviewList reviews={reviews} />
        </div>
      </div>

      {
        similarProducts.length > 0 && (
          <div className="mt-20 border-t border-border pt-16 mb-20">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary mb-10 text-center">
              <EditableText k="product_youMightAlsoLike" as="span" />
            </h2>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                {similarProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => onProductClick(p)}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={false}
                    onToggleCompare={onToggleCompare}
                    isCompared={compareList?.some(cp => cp.id === p.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      }


      <ProductModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={isWishlisted} // Note: logic might need to match product
      />

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        product={product}
      />

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border p-5 flex gap-4 shadow-2xl animate-fade-in-up">
        <button
          onClick={() => onToggleWishlist(product)}
          className={`px-5 border-2 rounded-sm transition-all ${isWishlisted ? 'border-secondary text-secondary' : 'border-border text-muted-foreground'}`}
        >
          <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || !selectedColor || !selectedSize}
          className="flex-grow bg-secondary active:bg-primary text-secondary-foreground font-bold uppercase text-xs tracking-widest py-5 rounded-sm shadow-xl"
        >
          <EditableText k="product_secureToBag" as="span" /> • EGP {product.salePrice.toLocaleString()}
        </button>
      </div>
    </div >
  );
};

export default ProductPage;