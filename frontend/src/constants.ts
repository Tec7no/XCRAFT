import { Product, Category, ColorOption, StockByColor } from './types';

export const CATEGORIES: Category[] = ['Men', 'Kids', 'Women'];

export const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1a2b56' },
  { name: 'Orange', hex: '#f37021' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Brown', hex: '#8b5a2b' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Burgundy', hex: '#722f37' },
  { name: 'Cream', hex: '#fffdd0' },
  { name: 'Charcoal', hex: '#36454f' },
];

// Helper to create color options with stockByColor
const createColorsWithStock = (hexes: string[], stockPerColor: number): { colors: ColorOption[]; stockByColor: StockByColor; totalStock: number } => {
  const colors = hexes.map(hex => {
    const match = COLORS.find(c => c.hex === hex);
    return { hex: hex.toLowerCase(), name: match?.name };
  });
  const stockByColor: StockByColor = {};
  colors.forEach(c => {
    stockByColor[c.hex] = stockPerColor;
  });
  return { colors, stockByColor, totalStock: colors.length * stockPerColor };
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'SHIRT001',
    name: 'قميص رجالي بارز الملمس بقصة عادية',
    name_ar: 'قميص رجالي بارز الملمس بقصة عادية',
    name_en: "Men's Regular Fit Textured Shirt",
    code: 'SHIRT001',
    category: 'Men',
    originalPrice: 1000,
    salePrice: 900,
    discount: 10,
    description: 'قميص رجالي بارز الملمس بقصة عادية وأكمام قصيرة وياقة ضيقة. مصنوع من مزيج قطني فاخر يوفر راحة استثنائية وملمس مميز. التصميم العصري يجمع بين الأناقة والراحة، مثالي للارتداء اليومي أو المناسبات غير الرسمية. يتميز بخامة بارزة الملمس تضيف بعداً جمالياً للقميص، مع ياقة ضيقة عصرية وأكمام قصيرة مريحة.',
    description_ar: 'قميص رجالي بارز الملمس بقصة عادية وأكمام قصيرة وياقة ضيقة. مصنوع من مزيج قطني فاخر يوفر راحة استثنائية وملمس مميز. التصميم العصري يجمع بين الأناقة والراحة، مثالي للارتداء اليومي أو المناسبات غير الرسمية. يتميز بخامة بارزة الملمس تضيف بعداً جمالياً للقميص، مع ياقة ضيقة عصرية وأكمام قصيرة مريحة.',
    description_en: "Men's regular fit textured shirt with short sleeves and a narrow collar. Made from a premium cotton blend that provides exceptional comfort and a distinct feel. The contemporary design combines style and comfort, perfect for everyday wear or casual occasions. It features a textured fabric that adds an aesthetic dimension, with a modern slim collar and comfortable short sleeves.",
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
        title_ar: 'الخامة',
        title_en: 'Material',
        items: [
          { label: 'نوع القماش', label_ar: 'نوع القماش', label_en: 'Fabric Type', value: 'قطن 60%، بوليستر 40%', value_ar: 'قطن 60%، بوليستر 40%', value_en: '60% Cotton, 40% Polyester' },
          { label: 'الملمس', label_ar: 'الملمس', label_en: 'Texture', value: 'بارز الملمس', value_ar: 'بارز الملمس', value_en: 'Textured' },
          { label: 'الوزن', label_ar: 'الوزن', label_en: 'Weight', value: 'متوسط', value_ar: 'متوسط', value_en: 'Medium' }
        ]
      },
      {
        id: '2',
        title: 'التصميم',
        title_ar: 'التصميم',
        title_en: 'Design',
        items: [
          { label: 'القصة', label_ar: 'القصة', label_en: 'Fit', value: 'قصة عادية', value_ar: 'قصة عادية', value_en: 'Regular Fit' },
          { label: 'الأكمام', label_ar: 'الأكمام', label_en: 'Sleeves', value: 'أكمام قصيرة', value_ar: 'أكمام قصيرة', value_en: 'Short Sleeves' },
          { label: 'الياقة', label_ar: 'الياقة', label_en: 'Collar', value: 'ياقة ضيقة', value_ar: 'ياقة ضيقة', value_en: 'Narrow Collar' },
          { label: 'الإغلاق', label_ar: 'الإغلاق', label_en: 'Closure', value: 'أزرار أمامية', value_ar: 'أزرار أمامية', value_en: 'Front Buttons' }
        ]
      },
      {
        id: '3',
        title: 'العناية',
        title_ar: 'العناية',
        title_en: 'Care',
        items: [
          { label: 'الغسيل', label_ar: 'الغسيل', label_en: 'Washing', value: 'غسيل آلي عادي', value_ar: 'غسيل آلي عادي', value_en: 'Normal Machine Wash' },
          { label: 'الكي', label_ar: 'الكي', label_en: 'Ironing', value: 'كي على حرارة عادية', value_ar: 'كي على حرارة عادية', value_en: 'Normal Ironing' },
          { label: 'التجفيف', label_ar: 'التجفيف', label_en: 'Drying', value: 'يجفف بشكل طبيعي', value_ar: 'يجفف بشكل طبيعي', value_en: 'Air Dry' }
        ]
      },
      {
        id: '4',
        title: 'مواصفات إضافية',
        title_ar: 'مواصفات إضافية',
        title_en: 'Additional Specs',
        items: [
          { label: 'المناسبة', label_ar: 'المناسبة', label_en: 'Occasion', value: 'كاجوال - يومي', value_ar: 'كاجوال - يومي', value_en: 'Casual - Daily' },
          { label: 'الموسم', label_ar: 'الموسم', label_en: 'Season', value: 'جميع الفصول', value_ar: 'جميع الفصول', value_en: 'All Seasons' },
          { label: 'بلد المنشأ', label_ar: 'بلد المنشأ', label_en: 'Country of Origin', value: 'مصر', value_ar: 'مصر', value_en: 'Egypt' }
        ]
      }
    ],
    featuredIn: ['New Arrivals', 'Best Sellers']
  },
  {
    id: 'DRESS_001',
    name: 'فستان قميص ميدي بحزام وجيوب من أيكونيك',
    name_ar: 'فستان قميص ميدي بحزام وجيوب من أيكونيك',
    name_en: 'Iconic Belted Midi Shirt Dress with Pockets',
    code: 'DRESS_001',
    category: 'Women',
    originalPrice: 1400,
    salePrice: 1120,
    discount: 20,
    description: 'اكتشفي الأناقة العملية مع هذا الفستان القميص الميدي متعدد الاستخدامات. يتميز بتصميم كلاسيكي، خصر بحزام قابل للتعديل، وجيوب جانبية عملية، مما يمنحك إطلالة راقية ومريحة، مثالية لمختلف المناسبات، ويجمع بين الأناقة والراحة الفائقة.',
    description_ar: 'اكتشفي الأناقة العملية مع هذا الفستان القميص الميدي متعدد الاستخدامات. يتميز بتصميم كلاسيكي، خصر بحزام قابل للتعديل، وجيوب جانبية عملية، مما يمنحك إطلالة راقية ومريحة، مثالية لمختلف المناسبات، ويجمع بين الأناقة والراحة الفائقة.',
    description_en: 'Discover practical elegance with this versatile midi shirt dress. Featuring a classic design, an adjustable belted waist, and practical side pockets, it gives you a sophisticated and comfortable look perfect for various occasions. It combines style and ultimate comfort.',
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
        title_ar: 'الخامة',
        title_en: 'Material',
        items: [
          { label: 'نوع الإعدادات', label_ar: 'نوع الإعدادات', label_en: 'Settings Type', value: 'مزيج فيسكوز', value_ar: 'مزيج فيسكوز', value_en: 'Viscose Blend' },
          { label: 'تركيبة الخامة', label_ar: 'تركيبة الخامة', label_en: 'Composition', value: '83% فيسكوز، 12% بوليستر، 5% كتان', value_ar: '83% فيسكوز، 12% بوليستر، 5% كتان', value_en: '83% Viscose, 12% Polyester, 5% Linen' }
        ]
      },
      {
        id: '2',
        title: 'المواصفات العامة',
        title_ar: 'المواصفات العامة',
        title_en: 'General Specs',
        items: [
          { label: 'طول الأكمام', label_ar: 'طول الأكمام', label_en: 'Sleeve Length', value: 'أكمام قصيرة', value_ar: 'أكمام قصيرة', value_en: 'Short Sleeves' },
          { label: 'الياقة', label_ar: 'الياقة', label_en: 'Collar', value: 'ياقة عادية', value_ar: 'ياقة عادية', value_en: 'Regular Collar' },
          { label: 'التصميم', label_ar: 'التصميم', label_en: 'Design', value: 'سادة', value_ar: 'سادة', value_en: 'Plain' },
          { label: 'المناسبة', label_ar: 'المناسبة', label_en: 'Occasion', value: 'كاجوال | ملابس العمل', value_ar: 'كاجوال | ملابس العمل', value_en: 'Casual | Workwear' },
          { label: 'الأسلوب', label_ar: 'الأسلوب', label_en: 'Style', value: 'بحزام | فستان قميص', value_ar: 'بحزام | فستان قميص', value_en: 'Belted | Shirt Dress' }
        ]
      },
      {
        id: '3',
        title: 'مواصفات أخرى',
        title_ar: 'مواصفات أخرى',
        title_en: 'Other Specs',
        items: [
          { label: 'الطول', label_ar: 'الطول', label_en: 'Length', value: 'متوسط الطول', value_ar: 'متوسط الطول', value_en: 'Midi' },
          { label: 'نوع المقاس', label_ar: 'نوع المقاس', label_en: 'Fit Type', value: 'عادي', value_ar: 'عادي', value_en: 'Regular' },
          { label: 'نوع الأكمام', label_ar: 'نوع الأكمام', label_en: 'Sleeve Type', value: 'أكمام منسدلة', value_ar: 'أكمام منسدلة', value_en: 'Dropped Shoulders' },
          { label: 'العارضة', label_ar: 'العارضة', label_en: 'Model', value: 'محيط الصدر 86 سم، الخصر 63 سم، الورك 96 سم', value_ar: 'محيط الصدر 86 سم، الخصر 63 سم، الورك 96 سم', value_en: 'Bust 86cm, Waist 63cm, Hips 96cm' }
        ]
      }
    ],
    featuredIn: ['Best Sellers']
  },
  {
    id: 'CHEL_001',
    name: 'تيشيرت بطبعات شعار وأكمام قصيرة من بوما',
    name_ar: 'تيشيرت بطبعات شعار وأكمام قصيرة من بوما',
    name_en: 'Puma Logo Print Short Sleeve T-Shirt',
    code: 'CHEL_001',
    category: 'Kids',
    originalPrice: 800,
    salePrice: 740,
    discount: 7.5,
    description: 'هذا التيشيرت المصمم بطبعات شعار مصنوع من قطن ناعم ومسامي، ليضمن راحة طوال اليوم. أكمامه القصيرة مثالية للأجواء الدافئة. يتميز بطبعاته الأنيقة، ويضفي لمسة عصرية ومريحة على أي إطلالة.',
    description_ar: 'هذا التيشيرت المصمم بطبعات شعار مصنوع من قطن ناعم ومسامي، ليضمن راحة طوال اليوم. أكمامه القصيرة مثالية للأجواء الدافئة. يتميز بطبعاته الأنيقة، ويضفي لمسة عصرية ومريحة على أي إطلالة.',
    description_en: 'This logo print t-shirt is made from soft and breathable cotton, ensuring all-day comfort. Its short sleeves are perfect for warm weather. Featuring stylish prints, it adds a modern and comfortable touch to any look.',
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
        title_ar: 'الخامة',
        title_en: 'Material',
        items: [
          { label: 'نوع الإعدادات', label_ar: 'نوع الإعدادات', label_en: 'Settings Type', value: 'قطن', value_ar: 'قطن', value_en: 'Cotton' }
        ]
      },
      {
        id: '2',
        title: 'المواصفات العامة',
        title_ar: 'المواصفات العامة',
        title_en: 'General Specs',
        items: [
          { label: 'الجنس', label_ar: 'الجنس', label_en: 'Gender', value: 'البنات', value_ar: 'البنات', value_en: 'Girls' },
          { label: 'النوع', label_ar: 'النوع', label_en: 'Type', value: 'تيشيرتات', value_ar: 'تيشيرتات', value_en: 'T-Shirts' },
          { label: 'طول الأكمام', label_ar: 'طول الأكمام', label_en: 'Sleeve Length', value: 'أكمام قصيرة', value_ar: 'أكمام قصيرة', value_en: 'Short Sleeves' },
          { label: 'الياقة', label_ar: 'الياقة', label_en: 'Collar', value: 'ياقة ضيقة', value_ar: 'ياقة ضيقة', value_en: 'Narrow Collar' },
          { label: 'التصميم', label_ar: 'التصميم', label_en: 'Design', value: 'سادة', value_ar: 'سادة', value_en: 'Plain' },
          { label: 'الاستخدام', label_ar: 'الاستخدام', label_en: 'Use', value: 'ملابس رياضية', value_ar: 'ملابس رياضية', value_en: 'Sportswear' },
          { label: 'الفئة العمرية', label_ar: 'الفئة العمرية', label_en: 'Age Group', value: 'البنات اليافعات (4-16 سنة)', value_ar: 'البنات اليافعات (4-16 سنة)', value_en: 'Teen Girls (4-16 years)' }
        ]
      }
    ],
    featuredIn: ['New Arrivals']
  }
];
