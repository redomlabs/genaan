// Starter catalogue. Prices are editable from the dashboard and are only
// inserted when the store is empty, so admin changes are never overwritten.

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

type SeedItem = {
  slug: string;
  kind: "indoor" | "palm" | "fruit" | "ornamental" | "seed";
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  sizeAr?: string;
  sizeEn?: string;
  imageUrl: string;
  price?: number;
  plantingFee?: number;
  areaPerUnit?: number;
};

export const SEED_ITEMS: SeedItem[] = [
  // Indoor plants and palms used in business bundles (photos from the previous gallery).
  { slug: "aglaonema", kind: "indoor", nameAr: "أجلونيما", nameEn: "Aglaonema", imageUrl: u("photo-1620803366004-119b57f54cd6"), descriptionAr: "تتحمل الإضاءة الضعيفة وألوان أوراقها ثابتة.", descriptionEn: "Tolerates low light and keeps its leaf colour." },
  { slug: "schefflera", kind: "indoor", nameAr: "شيفليرا", nameEn: "Schefflera", sizeAr: "ارتفاع حوالي متر", sizeEn: "About 1 m tall", imageUrl: u("photo-1747641567564-e318a88cf1b0") },
  { slug: "clusia", kind: "indoor", nameAr: "كلاسيا", nameEn: "Clusia", imageUrl: u("photo-1682414270154-15ea28c62554") },
  { slug: "dieffenbachia", kind: "indoor", nameAr: "ديفنباخيا", nameEn: "Dieffenbachia", imageUrl: u("photo-1695952835952-f8975fbb28ec") },
  { slug: "peace-lily", kind: "indoor", nameAr: "زنبق السلام", nameEn: "Peace lily", imageUrl: u("photo-1575805501150-e064fbd815dd"), descriptionAr: "تزهر داخل المكان وتناسب الاستقبال.", descriptionEn: "Flowers indoors and suits receptions." },
  { slug: "fern", kind: "indoor", nameAr: "فوجير", nameEn: "Fern", imageUrl: u("photo-1520599829573-20c1b374c0a4") },
  { slug: "imperial", kind: "indoor", nameAr: "إمبريال", nameEn: "Imperial philodendron", imageUrl: u("photo-1630393178216-7a0bd27bc990") },
  { slug: "peperomia", kind: "indoor", nameAr: "ببروميا خضراء", nameEn: "Green peperomia", imageUrl: u("photo-1631038093177-b709a7048b44") },
  { slug: "snake-plant", kind: "indoor", nameAr: "سانسيفيريا", nameEn: "Snake plant", imageUrl: u("photo-1567225557594-88d73e55f2cb"), descriptionAr: "أسهل نبات في العناية، يستحمل قلة الري.", descriptionEn: "The easiest to look after and happy with little water." },
  { slug: "alocasia", kind: "indoor", nameAr: "ألوكاسيا", nameEn: "Alocasia", imageUrl: u("photo-1757912157676-590e84bfd5ea") },
  { slug: "syngonium", kind: "indoor", nameAr: "سنجونيوم", nameEn: "Syngonium", imageUrl: u("photo-1688370180849-a7c39f49edf1") },
  { slug: "pothos", kind: "indoor", nameAr: "بوتس معلّق", nameEn: "Hanging pothos", imageUrl: u("photo-1579834873725-bef2c4c3ed84") },
  { slug: "areca-palm", kind: "palm", nameAr: "نخيل أريكا", nameEn: "Areca palm", sizeAr: "ارتفاع ١٫٢–١٫٥ متر", sizeEn: "1.2–1.5 m tall", imageUrl: u("photo-1696339565183-8f17a4b029bb") },
  { slug: "chamaedorea", kind: "palm", nameAr: "نخيل شمدوريا", nameEn: "Chamaedorea palm", imageUrl: u("photo-1745327656782-30099136da9c") },
  { slug: "rhapis", kind: "palm", nameAr: "نخيل رابس", nameEn: "Rhapis palm", imageUrl: u("photo-1648806091298-463d085ad8b1") },
  { slug: "majesty-palm", kind: "palm", nameAr: "نخيل ماجستي", nameEn: "Majesty palm", imageUrl: u("photo-1536008905557-cc918940960c") },
  { slug: "fishtail-palm", kind: "palm", nameAr: "نخيل ذيل السمكة", nameEn: "Fishtail palm", imageUrl: u("photo-1589449104511-b2c8a9e1b7f6") },

  // Fruit trees sold for planting.
  { slug: "mango", kind: "fruit", nameAr: "مانجو مطعّمة", nameEn: "Grafted mango", sizeAr: "عمر سنتين، ارتفاع ١–١٫٢ م", sizeEn: "2 years, 1–1.2 m", price: 320, areaPerUnit: 36, descriptionAr: "أصناف عويس وزبدية وكيت حسب المتاح. تبدأ تثمر خلال ٣ سنين.", descriptionEn: "Ewais, Zebdeya or Keitt depending on stock. Starts fruiting within 3 years.", imageUrl: u("photo-1744565172191-7d880276a6c5") },
  { slug: "lemon", kind: "fruit", nameAr: "ليمون بلدي", nameEn: "Baladi lemon", sizeAr: "عمر سنة ونص، ارتفاع حوالي متر", sizeEn: "18 months, about 1 m", price: 160, areaPerUnit: 16, descriptionAr: "يثمر أكثر من مرة في السنة ويناسب الحدائق الصغيرة.", descriptionEn: "Fruits more than once a year and suits small gardens.", imageUrl: u("photo-1526438281712-35d96b8586e5") },
  { slug: "orange", kind: "fruit", nameAr: "برتقال أبو سرة", nameEn: "Navel orange", sizeAr: "عمر سنتين، ارتفاع ١–١٫٢ م", sizeEn: "2 years, 1–1.2 m", price: 170, areaPerUnit: 25, imageUrl: u("photo-1761062062542-133c221ef184") },
  { slug: "mandarin", kind: "fruit", nameAr: "يوسفي", nameEn: "Mandarin", sizeAr: "عمر سنتين، ارتفاع حوالي متر", sizeEn: "2 years, about 1 m", price: 170, areaPerUnit: 25, imageUrl: u("photo-1643485971934-1cbbd1907b78") },
  { slug: "guava", kind: "fruit", nameAr: "جوافة", nameEn: "Guava", sizeAr: "عمر سنة ونص، ارتفاع حوالي متر", sizeEn: "18 months, about 1 m", price: 130, areaPerUnit: 25, imageUrl: u("photo-1774017543056-503e64df7576") },
  { slug: "pomegranate", kind: "fruit", nameAr: "رمان", nameEn: "Pomegranate", sizeAr: "عمر سنة ونص، ارتفاع ٨٠ سم", sizeEn: "18 months, 80 cm", price: 130, areaPerUnit: 16, imageUrl: u("photo-1767895655075-32bcaa7d03ae") },
  { slug: "fig", kind: "fruit", nameAr: "تين", nameEn: "Fig", sizeAr: "عمر سنة ونص، ارتفاع ٨٠ سم", sizeEn: "18 months, 80 cm", price: 150, areaPerUnit: 25, imageUrl: u("photo-1756622034653-7f08c15d6e1f") },
  { slug: "olive", kind: "fruit", nameAr: "زيتون", nameEn: "Olive", sizeAr: "عمر سنتين، ارتفاع ١–١٫٢ م", sizeEn: "2 years, 1–1.2 m", price: 120, areaPerUnit: 30, descriptionAr: "يتحمل الملوحة والجفاف ويناسب الأراضي الجديدة.", descriptionEn: "Copes with salty soil and drought, good for newly reclaimed land.", imageUrl: u("photo-1758818710855-b60cf3b74de6") },
  { slug: "date-palm", kind: "fruit", nameAr: "نخيل بلح (فسيلة)", nameEn: "Date palm offshoot", sizeAr: "فسيلة نسيجية مقلمة", sizeEn: "Tissue-culture offshoot", price: 1400, plantingFee: 250, areaPerUnit: 64, imageUrl: u("photo-1785531093420-bda3d739a932") },

  // Ornamental trees sold for planting.
  { slug: "ficus-nitida", kind: "ornamental", nameAr: "فيكس نيتيدا", nameEn: "Ficus nitida", sizeAr: "ارتفاع ١٫٨–٢ م", sizeEn: "1.8–2 m tall", price: 380, areaPerUnit: 9, descriptionAr: "للأسوار والظل، ويتشكّل بالقص.", descriptionEn: "For boundaries and shade, and easy to shape.", imageUrl: u("photo-1642541744624-7a2a89545a32") },
  { slug: "washingtonia", kind: "ornamental", nameAr: "نخيل واشنطونيا", nameEn: "Washingtonia palm", sizeAr: "ارتفاع ١٫٥ م", sizeEn: "1.5 m tall", price: 650, plantingFee: 150, areaPerUnit: 16, imageUrl: u("photo-1597707767025-e0e5e5dfbb97") },
  { slug: "poinciana", kind: "ornamental", nameAr: "بونسيانا", nameEn: "Royal poinciana", sizeAr: "ارتفاع ٢ م", sizeEn: "2 m tall", price: 320, areaPerUnit: 49, descriptionAr: "زهور حمرا في الصيف وظل واسع.", descriptionEn: "Red summer flowers and a wide canopy.", imageUrl: u("photo-1540712236415-bd24103f1c51") },
  { slug: "jacaranda", kind: "ornamental", nameAr: "جاكرندا", nameEn: "Jacaranda", sizeAr: "ارتفاع ٢ م", sizeEn: "2 m tall", price: 350, areaPerUnit: 36, imageUrl: u("photo-1769721097494-dcb3b3ffcff7") },
  { slug: "conocarpus", kind: "ornamental", nameAr: "كونوكاربس", nameEn: "Conocarpus", sizeAr: "ارتفاع ١٫٥ م", sizeEn: "1.5 m tall", price: 140, areaPerUnit: 4, descriptionAr: "سور أخضر سريع النمو.", descriptionEn: "A fast-growing green screen.", imageUrl: u("photo-1725630810343-b89b40e0079a") },
  { slug: "cypress", kind: "ornamental", nameAr: "سرو", nameEn: "Cypress", sizeAr: "ارتفاع ١٫٥ م", sizeEn: "1.5 m tall", price: 260, areaPerUnit: 4, imageUrl: u("photo-1756365951512-b15739bfbf4c") },
  { slug: "bougainvillea", kind: "ornamental", nameAr: "جهنمية", nameEn: "Bougainvillea", sizeAr: "متسلقة، ارتفاع متر", sizeEn: "Climber, 1 m", price: 110, areaPerUnit: 4, imageUrl: u("photo-1759013682577-530e92bf68f6") },
];

