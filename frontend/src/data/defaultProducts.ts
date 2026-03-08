import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
    {
        id: 'SHIRT001',
        name: 'قميص رجالي بارز الملمس بقصة عادية',
        code: 'SHIRT001',
        category: 'Men',
        originalPrice: 1000,
        salePrice: 900,
        discount: 10,
        description: 'قميص رجالي بارز الملمس بقصة عادية وأكمام قصيرة وياقة ضيقة. مصنوع من مزيج قطني فاخر يوفر راحة استثنائية وملمس مميز. التصميم العصري يجمع بين الأناقة والراحة، مثالي للارتداء اليومي أو المناسبات غير الرسمية. يتميز بخامة بارزة الملمس تضيف بعداً جمالياً للقميص، مع ياقة ضيقة عصرية وأكمام قصيرة مريحة.',
        images: [
            '/images/black_frontmen1.webp',
            '/images/black_backmen1.jpg.webp',
            '/images/white_frontmen1.png.webp',
            '/images/white_backmen1.png.webp'
        ],
        sizeGuideImage: '/images/sizemen.png.jpg',
        colors: [
            {
                hex: '#000000',
                name: 'Black',
                image: '/images/black_frontmen1.webp'
            },
            {
                hex: '#f6efea',
                name: 'Off White',
                image: '/images/white_frontmen1.png.webp'
            }
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        variantStock: {
            'S__#000000': 10,
            'M__#000000': 15,
            'L__#000000': 15,
            'XL__#000000': 15,
            'S__#f6efea': 10,
            'M__#f6efea': 15,
            'L__#f6efea': 15,
            'XL__#f6efea': 15
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
        ]
    },
    {
        id: 'DRESS_001',
        name: 'فستان قميص ميدي بحزام وجيوب من أيكونيك',
        code: 'DRESS_001',
        category: 'Women',
        originalPrice: 1400,
        salePrice: 1120,
        discount: 20,
        description: 'اكتشفي الأناقة العملية مع هذا الفستان القميص الميدي متعدد الاستخدامات. يتميز بتصميم كلاسيكي، خصر بحزام قابل للتعديل، وجيوب جانبية عملية، مما يمنحك إطلالة راقية ومريحة، مثالية لمختلف المناسبات، ويجمع بين الأناقة والراحة الفائقة.',
        images: [
            '/images/black_frontwomen1.png',
            '/images/black_backwomen1.png',
            '/images/browen_frontwomen1.png',
            '/images/browen_backwomen1.png'
        ],
        sizeGuideImage: '/images/sizewoman.png',
        colors: [
            {
                hex: '#000000',
                name: 'Black',
                image: '/images/black_frontwomen1.png'
            },
            {
                hex: '#8b5a2b',
                name: 'Brown',
                image: '/images/browen_frontwomen1.png'
            }
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        variantStock: {
            'S__#000000': 10,
            'M__#000000': 15,
            'L__#000000': 15,
            'XL__#000000': 15,
            'S__#8b5a2b': 10,
            'M__#8b5a2b': 15,
            'L__#8b5a2b': 15,
            'XL__#8b5a2b': 15
        },
        stock: 120,
        specifications: [
            {
                id: '1',
                title: 'الخامة',
                items: [
                    { label: 'نوع الإعدادات', value: 'مزيج فيسكوز' },
                    { label: 'تركيبة الخامة', value: '83% فيسكوز، 12% بوليستر، 5% كتان' }
                ]
            },
            {
                id: '2',
                title: 'المواصفات العامة',
                items: [
                    { label: 'طول الأكمام', value: 'أكمام قصيرة' },
                    { label: 'الياقة', value: 'ياقة عادية' },
                    { label: 'التصميم', value: 'سادة' },
                    { label: 'المناسبة', value: 'كاجوال | ملابس العمل' },
                    { label: 'الأسلوب', value: 'بحزام | فستان قميص' }
                ]
            },
            {
                id: '3',
                title: 'مواصفات أخرى',
                items: [
                    { label: 'الطول', value: 'متوسط الطول' },
                    { label: 'نوع المقاس', value: 'عادي' },
                    { label: 'نوع الأكمام', value: 'أكمام منسدلة' },
                    { label: 'العارضة', value: 'محيط الصدر 86 سم، الخصر 63 سم، الورك 96 سم' }
                ]
            }
        ]
    },
    {
        id: 'CHEL_001',
        name: 'تيشيرت بطبعات شعار وأكمام قصيرة من بوما',
        code: 'CHEL_001',
        category: 'Kids',
        originalPrice: 800,
        salePrice: 740,
        discount: 7.5,
        description: 'هذا التيشيرت المصمم بطبعات شعار مصنوع من قطن ناعم ومسامي، ليضمن راحة طوال اليوم. أكمامه القصيرة مثالية للأجواء الدافئة. يتميز بطبعاته الأنيقة، ويضفي لمسة عصرية ومريحة على أي إطلالة.',
        images: [
            '/images/FRONTCH.png',
            '/images/SIDECH.png'
        ],
        sizeGuideImage: '/images/SIZECH.png',
        colors: [
            {
                hex: '#ffffff',
                name: 'White',
                image: '/images/FRONTCH.png'
            }
        ],
        sizes: ['4-6Y', '6-8Y', '8-10Y', '10-12Y', '12-14Y', '14-16Y'],
        variantStock: {
            '4-6Y__#ffffff': 10,
            '6-8Y__#ffffff': 15,
            '8-10Y__#ffffff': 15,
            '10-12Y__#ffffff': 15,
            '12-14Y__#ffffff': 15,
            '14-16Y__#ffffff': 15
        },
        stock: 85,
        specifications: [
            {
                id: '1',
                title: 'الخامة',
                items: [
                    { label: 'نوع الإعدادات', value: 'قطن' }
                ]
            },
            {
                id: '2',
                title: 'المواصفات العامة',
                items: [
                    { label: 'الجنس', value: 'البنات' },
                    { label: 'النوع', value: 'تيشيرتات' },
                    { label: 'طول الأكمام', value: 'أكمام قصيرة' },
                    { label: 'الياقة', value: 'ياقة ضيقة' },
                    { label: 'التصميم', value: 'سادة' },
                    { label: 'الاستخدام', value: 'ملابس رياضية' },
                    { label: 'الفئة العمرية', value: 'البنات اليافعات (4-16 سنة)' }
                ]
            }
        ]
    }
];
