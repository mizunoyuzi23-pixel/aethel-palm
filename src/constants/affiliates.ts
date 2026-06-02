export type AffiliateOffer = {
  id: string;
  category: 'career' | 'love' | 'finance' | 'wellness' | 'general';
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  url: string;
  url_en: string;
  ctaText: string;
  ctaText_en: string;
  imageUrl?: string;
  keywords: string[]; // マッチング用のキーワード（例: ['転職', '副業', '才能']）
};

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: 'career_1',
    category: 'career',
    title: '星の転機：キャリア相談',
    title_en: 'Celestial Shift: Career Consulting',
    description: 'あなたの才能を最も活かせる場所を探してみませんか？新たな門出をサポートするサイトです。',
    description_en: 'Discover the place where your talents shine brightest. A site to support your new beginnings.',
    url: 'https://example.com/jp-career',
    url_en: 'https://example.com/en-career',
    ctaText: '新たな可能性を見る',
    ctaText_en: 'Explore New Possibilities',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    keywords: ['仕事', '転職', 'キャリア', '就職', '才能', 'ビジネス', 'work', 'career', 'job', 'talent']
  },
  {
    id: 'love_1',
    category: 'love',
    title: '響き合う魂の出会い',
    title_en: 'Resonance of Souls',
    description: '星が結ぶのは運命だけではありません。新しい一歩を踏み出すための出会いの場をご紹介します。',
    description_en: 'Stars connect more than just destiny. Discover a space for new encounters and soul-deep connections.',
    url: 'https://example.com/jp-love',
    url_en: 'https://example.com/en-love',
    ctaText: '運命を探す',
    ctaText_en: 'Find Your Destiny',
    imageUrl: 'https://images.unsplash.com/photo-1511113211533-3a13769136e0?auto=format&fit=crop&q=80&w=800',
    keywords: ['恋愛', '結婚', '出会い', '恋', '片思い', '復縁', 'love', 'romance', 'marriage', 'dating']
  },
  {
    id: 'finance_1',
    category: 'finance',
    title: '金運開花：資産形成の第一歩',
    title_en: 'Financial Bloom: First Step to Wealth',
    description: 'あなたの財運線が示す可能性を、現実の資産へ。副業・投資の入口をご紹介します。',
    description_en: 'Turn the potential in your finance line into real assets. Discover side hustles and investment entry points.',
    url: 'https://example.com/jp-finance',
    url_en: 'https://example.com/en-finance',
    ctaText: '金運の扉を開く',
    ctaText_en: 'Open the Door to Wealth',
    keywords: ['お金', '収入', '副業', '投資', '貯金', '節約', '借金', '給料', 'money', 'income', 'investment', 'savings']
  },
  {
    id: 'wellness_1',
    category: 'wellness',
    title: '心と体を癒やす星の雫',
    title_en: 'Drops of Starlight: Wellness',
    description: '日々の疲れを癒やし、魂の輝きを取り戻すためのアイテムをご提案します。',
    description_en: 'Heal your daily fatigue and reclaim the brilliance of your soul with our curated wellness recommendations.',
    url: 'https://example.com/jp-wellness',
    url_en: 'https://example.com/en-wellness',
    ctaText: '詳しく見る',
    ctaText_en: 'Learn More',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    keywords: ['健康', '癒やし', '体', '美容', 'リラックス', 'サプリ', 'health', 'wellness', 'heal', 'relax', 'beauty']
  },
  {
    id: 'general_1',
    category: 'general',
    title: '真実の道：プレミアム鑑定',
    title_en: 'Path of Truth: Premium Reading',
    description: 'より深く、個人的な星の導きを求める方へ。専門家による詳細な鑑定をご依頼いただけます。',
    description_en: 'For those seeking deeper, more personal celestial guidance. Request a detailed reading from a master oracle.',
    url: 'https://example.com/premium-divination-jp',
    url_en: 'https://example.com/premium-divination-en',
    ctaText: '詳細な鑑定を依頼する',
    ctaText_en: 'Request Premium Reading',
    keywords: ['占い', '鑑定', '詳細', '悩み', '解決', 'fortune', 'reading', 'oracle', 'solve']
  }
];

