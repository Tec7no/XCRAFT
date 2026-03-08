// Add New Product Script - Run this in browser console
// Product: Men's Textured Regular Fit Shirt (SHIRT001)

const newProduct = {
    id: 'SHIRT001',
    name: 'قميص رجالي بارز الملمس بقصة عادية',
    category: 'men',
    price: 1000,
    salePrice: 900,
    discount: 10,
    description: 'قميص رجالي بارز الملمس بقصة عادية وأكمام قصيرة وياقة ضيقة. مصنوع من مزيج قطني فاخر يوفر راحة استثنائية وملمس مميز. التصميم العصري يجمع بين الأناقة والراحة، مثالي للارتداء اليومي أو المناسبات غير الرسمية. يتميز بخامة بارزة الملمس تضيف بعداً جمالياً للقميص، مع ياقة ضيقة عصرية وأكمام قصيرة مريحة.',
    images: [
        'https://i.postimg.cc/W3yNJKXq/black-front.jpg',
        'https://i.postimg.cc/9FZKvYqL/white-front.jpg',
        'https://i.postimg.cc/L8nKJYmK/black-back.jpg',
        'https://i.postimg.cc/MKqJ9YLp/white-back.jpg'
    ],
    sizeGuideImage: 'https://i.postimg.cc/9fXqK8Lm/size-guide.jpg',
    colors: [
        {
            hex: '#000000',
            name: 'Black',
            image: 'https://i.postimg.cc/W3yNJKXq/black-front.jpg'
        },
        {
            hex: '#f6efea',
            name: 'Off White',
            image: 'https://i.postimg.cc/9FZKvYqL/white-front.jpg'
        }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variantStock: {
        'S|#000000': 10,
        'M|#000000': 15,
        'L|#000000': 15,
        'XL|#000000': 15,
        'S|#f6efea': 10,
        'M|#f6efea': 15,
        'L|#f6efea': 15,
        'XL|#f6efea': 15
    },
    stock: 120,
    specifications: [
        {
            id: '1',
            title: 'الخامة',
            items: [
                { label: 'نوع القماش', value: 'قطن 60%، بوليستر 40%' },
                { label: 'الملمس', value: 'بارز الملمس' },
                { label: 'الوزن', value: 'متوسط' }
            ]
        },
        {
            id: '2',
            title: 'التصميم',
            items: [
                { label: 'القصة', value: 'قصة عادية' },
                { label: 'الأكمام', value: 'أكمام قصيرة' },
                { label: 'الياقة', value: 'ياقة ضيقة' },
                { label: 'الإغلاق', value: 'أزرار أمامية' }
            ]
        },
        {
            id: '3',
            title: 'العناية',
            items: [
                { label: 'الغسيل', value: 'غسيل آلي عادي' },
                { label: 'الكي', value: 'كي على حرارة عادية' },
                { label: 'التجفيف', value: 'يجفف بشكل طبيعي' }
            ]
        },
        {
            id: '4',
            title: 'مواصفات إضافية',
            items: [
                { label: 'المناسبة', value: 'كاجوال - يومي' },
                { label: 'الموسم', value: 'جميع الفصول' },
                { label: 'بلد المنشأ', value: 'مصر' }
            ]
        }
    ],
    featured: false,
    isNew: true,
    createdAt: new Date().toISOString()
};

// Get existing products from localStorage
const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');

// Check if product already exists
const existingIndex = existingProducts.findIndex(p => p.id === 'SHIRT001');

if (existingIndex >= 0) {
    // Update existing product
    existingProducts[existingIndex] = newProduct;
    console.log('✅ Product SHIRT001 updated successfully!');
} else {
    // Add new product
    existingProducts.push(newProduct);
    console.log('✅ Product SHIRT001 added successfully!');
}

// Save back to localStorage
localStorage.setItem('products', JSON.stringify(existingProducts));

console.log('📦 Total products:', existingProducts.length);
console.log('🆕 New product:', newProduct);

// Trigger storage event to update UI
window.dispatchEvent(new Event('storage'));

console.log('🔄 Page will reload to show new product...');
setTimeout(() => window.location.reload(), 1000);
