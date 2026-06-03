export type AffiliateOffer = {
  id: string;
  category: 'career' | 'love' | 'finance' | 'wellness' | 'fortune';
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
  trackingPixel?: string;
};

export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: 'dental_hygienist_1',
    category: 'career',
    title: '純白の息吹：歯科衛生士の天職航路',
    title_en: 'Holy Breath: Dental Hygienist Destiny',
    description: '美しく健やかな微笑みを守り、人々に健康という名の光を届ける高貴な役割。あなたの繊細な技と温かな気遣いで、最も輝けるステージを見つけてみませんか？【ファーストナビ歯科衛生士】',
    description_en: 'A beautiful and pure mission of protecting healthy smiles and spreading the light of wellness. Discover the finest clinical matches that appreciate your gentle touch and dental dedication with First Navi.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+5LU162+39E4+BWVTE',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+5LU162+39E4+BWVTE',
    ctaText: '輝ける歯科求人を探す',
    ctaText_en: 'Explore Pure Dental Clinics',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    keywords: ['歯科衛生士', '歯科', '歯医者', 'デンタル', 'デンタルクリニック', '衛生士', 'ファーストナビ', '歯科助手', 'デンティスト', '歯磨き', '口腔', '予防歯科', 'クリーニング', 'dental', 'hygienist', 'dentistry', 'teeth', 'clinic', 'oral', 'smile', 'hygiene'],
    trackingPixel: 'https://www13.a8.net/0.gif?a8mat=2NWYNR+5LU162+39E4+BWVTE'
  },
  {
    id: 'doctor_temp_1',
    category: 'career',
    title: '命の神職：医師バイト・スポットの軌跡',
    title_en: 'Guardian of Life: Physician Locum & Part-time Path',
    description: '生命の鼓動を調律し、この世に奇跡をもたらす高潔な医師の魂。最新のスポット・非常勤案件のトレンドに触れ、あなたの崇高な力を最も必要とされる場所で輝かせませんか？',
    description_en: 'A profound soul tuning the heartbeats of life. Align with the newest premium locum and part-time trends, and direct your noble medical craft wherever it is most needed.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNQ+CLOE22+24CC+CADXE',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNQ+CLOE22+24CC+CADXE',
    ctaText: '最新トレンドと非公開案件を見る',
    ctaText_en: 'Explore Premium Physician Spots',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    keywords: ['医師', 'ドクター', '医者', 'バイト', '非常勤', 'スポット', '当直', '健診', '外来', '臨床', '医学', '処方', 'クリニック', 'hospital', 'doctor', 'physician', 'locum', 'spot', 'part-time', 'medical', 'clinic', 'dentist'],
    trackingPixel: 'https://www13.a8.net/0.gif?a8mat=2NWYNQ+CLOE22+24CC+CADXE'
  },
  {
    id: 'nurse_1',
    category: 'career',
    title: '聖なる癒やし手：看護師派遣の歩み',
    title_en: 'Holy Healer: Nursing Dispatch Path',
    description: '人々を癒やし救う尊いお仕事。あなたの輝く技術と優しさを、ライフスタイルに合わせた自由な働き方で活かしませんか？【レバウェル看護 派遣】',
    description_en: 'A noble quest of healing and saving lives. Bring your radiant skill and warmth to flexible work styles tailored to your destiny with Leverages Nursing.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+2Q8KD6+2JK4+1ZJ8C2',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+2Q8KD6+2JK4+1ZJ8C2',
    ctaText: '自分らしい働き方を探す',
    ctaText_en: 'Discover Your Healer Path',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    keywords: ['看護', '看護師', 'ナース', '医療', '病院', '派遣', 'レバウェル', 'レバウェル看護', 'クリニック', '介護', '療養', '保健', '夜勤', '救急', '医師', '薬局', 'お薬', 'nurse', 'nursing', 'medical', 'hospital', 'clinic', 'caregiver', 'practitioner', 'health', 'healthcare'],
    trackingPixel: 'https://www15.a8.net/0.gif?a8mat=2NWYNR+2Q8KD6+2JK4+1ZJ8C2'
  },
  {
    id: 'clickjob_care_1',
    category: 'career',
    title: '慈愛の守り手：介護職の天職鑑定',
    title_en: 'Compassionate Guardian: Caregiving Destiny',
    description: '他者の命と尊厳に優しく寄り添う、崇高な愛のお仕事。あなたに最も適した温かな職場で、慈愛の光を灯しませんか？【クリックジョブ介護】',
    description_en: 'A noble path of warm compassion, standing gently by the lives and dignity of others. Find your ideal, welcoming workplace to shine your gentle light with Click Job Care.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+6HE08A+2WPG+64C3M',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+6HE08A+2WPG+64C3M',
    ctaText: 'ぬくもりのある職場を探す',
    ctaText_en: 'Discover a Compassionate Workplace',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    keywords: ['介護', 'ヘルパー', 'ケアマネージャー', '介護福祉士', '福祉', '有料老人ホーム', '高齢者', 'クリックジョブ', 'クリックジョブ介護', 'ケアギバー', '介護職', 'デイサービス', '施設', 'リハビリ', 'caregiver', 'caregiving', 'welfare', 'helper', 'nursing-home', 'senior', 'elderly', 'compassion'],
    trackingPixel: 'https://www13.a8.net/0.gif?a8mat=2NWYNR+6HE08A+2WPG+64C3M'
  },
  {
    id: 'jusnet_career_1',
    category: 'career',
    title: '星の計理：最高峰の知性（会計・財務・経理）',
    title_en: 'Celestial Calculus: Elite Career Path (Accounting & Finance)',
    description: '数字に宿る真理を見通し、世界の秩序を支える高潔な魂。あなたの類まれなる知性と技術を最高に評価し、輝かしいキャリアの頂点へと導く舞台へ踏み出しませんか？【ジャスネットキャリア】',
    description_en: 'A noble intellect finding order and truth within cosmic balances. Discover elite positions in accounting, finance, and tax that fully recognize your stellar capabilities with Jusnet Career.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNQ+CI3SFE+37ZK+5YJRM',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNQ+CI3SFE+37ZK+5YJRM',
    ctaText: 'プロフェッショナルの道を歩む',
    ctaText_en: 'Unlock Your Elite Career',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    keywords: ['会計', '会計士', '税理士', '公認会計士', '経理', '財務', '監査', '簿記', '税務', 'ジャスネット', 'ジャスネットキャリア', 'コンサル', '税理士法人', '監査法人', 'cpa', 'accounting', 'accountant', 'finance', 'bookkeeping', 'tax', 'audit', 'controller', 'advisory', '仕訳', '決算'],
    trackingPixel: 'https://www16.a8.net/0.gif?a8mat=2NWYNQ+CI3SFE+37ZK+5YJRM'
  },
  {
    id: 'freelance_tech_1',
    category: 'career',
    title: '電脳の開拓者：フリーランスエンジニアの軌跡',
    title_en: 'Cyber Pioneer: Freelance Developer Path',
    description: 'あなたの磨き抜かれた知性と技術は、新たなフロンティアを開拓する。高単価案件と寄り添うサポートで、あなたの真の価値を解き放ちませんか？【レバテックフリーランス】',
    description_en: 'Your refined intellect and craft will forge uncharted frontiers. Unlock your true worth with premium projects and dedicated support from Leverages Tech Freelance.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+2RFFKQ+2JK4+1THW9E',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+2RFFKQ+2JK4+1THW9E',
    ctaText: '自らの価値を解き放つ',
    ctaText_en: 'Unlock Your True Worth',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    keywords: ['プログラミング', 'プログラマ', 'エンジニア', 'IT', '開発', '制作', 'システム', 'web', 'フリーランス', '受託', '案件', '単価', '技術', 'レバテック', 'レバテックフリーランス', 'ソフトウェア', 'アプリ', 'プログラミング言語', 'freelance', 'engineer', 'developer', 'programmer', 'coding', 'tech', 'system', 'software', 'project', 'contractor'],
    trackingPixel: 'https://www14.a8.net/0.gif?a8mat=2NWYNR+2RFFKQ+2JK4+1THW9E'
  },
  {
    id: 'pocketwork_sidejob_1',
    category: 'career',
    title: '語らいの明星：在宅で輝く対話の副業',
    title_en: 'Morning Star of Dialogue: Home-Based Side Income',
    description: 'あなたの「紡ぐ言葉」や「人の心に寄り添う声」が誰かの心の灯火になる。在宅の安心な環境で、好きな瞬間にあなたのペースで心の絆を育みませんか？【ポケットワーク】',
    description_en: 'Your spoken words and compassionate voice can light up someone else’s heart. In a safe home environment, cultivate celestial bonds of conversation at your own gentle pace with Pocket Work.',
    url: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+5N0WDM+2J9U+644DU',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=2NWYNR+5N0WDM+2J9U+644DU',
    ctaText: '新しい言葉を紡ぐ',
    ctaText_en: 'Start Weaving New Dialogues',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    keywords: ['副業', '在宅', 'チャットレディ', 'テレフォンレディ', 'お喋り', 'チャット', '電話', '声', '会話', '話し相手', '相談相手', '高収入', '在宅ワーク', '内職', 'ポケットワーク', 'サイドビジネス', 'wfh', 'remote', 'sidejob', 'calling', 'chatting', 'operator', 'listen', 'earning', 'home-based'],
    trackingPixel: 'https://www13.a8.net/0.gif?a8mat=2NWYNR+5N0WDM+2J9U+644DU'
  },
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
    keywords: ['仕事', '転職', 'キャリア', '就職', '才能', 'ビジネス', '職業', '職種', '求人', '会社', '適職', '天職', '面接', '就活', '退職', '働く', 'エンジニア', '事務', '営業', 'デザイナー', 'フリーランス', 'プログラマ', 'クリエイター', '人事', 'ワーク', 'work', 'career', 'job', 'talent', 'occupation', 'profession', 'hiring', 'recruiting', 'resume']
  },
  {
    id: 'aoyama_marriage_1',
    category: 'love',
    title: '高貴なる巡り合わせ：エクセレンス青山の誓い',
    title_en: 'Noble Alignments: Excellence Aoyama Ceremony',
    description: '良質なステータスを持つ珠玉の魂たちが集う、東京・青山発祥の最高峰婚活サロン。あなたの手相と星の配置が示す「揺るぎない確かな伴侶」との約束の絆を結びます。【エクセレンス青山】',
    description_en: 'A premier marriage salon originating in Aoyama, Tokyo, attracting refined, prestigious souls. Cultivate a celestial, sworn bond with your true companion predicted by your sacred lines.',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+8MSCVE+VO0+C7DWI',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+8MSCVE+VO0+C7DWI',
    ctaText: '極上の出逢いへ踏み出す',
    ctaText_en: 'Embark on Elite Encounters',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    keywords: ['婚活', 'お見合い', '結婚相談所', '結婚相談', 'お見合い相手', '結婚相手', 'パートナー', 'エクセレンス青山', '結婚生活', '成婚', 'セレブ', 'ハイクラス', '良縁', '紹介', 'お見合い結婚', '出会い', '関係', '伴侶', '愛', 'marriage', 'matchmaking', 'proposal', 'wedding', 'celebrity', 'high-class', 'elite', 'consultant', 'dating', 'relationship'],
    trackingPixel: 'https://www16.a8.net/0.gif?a8mat=4B5N40+8MSCVE+VO0+C7DWI'
  },
  {
    id: 'pappy_love_1',
    category: 'love',
    title: '共鳴する天上の縁：極上のマッチング',
    title_en: 'Resonating Celestial Bond: Premium Matching',
    description: '星々が巡り合うように、洗練されたワンランク上の特別な出会い。あなたの魂が真に惹かれ合う美しい縁を結びませんか？【Pappy】',
    description_en: 'Just as star systems align in divine harmony, discover a refined, higher-tier connection. Weave a beautiful destiny of heart and soul with Pappy.',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5MC7+DAOLGQ+22QA+NTJWY',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=4B5MC7+DAOLGQ+22QA+NTJWY',
    ctaText: '特別な縁と巡り合う',
    ctaText_en: 'Discover Your Blessed Encounters',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    keywords: ['恋愛', '結婚', '出会い', '恋', '恋活', '婚活', 'マッチング', 'パートナー', '運命の人', '愛', '好み', '好意', 'デート', 'パピー', 'Pappy', '交際', '関係', '伴侶', 'love', 'romance', 'marriage', 'dating', 'matchmaking', 'relationship', 'encounter', 'soulmate', 'partner', 'premium'],
    trackingPixel: 'https://www12.a8.net/0.gif?a8mat=4B5MC7+DAOLGQ+22QA+NTJWY'
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
    id: 'debt_rebuild_1',
    category: 'finance',
    title: '星の調律：豊かさを取り戻す再生の扉',
    title_en: 'Celestial Harmony: Reclaiming Financial Freedom',
    description: '日々の重荷や、運命に絡まる経済の結び目を解きほぐす。一人で抱え込まず、ゆっくりとあなたのペースで財政を再生する星の導きを得てみませんか？【全国無料対応！ゆっくりしっかり長時間借金相談！！】',
    description_en: 'Untangle the heavy financial burdens and knots of earthly debt. You do not have to carry it alone; experience a slow, step-by-step restoration of your financial flow and peace.',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+9713FU+4FR4+626XU',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+9713FU+4FR4+626XU',
    ctaText: '無料相談で重荷をそっと降ろす',
    ctaText_en: 'Release Your Burdens via Free Call',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800',
    keywords: ['お金', '金運', '豊かさ', '借金', '債務', '返済', '相談', '悩み', '解決', '多重債務', '無料相談', '弁護士', '司法書士', '過払い', '再生', '整理', '減額', 'ローン', 'クレジット', '資金繰り', '返済計画', 'money', 'debt', 'finance', 'relief', 'consultation', 'lawyer', 'repayment', 'loan', 'solve', 'bankruptcy'],
    trackingPixel: 'https://www15.a8.net/0.gif?a8mat=4B5N40+9713FU+4FR4+626XU'
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
    id: 'cloud_gym_1',
    category: 'wellness',
    title: 'DNAの託宣：パーソナル・クラウド・プログラム',
    title_en: 'Oracle of DNA: Cloud Gym Personal Alignment',
    description: 'あなたの肉体という宇宙に刻まれた遺伝子（DNA）の暗号を解き明かし、最も調和する美と健康の形を創り出す。在宅で叶える最高峰のオーダーメイド・フィットネス。【CLOUD GYM】',
    description_en: 'Decode the genetic cryptography etched within the temple of your body. Formulate a supreme, custom-built fitness and nutritional alignment purely from your home with CLOUD GYM.',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+81CR3E+4RUO+5YJRM',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=4B5N40+81CR3E+4RUO+5YJRM',
    ctaText: '遺伝子の神秘を解き明かす',
    ctaText_en: 'Unlock Your Genetic Destiny',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    keywords: ['フィットネス', 'ジム', 'ダイエット', 'トレーニング', '筋トレ', '運動', '健康', '痩せる', 'パーソナルジム', 'クラウドジム', '遺伝子', '遺伝子検査', 'オンラインジム', 'ヨガ', 'ピラティス', 'ボディメイク', 'シェイプアップ', 'fitness', 'gym', 'workout', 'diet', 'training', 'exercise', 'wellness', 'yoga', 'dna', 'genetics', 'online-gym', 'bodymake'],
    trackingPixel: 'https://www17.a8.net/0.gif?a8mat=4B5N40+81CR3E+4RUO+5YJRM'
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
    category: 'fortune',
    title: '真実の道：プレミアム鑑定',
    title_en: 'Path of Truth: Premium Reading',
    description: 'より深く、個人的な星の導きを求める方へ。専門家による詳細な鑑定をご依頼いただけます。',
    description_en: 'For those seeking deeper, more personal celestial guidance. Request a detailed reading from a master oracle.',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5MC7+7RTTEY+2PEO+1HKDAR&a8ejpredirect=https%3A%2F%2Fcoconala.com%2Fcategories%2F3%3Fservice_kind%3D0',
    url_en: 'https://px.a8.net/svt/ejp?a8mat=4B5MC7+7RTTEY+2PEO+1HKDAR&a8ejpredirect=https%3A%2F%2Fcoconala.com%2Fcategories%2F3%3Fservice_kind%3D0',
    ctaText: '詳細な鑑定を依頼する',
    ctaText_en: 'Request Premium Reading',
    keywords: ['占い', '鑑定', '詳細', '悩み', '解決', 'fortune', 'reading', 'oracle', 'solve', '相談', 'guidance']
  }
];