type SeedBundle = {
  slug: string;
  service: "business" | "planting";
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl: string;
  price: number;
  areaMin: number;
  areaMax: number;
  audiences: string[];
  extrasAr: string[];
  extrasEn: string[];
  isFeatured?: boolean;
  items: Record<string, number>;
};

const businessExtras = (pots: number) => ({
  extrasAr: [`${pots.toLocaleString("ar-EG")} أصيص متناسق`, "توزيع وتجهيز في المكان"],
  extrasEn: [`${pots} matching pots`, "Placement and setup on site"],
});
const allBusiness = ["clinic", "office", "restaurant", "hotel", "retail"];

export const SEED_BUNDLES: SeedBundle[] = [
  {
    slug: "green-corner",
    service: "business",
    nameAr: "ركن أخضر",
    nameEn: "Green corner",
    descriptionAr: "خمس نباتات لاستقبال أو مدخل أو مكتب صغير.",
    descriptionEn: "Five plants for a reception, entrance or small office.",
    imageUrl: "https://images.unsplash.com/photo-1545239735-f0b35d2b9683?auto=format&fit=crop&w=1200&h=800&q=80",
    price: 4000,
    areaMin: 15,
    areaMax: 30,
    audiences: ["clinic", "office", "retail"],
    ...businessExtras(5),
    items: { "areca-palm": 1, schefflera: 1, "peace-lily": 1, aglaonema: 1, "snake-plant": 1 },
  },
  {
    slug: "welcoming-space",
    service: "business",
    nameAr: "مساحة ترحيب",
    nameEn: "Welcoming space",
    descriptionAr: "عشر نباتات للاستقبال ومناطق الانتظار حواليه.",
    descriptionEn: "Ten plants for a reception and the waiting area around it.",
    imageUrl: "https://images.unsplash.com/photo-1769501203620-29d7bba05e78?auto=format&fit=crop&w=1200&h=800&q=80",
    price: 8500,
    areaMin: 30,
    areaMax: 60,
    audiences: ["clinic", "office", "restaurant", "retail"],
    ...businessExtras(10),
    items: { "areca-palm": 2, chamaedorea: 1, schefflera: 2, aglaonema: 2, "peace-lily": 1, imperial: 1, pothos: 1 },
  },
  {
    slug: "living-business",
    service: "business",
    nameAr: "نشاط ينبض بالحياة",
    nameEn: "Living business",
    descriptionAr: "ثمانية عشر نباتًا تربط الاستقبال بالغرف والمساحات المشتركة.",
    descriptionEn: "Eighteen plants that tie the reception, rooms and shared areas together.",
    imageUrl: "https://images.unsplash.com/photo-1773927005455-8efc55a8d512?auto=format&fit=crop&w=1200&h=800&q=80",
    price: 15500,
    areaMin: 60,
    areaMax: 100,
    audiences: allBusiness,
    isFeatured: true,
    ...businessExtras(18),
    items: { "areca-palm": 3, chamaedorea: 2, schefflera: 3, aglaonema: 3, "peace-lily": 2, imperial: 2, rhapis: 1, dieffenbachia: 1, pothos: 1 },
  },
  {
    slug: "signature-space",
    service: "business",
    nameAr: "مساحة مميزة",
    nameEn: "Signature space",
    descriptionAr: "ثلاثون نباتًا ونخلة لمكان كبير بأكثر من منطقة.",
    descriptionEn: "Thirty plants and palms for a large venue with several areas.",
    imageUrl: "https://images.unsplash.com/photo-1761695939620-a18c88ab83b7?auto=format&fit=crop&w=1200&h=800&q=80",
    price: 25000,
    areaMin: 100,
    areaMax: 180,
    audiences: ["office", "restaurant", "hotel", "retail"],
    ...businessExtras(30),
    items: { "areca-palm": 5, chamaedorea: 3, schefflera: 5, aglaonema: 5, "peace-lily": 4, imperial: 3, rhapis: 2, dieffenbachia: 2, pothos: 1 },
  },
  {
    slug: "green-destination",
    service: "business",
    nameAr: "وجهة خضراء",
    nameEn: "Green destination",
    descriptionAr: "خمسون نباتًا لمكان واسع أو أكثر من فرع بنفس الطابع.",
    descriptionEn: "Fifty plants for a spacious venue or several branches with one look.",
    imageUrl: "https://images.unsplash.com/photo-1700760934202-406926c28458?auto=format&fit=crop&w=1200&h=800&q=80",
    price: 41500,
    areaMin: 180,
    areaMax: 300,
    audiences: ["office", "hotel", "restaurant"],
    ...businessExtras(50),
    items: { "areca-palm": 8, chamaedorea: 5, schefflera: 8, aglaonema: 8, "peace-lily": 7, imperial: 5, rhapis: 4, dieffenbachia: 3, pothos: 2 },
  },
  {
    slug: "home-orchard",
    service: "planting",
    nameAr: "جنينة البيت",
    nameEn: "Home garden orchard",
    descriptionAr: "تسع شجرات فاكهة متنوعة لجنينة بيت أو روف أرضي.",
    descriptionEn: "Nine mixed fruit trees for a home garden.",
    imageUrl: u("photo-1781289056566-c4fb01d65017"),
    price: 1650,
    areaMin: 100,
    areaMax: 250,
    audiences: ["garden", "villa"],
    extrasAr: ["تخطيط أماكن الشجر قبل الزراعة"],
    extrasEn: ["Tree positions planned before planting"],
    items: { mango: 2, lemon: 2, mandarin: 1, orange: 1, guava: 1, pomegranate: 1, fig: 1 },
  },
  {
    slug: "villa-garden",
    service: "planting",
    nameAr: "حديقة فيلا",
    nameEn: "Villa garden",
    descriptionAr: "سور فيكس، نخيل واشنطونيا، شجر ظل وفاكهة لحديقة فيلا متكاملة.",
    descriptionEn: "A ficus boundary, Washingtonia palms, shade and fruit trees for a complete villa garden.",
    imageUrl: u("photo-1787505078050-c6ea63c077eb"),
    price: 7200,
    areaMin: 250,
    areaMax: 600,
    audiences: ["villa"],
    isFeatured: true,
    extrasAr: ["تخطيط أماكن الشجر قبل الزراعة", "زيارة متابعة بعد شهر"],
    extrasEn: ["Tree positions planned before planting", "Follow-up visit after a month"],
    items: { "ficus-nitida": 10, washingtonia: 2, poinciana: 1, jacaranda: 1, mango: 2, lemon: 2, mandarin: 2, bougainvillea: 4 },
  },
  {
    slug: "citrus-quarter-feddan",
    service: "planting",
    nameAr: "ربع فدان موالح",
    nameEn: "Quarter-feddan citrus",
    descriptionAr: "حوالي ٤٢ شجرة ليمون وبرتقال ويوسفي على مسافات ٥×٥ م.",
    descriptionEn: "About 42 lemon, orange and mandarin trees spaced 5 × 5 m.",
    imageUrl: u("photo-1780287857383-9dc473fec6ec"),
    price: 6300,
    areaMin: 900,
    areaMax: 1200,
    audiences: ["farm", "villa"],
    extrasAr: ["تخطيط الأرض وتحديد الجور"],
    extrasEn: ["Land marked out and pits planned"],
    items: { lemon: 14, orange: 14, mandarin: 14 },
  },
  {
    slug: "mango-feddan",
    service: "planting",
    nameAr: "فدان مانجو",
    nameEn: "Mango feddan",
    descriptionAr: "١١٠ شجرة مانجو مطعّمة على مسافات ٦×٦ م لفدان كامل.",
    descriptionEn: "110 grafted mango trees spaced 6 × 6 m across one feddan.",
    imageUrl: u("photo-1781673232370-ece15536d3d3"),
    price: 33000,
    areaMin: 3800,
    areaMax: 4400,
    audiences: ["farm"],
    extrasAr: ["تخطيط الأرض وتحديد الجور", "أصناف مختلطة حسب المتاح"],
    extrasEn: ["Land marked out and pits planned", "Mixed varieties depending on stock"],
    items: { mango: 110 },
  },
  {
    slug: "olive-feddan",
    service: "planting",
    nameAr: "فدان زيتون",
    nameEn: "Olive feddan",
    descriptionAr: "١٤٠ شجرة زيتون على مسافات ٥×٦ م، مناسبة للأراضي الجديدة.",
    descriptionEn: "140 olive trees spaced 5 × 6 m, suited to newly reclaimed land.",
    imageUrl: u("photo-1762202754535-d455f57fd126"),
    price: 15500,
    areaMin: 3800,
    areaMax: 4400,
    audiences: ["farm"],
    extrasAr: ["تخطيط الأرض وتحديد الجور"],
    extrasEn: ["Land marked out and pits planned"],
    items: { olive: 140 },
  },
];

