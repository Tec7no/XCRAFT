import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorageState } from '@/utils/storage';
import { CartItem, Product, OrderItem, PaymentMethod, CustomerInfo, PaymentInfo, User, Discount } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSiteSettings } from '@/config/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CreditCard, Building2, Truck, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { validateStock, decrementStock } from '@/utils/stockUtils';
import CreditCardForm from '@/components/CreditCardForm';
import { processPayment, CardDetails } from '@/services/payment';
import { EditableText } from '@/components/ui/editable-text';
import { Progress } from '@/components/ui/progress';

export default function Checkout() {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { settings } = useSiteSettings();
    const { toast } = useToast();
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    const paymentPhone = settings.contactInfo?.paymentPhone || '01xxxxxxxxx';

    const [cart, setCart] = useStorageState<CartItem[]>('cart', []);
    const [products, setProducts] = useStorageState<Product[]>('products', []);
    const [user] = useStorageState<User | null>('user', null);

    const [customerInfo, setCustomerInfo] = React.useState<CustomerInfo>({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
    });
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cod');
    const [proofImage, setProofImage] = React.useState<string>('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [promoCode, setPromoCode] = React.useState('');
    const [appliedDiscount, setAppliedDiscount] = React.useState<Discount | null>(null);
    const [saveAddress, setSaveAddress] = React.useState(false);
    const [cardDetails, setCardDetails] = React.useState<CardDetails | null>(null);
    const [isCardValid, setIsCardValid] = React.useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);

    const discountAmount = React.useMemo(() => {
        if (!appliedDiscount) return 0;
        if (appliedDiscount.minOrderAmount && subtotal < appliedDiscount.minOrderAmount) return 0;
        if (appliedDiscount.type === 'percentage') return Math.min(subtotal, (subtotal * appliedDiscount.value) / 100);
        return Math.min(subtotal, appliedDiscount.value);
    }, [appliedDiscount, subtotal]);

    const shippingConfig = settings.shippingConfig || { freeShippingThreshold: 1000, processingDays: '1-2', deliveryDays: '3-5', flatRateFee: 50 };
    const delivery = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.flatRateFee;
    const total = Math.max(0, subtotal - discountAmount + delivery);

    const handleApplyCoupon = async () => {
        if (!promoCode.trim()) return;
        try {
            const res = await fetch('http://localhost:5000/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode.trim().toUpperCase(), orderAmount: subtotal }),
            });
            const data = await res.json();
            if (!data.success) {
                toast({ title: "Invalid Coupon", description: data.message, variant: "destructive" });
                return;
            }
            setAppliedDiscount(data.coupon);
            toast({ title: "Coupon Applied!", description: `You saved with ${data.coupon.code}` });
        } catch (err) {
            toast({ title: "Error", description: "Could not validate coupon.", variant: "destructive" });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!customerInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!customerInfo.address.trim()) newErrors.address = 'Address is required';
        if (!customerInfo.city.trim()) newErrors.city = 'City is required';
        if (paymentMethod === 'transfer' && !proofImage) newErrors.proof = 'Payment proof is required for bank transfer';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Error', description: 'Image must be less than 5MB', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setProofImage(reader.result as string);
            setErrors(prev => ({ ...prev, proof: '' }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const stockValidation = validateStock(cart, products);
        if (!stockValidation.valid) {
            toast({ title: 'Stock Issue', description: stockValidation.errors.join('\n'), variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            // 0. Process card payment if needed
            let transactionId: string | undefined;
            let maskedCard: string | undefined;

            if (paymentMethod === 'card') {
                if (!cardDetails || !isCardValid) {
                    toast({ title: 'Invalid Card', description: 'Please check your card details.', variant: 'destructive' });
                    setIsSubmitting(false);
                    return;
                }
                const result = await processPayment(total, cardDetails);
                if (!result.success) {
                    toast({ title: 'Payment Failed', description: result.error || 'Transaction declined.', variant: 'destructive' });
                    setIsSubmitting(false);
                    return;
                }
                transactionId = result.transactionId;
                maskedCard = `**** **** **** ${cardDetails.number.slice(-4)}`;
            }

            // 1. Build order items
            const orderItems: OrderItem[] = cart.map(item => ({
                productId: item.id,
                name: item.name,
                name_ar: item.name_ar,
                name_en: item.name_en,
                code: item.code,
                image: item.images[0] || '',
                size: item.selectedSize,
                color: item.selectedColor,
                colorName: item.colors.find(c => c.hex === item.selectedColor)?.name,
                quantity: item.quantity,
                unitPrice: item.salePrice,
                lineTotal: item.salePrice * item.quantity,
            }));

            // 2. Build payment info
            const payment: PaymentInfo = {
                method: paymentMethod,
                proofImage: paymentMethod === 'transfer' ? proofImage : undefined,
                transactionId,
                maskedCard,
                cardBrand: 'Visa',
            };

            // 3. POST to backend API
            const res = await ordersApi.create({
                items: orderItems,
                customer: customerInfo,
                payment,
                subtotal,
                discount: discountAmount,
                delivery,
                total,
                couponCode: appliedDiscount?.code || null,
            });

            const order = res.order;

            // 4. Save address if requested
            if (saveAddress && user) {
                const { authApi } = await import('@/lib/api');
                const newAddress = {
                    id: crypto.randomUUID(),
                    name: `Address ${(user.addresses?.length || 0) + 1}`,
                    fullName: customerInfo.fullName,
                    phone: customerInfo.phone,
                    address: customerInfo.address,
                    city: customerInfo.city,
                    isDefault: false,
                };
                const updatedAddresses = [...(user.addresses || []), newAddress];
                await authApi.updateProfile({ addresses: updatedAddresses });

                const { setStorageItem } = await import('@/utils/storage');
                setStorageItem('user', { ...user, addresses: updatedAddresses });
            }

            // 5. Decrement stock locally (optimistic)
            const updatedProducts = decrementStock(cart, products);
            setProducts(updatedProducts);

            // 6. Clear cart
            setCart([]);

            toast({ title: 'Order Placed!', description: `Your order #${order.id} is being reviewed.` });
            navigate(`/order-confirmation?orderId=${order.id}`);

        } catch (error: any) {
            console.error('Checkout error:', error);
            toast({ title: 'Error', description: error.message || 'Something went wrong.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6efea] p-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-[#3a2d23] mb-2">{t('checkout_emptyTitle')}</h2>
                <p className="text-[#3a2d23]/70 mb-6">{t('checkout_emptyDesc')}</p>
                <Button onClick={() => navigate('/')} className="bg-[#3a2d23] text-white">
                    {t('checkout_continueShopping')}
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F5F1] py-12 px-4" dir={dir}>
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }}
                    className="mb-8 hover:bg-transparent hover:text-[#C8A96A] p-0 flex gap-2 text-muted-foreground transition-colors uppercase font-bold text-xs tracking-widest"
                >
                    {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    <EditableText k="checkout_backToShop" as="span" />
                </Button>

                <h1 className="text-4xl font-serif font-medium text-[#0D0D0D] uppercase tracking-tighter mb-10">{t('checkout_title')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Information */}
                        <Card className="border-[#D8D2C8] shadow-sm bg-white rounded-xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-[#D8D2C8]/50 pb-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#0D0D0D]">
                                    {t('checkout_customerInfo')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                {user?.addresses && user.addresses.length > 0 && (
                                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {user.addresses.map(a => (
                                            <div
                                                key={a.id}
                                                onClick={() => setCustomerInfo({ ...customerInfo, fullName: a.fullName, phone: a.phone, address: a.address, city: a.city })}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${customerInfo.address === a.address ? 'border-[#C8A96A] bg-[#C8A96A]/5 ring-1 ring-[#C8A96A]' : 'border-[#D8D2C8] hover:border-[#C8A96A]/50 bg-white'}`}
                                            >
                                                <p className="font-bold text-xs uppercase tracking-wide text-[#0D0D0D] mb-1 flex items-center gap-2">
                                                    {customerInfo.address === a.address && <CheckCircle className="w-3 h-3 text-[#C8A96A]" />}
                                                    {a.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1 font-sans">{a.address}</p>
                                                <p className="text-[10px] text-muted-foreground/70 font-sans">{a.city}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 grid grid-cols-2 gap-6 space-y-0">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">First Name</label>
                                            <input type="text" value={customerInfo.fullName.split(' ')[0] || ''} onChange={e => setCustomerInfo(prev => ({ ...prev, fullName: `${e.target.value} ${prev.fullName.split(' ').slice(1).join(' ')}`.trim() }))}
                                                className={`w-full p-3 border rounded-none text-sm bg-transparent ${errors.fullName ? 'border-red-500' : 'border-[#D8D2C8]'} focus:border-[#C8A96A] outline-none transition-colors font-sans`}
                                                placeholder="John" />
                                            {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Last Name</label>
                                            <input type="text" value={customerInfo.fullName.split(' ').slice(1).join(' ') || ''} onChange={e => setCustomerInfo(prev => ({ ...prev, fullName: `${prev.fullName.split(' ')[0] || ''} ${e.target.value}`.trim() }))}
                                                className={`w-full p-3 border rounded-none text-sm bg-transparent border-[#D8D2C8] focus:border-[#C8A96A] outline-none transition-colors font-sans`}
                                                placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('checkout_phoneLabel')}</label>
                                        <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            className={`w-full p-3 border rounded-none text-sm bg-transparent ${errors.phone ? 'border-red-500' : 'border-[#D8D2C8]'} focus:border-[#C8A96A] outline-none transition-colors font-sans`}
                                            placeholder="+20 1xx xxx xxxx" />
                                        {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('checkout_emailLabel')}</label>
                                        <input type="email" value={customerInfo.email}
                                            onFocus={() => { if (!customerInfo.email && user?.email) setCustomerInfo(prev => ({ ...prev, email: user.email })); }}
                                            onChange={e => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full p-3 border border-[#D8D2C8] rounded-none text-sm bg-transparent focus:border-[#C8A96A] outline-none transition-colors font-sans"
                                            placeholder="john@example.com" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('checkout_addressLabel')}</label>
                                        <input type="text" value={customerInfo.address} onChange={e => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                            className={`w-full p-3 border rounded-none text-sm bg-transparent ${errors.address ? 'border-red-500' : 'border-[#D8D2C8]'} focus:border-[#C8A96A] outline-none transition-colors font-sans`}
                                            placeholder="Street, Building, Apartment" />
                                        {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
                                    </div>
                                    {user && (
                                        <div className="md:col-span-2 mt-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" className="accent-[#C8A96A] w-4 h-4 cursor-pointer"
                                                    checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                                                <span className="text-xs font-bold text-muted-foreground group-hover:text-[#C8A96A] transition-colors uppercase tracking-wide">
                                                    {t('checkout_saveAddress')}
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('checkout_cityLabel')}</label>
                                    <input type="text" value={customerInfo.city} onChange={e => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                                        className={`w-full p-3 border rounded-none text-sm bg-transparent ${errors.city ? 'border-red-500' : 'border-[#D8D2C8]'} focus:border-[#C8A96A] outline-none transition-colors font-sans`}
                                        placeholder="Cairo" />
                                    {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card className="border-[#D8D2C8] shadow-sm bg-white rounded-xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-[#D8D2C8]/50 pb-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#0D0D0D]">
                                    {t('checkout_paymentMethod')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-4">
                                <button type="button" onClick={() => setPaymentMethod('cod')}
                                    className={`w-full p-6 border rounded-lg flex items-center gap-6 transition-all ${paymentMethod === 'cod' ? 'border-[#C8A96A] bg-[#C8A96A]/5' : 'border-[#D8D2C8] hover:border-[#C8A96A]/50'}`}>
                                    <Truck className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-[#C8A96A]' : 'text-muted-foreground'}`} />
                                    <div className={`text-left font-sans ${lang === 'ar' ? 'text-right' : ''}`}>
                                        <p className="font-bold text-[#0D0D0D] uppercase text-sm tracking-wide">{t('checkout_cod')}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('checkout_cod_desc')}</p>
                                    </div>
                                </button>

                                <button type="button" onClick={() => setPaymentMethod('transfer')}
                                    className={`w-full p-6 border rounded-lg flex items-center gap-6 transition-all ${paymentMethod === 'transfer' ? 'border-[#C8A96A] bg-[#C8A96A]/5' : 'border-[#D8D2C8] hover:border-[#C8A96A]/50'}`}>
                                    <Building2 className={`w-6 h-6 ${paymentMethod === 'transfer' ? 'text-[#C8A96A]' : 'text-muted-foreground'}`} />
                                    <div className={`text-left font-sans ${lang === 'ar' ? 'text-right' : ''}`}>
                                        <p className="font-bold text-[#0D0D0D] uppercase text-sm tracking-wide">{t('checkout_transfer')}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('checkout_transfer_desc')}</p>
                                    </div>
                                </button>

                                <button type="button" onClick={() => setPaymentMethod('card')}
                                    className={`w-full p-6 border rounded-lg flex items-center gap-6 transition-all ${paymentMethod === 'card' ? 'border-[#C8A96A] bg-[#C8A96A]/5' : 'border-[#D8D2C8] hover:border-[#C8A96A]/50'}`}>
                                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-[#C8A96A]' : 'text-muted-foreground'}`} />
                                    <div className={`text-left font-sans ${lang === 'ar' ? 'text-right' : ''}`}>
                                        <p className="font-bold text-[#0D0D0D] uppercase text-sm tracking-wide">{t('checkout_card')}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('checkout_card_desc')}</p>
                                    </div>
                                </button>

                                {paymentMethod === 'card' && (
                                    <div className="pt-4 animate-in fade-in zoom-in-95">
                                        <CreditCardForm
                                            onChange={(details, isValid) => { setCardDetails(details); setIsCardValid(isValid); }}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                )}
                            </CardContent>

                            {paymentMethod === 'transfer' && (
                                <div className="p-8 bg-[#F8F5F1] border-t border-[#D8D2C8]">
                                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">{t('checkout_uploadProof')}</p>
                                    <p className="text-xs text-[#0D0D0D] mb-4 font-sans border border-[#C8A96A] p-3 rounded inline-block bg-[#C8A96A]/10">
                                        {t('checkout_transferTo')} <span className="font-bold">Instapay/VodafoneCash: {paymentPhone}</span>
                                    </p>
                                    {proofImage ? (
                                        <div className="relative inline-block">
                                            <img src={proofImage} alt="Payment proof" className="max-h-48 rounded border border-[#D8D2C8]" />
                                            <button type="button" onClick={() => setProofImage('')}
                                                className="absolute -top-2 -right-2 bg-[#0D0D0D] text-white p-1 rounded-full hover:bg-red-600 transition-colors">✕</button>
                                        </div>
                                    ) : (
                                        <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${errors.proof ? 'border-red-500 bg-red-50' : 'border-[#D8D2C8] hover:border-[#C8A96A] hover:bg-white'}`}>
                                            <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-[#0D0D0D]">{t('checkout_clickToUpload')}</span>
                                            <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                                        </label>
                                    )}
                                    {errors.proof && <p className="text-red-500 text-[10px] mt-2">{errors.proof}</p>}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="border-[#D8D2C8] shadow-sm bg-white rounded-xl sticky top-4 overflow-hidden">
                            <CardHeader className="bg-white border-b border-[#D8D2C8]/50 pb-6">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-[#0D0D0D]">
                                    {t('checkout_orderSummary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                    {cart.map(item => (
                                        <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 group">
                                            <div className="w-16 h-20 bg-[#F8F5F1] rounded-sm overflow-hidden flex-shrink-0 border border-[#D8D2C8]">
                                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className="text-xs font-bold text-[#0D0D0D] truncate uppercase tracking-wide mb-1">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                                                    {item.selectedSize} / <span className="inline-block w-2 h-2 rounded-full border border-border align-middle ml-1" style={{ backgroundColor: item.selectedColor }}></span>
                                                </p>
                                                <p className="text-xs font-bold text-[#C8A96A]">{item.salePrice.toLocaleString()} × {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="bg-[#D8D2C8] mb-6" />

                                <div className="space-y-3 text-sm">
                                    {subtotal > 0 && (
                                        <div className="mb-6 space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <span className={subtotal >= shippingConfig.freeShippingThreshold ? "text-green-600" : "text-muted-foreground"}>
                                                    {subtotal >= shippingConfig.freeShippingThreshold
                                                        ? t('cart_shipping_unlocked')
                                                        : <span dangerouslySetInnerHTML={{ __html: t('cart_shipping_remaining').replace('{{amount}}', `${(shippingConfig.freeShippingThreshold - subtotal).toLocaleString()} EGP`) }} />}
                                                </span>
                                                <span className="text-muted-foreground">{Math.round(Math.min(100, (subtotal / shippingConfig.freeShippingThreshold) * 100))}%</span>
                                            </div>
                                            <Progress value={Math.min(100, (subtotal / shippingConfig.freeShippingThreshold) * 100)} className="h-1.5 bg-[#F8F5F1]" />
                                        </div>
                                    )}

                                    <div className="flex gap-2 mb-6">
                                        <input placeholder="Promo Code" value={promoCode} onChange={e => setPromoCode(e.target.value)}
                                            disabled={!!appliedDiscount}
                                            className="flex-1 bg-white border border-[#D8D2C8] rounded-none px-3 py-2 text-xs uppercase font-bold outline-none focus:border-[#C8A96A] transition-colors" />
                                        {appliedDiscount ? (
                                            <Button onClick={() => { setAppliedDiscount(null); setPromoCode(''); }} variant="outline" className="text-destructive h-[38px] px-3 border-[#D8D2C8] rounded-none hover:bg-destructive/10">✕</Button>
                                        ) : (
                                            <Button onClick={handleApplyCoupon} className="bg-[#0D0D0D] text-white h-[38px] text-[10px] uppercase font-black tracking-widest rounded-none hover:bg-[#C8A96A] hover:text-[#0D0D0D]">{t('checkout_applyCoupon')}</Button>
                                        )}
                                    </div>

                                    <div className="flex justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                        <span>{t('cart_subtotal')}</span>
                                        <span className="font-mono text-[#0D0D0D]">{subtotal.toLocaleString()} EGP</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-[#C8A96A] font-bold text-xs uppercase tracking-wider">
                                            <span>Discount ({appliedDiscount?.code})</span>
                                            <span className="font-mono">-{discountAmount.toLocaleString()} EGP</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                        <span>{t('orders_delivery')}</span>
                                        {delivery === 0 ? <span className="text-[#C8A96A]">FREE</span> : <span className="font-mono text-[#0D0D0D]">{delivery.toLocaleString()} EGP</span>}
                                    </div>

                                    <Separator className="bg-[#D8D2C8] my-4" />

                                    <div className="flex justify-between font-black text-xl text-[#0D0D0D]">
                                        <span className="font-serif tracking-tighter">{t('checkout_total')}</span>
                                        <span className="font-serif tracking-tighter text-[#C8A96A]">{total.toLocaleString()} EGP</span>
                                    </div>
                                </div>

                                <Button onClick={handleSubmit} disabled={isSubmitting}
                                    className="w-full mt-8 bg-[#0D0D0D] hover:bg-[#C8A96A] hover:text-[#0D0D0D] text-white py-6 font-black uppercase tracking-widest rounded-sm transition-all shadow-lg active:scale-95">
                                    {isSubmitting ? 'Processing...' : t('checkout_placeOrder')}
                                </Button>
                                <p className="text-[9px] text-center text-muted-foreground/50 mt-4 uppercase tracking-widest">
                                    {t('checkout_secure')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
