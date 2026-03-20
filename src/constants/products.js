// Product data with real jacket/hoodie images from Unsplash
export const PRODUCTS = [
  // JACKETS
  {
    id: 'leather-moto',
    name: 'Full-Grain Leather Moto Jacket',
    shortName: 'Moto Legend',
    category: 'jacket',
    basePrice: 389,
    originalPrice: 499,
    description: 'Heavyweight full-grain cowhide moto jacket with asymmetric zip, quilted shoulder panels, and custom antique-brass hardware. Guaranteed to last 30 years.',
    photos: [
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80',
    colors: [
      { name: 'Classic Black',   body: '#111111', sleeve: '#111111', hex: '#111111' },
      { name: 'Cognac Brown',    body: '#8b5e3c', sleeve: '#8b5e3c', hex: '#8b5e3c' },
      { name: 'Oxblood Red',     body: '#5a1a1a', sleeve: '#5a1a1a', hex: '#5a1a1a' },
    ],
    materials: { body: 'full-grain-leather', sleeve: 'full-grain-leather' },
    specs: { closure: 'Asymmetric YKK Zipper', materials: 'Full-Grain Cowhide', weight: '1.4kg', origin: 'Made in Italy' },
    tags: ['premium', 'bestseller'],
  },
];

export const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

export const getProductById = (id) => PRODUCTS.find(p => p.id === id);