export const SEED_ZONES = [
  { nameAr: "القاهرة", nameEn: "Cairo", fee: 250 },
  { nameAr: "الجيزة", nameEn: "Giza", fee: 250 },
  { nameAr: "التجمع والقاهرة الجديدة", nameEn: "New Cairo", fee: 300 },
  { nameAr: "الشيخ زايد و٦ أكتوبر", nameEn: "Sheikh Zayed and 6th of October", fee: 300 },
  { nameAr: "العاصمة الإدارية والعبور والشروق", nameEn: "New Capital, Obour and Shorouk", fee: 400 },
  { nameAr: "طريق مصر إسكندرية الصحراوي", nameEn: "Cairo–Alexandria desert road", fee: 600 },
  { nameAr: "الإسكندرية", nameEn: "Alexandria", fee: 700 },
  { nameAr: "الدلتا", nameEn: "Delta governorates", fee: 600 },
];

export const SEED_SETTINGS: Record<string, string> = {
  planting_fee_per_tree: "40",
  planting_visit_fee: "300",
  free_delivery_threshold: "0",
};

/** Seed packets, added once to stores that have none yet. Photos are added from the dashboard. */
export const SEED_PACKETS: SeedItem[] = [
  { slug: "seed-lawn-baladi", kind: "seed", nameAr: "بذور نجيلة بلدي", nameEn: "Baladi lawn grass seed", sizeAr: "كيلو يكفي حوالي ٢٥ م²", sizeEn: "1 kg covers about 25 m²", price: 180, descriptionAr: "تتحمل الشمس والحر وقلة الري.", descriptionEn: "Copes with sun, heat and little water.", imageUrl: "" },
  { slug: "seed-lawn-english", kind: "seed", nameAr: "بذور نجيل إنجليزي", nameEn: "English ryegrass seed", sizeAr: "كيلو يكفي حوالي ٢٥ م²", sizeEn: "1 kg covers about 25 m²", price: 260, descriptionAr: "لون أخضر غامق، يتزرع في الخريف والشتا.", descriptionEn: "Deep green, sown in autumn and winter.", imageUrl: "" },
  { slug: "seed-tomato", kind: "seed", nameAr: "بذور طماطم", nameEn: "Tomato seeds", sizeAr: "باكت ٥ جرام", sizeEn: "5 g packet", price: 45, imageUrl: "" },
  { slug: "seed-cucumber", kind: "seed", nameAr: "بذور خيار", nameEn: "Cucumber seeds", sizeAr: "باكت ١٠ جرام", sizeEn: "10 g packet", price: 40, imageUrl: "" },
  { slug: "seed-pepper", kind: "seed", nameAr: "بذور فلفل رومي", nameEn: "Bell pepper seeds", sizeAr: "باكت ٥ جرام", sizeEn: "5 g packet", price: 45, imageUrl: "" },
  { slug: "seed-molokhia", kind: "seed", nameAr: "بذور ملوخية", nameEn: "Molokhia seeds", sizeAr: "باكت ٥٠ جرام", sizeEn: "50 g packet", price: 30, imageUrl: "" },
  { slug: "seed-parsley", kind: "seed", nameAr: "بذور بقدونس", nameEn: "Parsley seeds", sizeAr: "باكت ٢٠ جرام", sizeEn: "20 g packet", price: 25, imageUrl: "" },
  { slug: "seed-basil", kind: "seed", nameAr: "بذور ريحان", nameEn: "Basil seeds", sizeAr: "باكت ١٠ جرام", sizeEn: "10 g packet", price: 30, imageUrl: "" },
  { slug: "seed-sunflower", kind: "seed", nameAr: "بذور عباد الشمس للزينة", nameEn: "Ornamental sunflower seeds", sizeAr: "باكت ٢٠ جرام", sizeEn: "20 g packet", price: 35, imageUrl: "" },
  { slug: "seed-zinnia", kind: "seed", nameAr: "بذور زهور زينيا", nameEn: "Zinnia flower seeds", sizeAr: "باكت ٥ جرام", sizeEn: "5 g packet", price: 35, imageUrl: "" },
];
