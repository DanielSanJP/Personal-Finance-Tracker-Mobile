/**
 * Business name mapping for New Zealand and Australia
 * Maps merchant names/keywords to category IDs for consistent categorization
 * Used by receipt scanning and voice input features
 */

export interface BusinessMapping {
  [categoryId: string]: string[];
}

/**
 * Comprehensive NZ/AU business mapping for expense categorization
 * Maps to category IDs defined in categories.ts
 */
export const BUSINESS_CATEGORY_MAPPING: BusinessMapping = {
  // Food & Dining - Restaurants, takeaways, cafes, groceries
  'food-dining': [
    // === SUPERMARKETS & GROCERIES ===
    // New Zealand
    'pak n save', 'pak\'n\'save', 'countdown', 'new world', 'fresh choice', 'four square',
    'super value', 'supervalue', 'night n day', 'night\'n\'day', 'on the spot',
    // Australia
    'woolworths', 'coles', 'iga', 'aldi', 'foodworks', 'spar', 'drakes', 'harris farm',
    'foodland', 'costco', 'market fresh',
    
    // === FAST FOOD & RESTAURANTS ===
    // International chains
    'mcdonald', 'mcdonalds', 'kfc', 'burger king', 'subway', 'pizza hut', 'domino',
    'taco bell', 'starbucks', 'gloria jean', 'michel\'s patisserie',
    // NZ/AU specific
    'burger wisconsin', 'burgerfuel', 'carl\'s jr', 'nando', 'grill\'d', 'oporto',
    'red rooster', 'hungry jack', 'zambrero', 'mad mex', 'schnitz',
    
    // === CAFES & FOOD ===
    'cafe', 'coffee', 'bakery', 'restaurant', 'dining', 'food', 'kitchen', 'grill',
    'bar', 'pub', 'tavern', 'bistro', 'takeaway', 'fish and chips', 'sushi',
    'robert harris', 'columbus coffee', 'esquires', 'muffin break'
  ],

  // Transportation - Fuel, public transport, parking, car services
  'transportation': [
    // === FUEL STATIONS ===
    // New Zealand
    'bp', 'shell', 'z energy', 'z', 'mobil', 'caltex', 'gull', 'challenge',
    'waitomo', 'allied', 'npd',
    // Australia  
    'caltex', 'shell', 'bp', 'mobil', '7-eleven fuel', 'united petroleum',
    'liberty', 'puma energy', 'ampol',
    
    // === TRANSPORT SERVICES ===
    'uber', 'taxi', 'bus', 'train', 'ferry', 'parking', 'toll', 'rego',
    'wof', 'roadworthy', 'aa', 'rac', 'nrma', 'auckland transport',
    'metlink', 'transperth', 'translink', 'public transport authority'
  ],

  // Housing - Rent, rates, property related
  'housing': [
    'rent', 'mortgage', 'rates', 'council', 'property', 'real estate',
    'landlord', 'property management', 'mitre 10', 'bunnings',
    'home depot', 'hardware', 'placemakers', 'buildlink'
  ],

  // Bills & Utilities - Power, internet, phone, insurance
  'utilities': [
    // === POWER/ELECTRICITY ===
    // New Zealand
    'mercury energy', 'contact energy', 'genesis energy', 'meridian energy',
    'trustpower', 'electric kiwi', 'flick electric', 'powershop',
    // Australia
    'origin energy', 'agl', 'energy australia', 'red energy', 'alinta energy',
    
    // === TELECOMMUNICATIONS ===
    // New Zealand
    'spark', 'vodafone', '2degrees', 'slingshot', 'orcon', 'vocus',
    // Australia
    'telstra', 'optus', 'vodafone', 'tpg', 'iinet',
    
    // === UTILITIES ===
    'watercare', 'vector', 'powerco', 'gas', 'water', 'electricity',
    'internet', 'broadband', 'phone', 'mobile', 'sky', 'fox'
  ],

  // Health & Fitness - Medical, dental, gym, pharmacy
  'healthcare': [
    // === PHARMACIES ===
    // New Zealand
    'unichem', 'life pharmacy', 'chemist warehouse', 'pharmacy',
    // Australia
    'chemist warehouse', 'priceline pharmacy', 'terry white chemmart',
    'discount drug stores', 'blooms the chemist', 'amcal',
    
    // === FITNESS & GYMS ===
    'anytime fitness', 'jetts', 'city fitness', 'snap fitness', 'les mills',
    'f45', 'crossfit', 'pure gym', 'goodlife', 'fitness first',
    
    // === MEDICAL ===
    'medical', 'doctor', 'dental', 'dentist', 'clinic', 'hospital',
    'physio', 'optometrist', 'specialist', 'gp', 'health',
    
    // === PET CARE (fits under healthcare) ===
    'animates', 'petstock', 'pet essentials', 'vet', 'veterinary',
    'pet food', 'pet', 'animal', 'dog', 'cat'
  ],

  // Shopping - Retail, clothing, electronics, general merchandise
  'shopping': [
    // === DEPARTMENT STORES ===
    // New Zealand
    'farmers', 'the warehouse', 'kmart', 'target', 'briscoes', 'bed bath beyond',
    'harvey norman', 'noel leeming', 'dick smith', 'warehouse stationery',
    // Australia
    'myer', 'david jones', 'big w', 'kmart', 'target', 'harris scarfe',
    
    // === ELECTRONICS & TECH ===
    'jb hi-fi', 'jb hifi', 'harvey norman', 'noel leeming', 'dick smith',
    'pb tech', 'computer lounge', 'apple', 'samsung', 'officeworks',
    
    // === CLOTHING & FASHION ===
    'cotton on', 'uniqlo', 'zara', 'h&m', 'glassons', 'hallensteins',
    'macpac', 'kathmandu', 'rebel sport', 'number one shoes', 'hannahs',
    
    // === HOMEWARE & FURNITURE ===
    'ikea', 'freedom', 'fantastic furniture', 'super amart',
    'briscoes', 'stevens', 'smiths city'
  ],

  // Entertainment - Movies, games, streaming, events
  'entertainment': [
    // === CINEMAS ===
    'event cinemas', 'hoyts', 'reading cinemas', 'berkeley cinemas',
    'village cinemas', 'dendy', 'palace cinemas',
    
    // === STREAMING & DIGITAL ===
    'netflix', 'disney plus', 'amazon prime', 'spotify', 'apple music',
    'youtube premium', 'neon', 'tvnz ondemand', 'three now', 'stan',
    
    // === GAMING & ENTERTAINMENT ===
    'eb games', 'mighty ape', 'playstation', 'xbox', 'nintendo',
    'steam', 'concert', 'event', 'ticket', 'ticketek', 'ticketmaster'
  ],

  // Travel - Hotels, flights, car rental
  'travel': [
    'air new zealand', 'jetstar', 'virgin', 'qantas', 'hotel',
    'accommodation', 'airbnb', 'booking.com', 'expedia', 'rental car',
    'hertz', 'avis', 'budget', 'europcar', 'travel', 'holiday'
  ],

  // Education - Schools, courses, books
  'education': [
    'whitcoulls', 'paper plus', 'dymocks', 'university', 'school',
    'course', 'training', 'education', 'books', 'stationery'
  ],

  // Personal Care - Beauty, grooming, personal items
  'personal-care': [
    // === BEAUTY & PERSONAL CARE ===
    'sephora', 'mecca', 'farmers beauty', 'cw beauty', 'chemist warehouse beauty section',
    'priceline', 'beauty', 'haircut', 'barber', 'salon', 'spa',
    'nail', 'massage', 'cosmetics'
  ],

  // Insurance - Health, car, home, life insurance
  'insurance': [
    'aa insurance', 'state insurance', 'tower insurance', 'ami insurance',
    'commbank insurance', 'nib', 'bupa', 'southern cross', 'anz insurance',
    'westpac insurance', 'kiwibank insurance', 'insurance', 'life insurance',
    'car insurance', 'home insurance', 'health insurance'
  ],

  // Investment - Stocks, bonds, retirement contributions  
  'investment': [
    'sharesies', 'hatch', 'investnow', 'kiwisaver', 'superannuation',
    'asx', 'nzx', 'trading', 'investment', 'stocks', 'shares', 'bonds',
    'managed funds', 'etf', 'crypto', 'bitcoin'
  ],

  // === INCOME CATEGORIES ===
  // Salary - Regular employment income
  'salary': [
    'salary', 'wage', 'wages', 'pay', 'payroll', 'employment', 'job',
    'work', 'employer', 'company', 'workplace', 'income', 'earnings'
  ],

  // Freelance - Contract and freelance work
  'freelance': [
    'freelance', 'contract', 'contractor', 'consulting', 'consultant',
    'gig', 'project', 'commission', 'upwork', 'fiverr', 'airtasker',
    'client work', 'remote work'
  ],

  // Business - Business income and profits
  'business': [
    'business', 'profit', 'revenue', 'sales', 'business income',
    'self employed', 'entrepreneur', 'company income', 'trade'
  ],

  // Investment Income - Dividends, interest, capital gains
  'investment-income': [
    'dividend', 'dividends', 'interest', 'capital gain', 'capital gains',
    'investment income', 'investment return', 'portfolio', 'interest payment'
  ],

  // Rental Income - Property rental income
  'rental': [
    'rent', 'rental', 'rental income', 'property income', 'tenant',
    'lease', 'property', 'real estate'
  ],

  // Gift/Bonus - Gifts, bonuses, winnings
  'gift': [
    'gift', 'bonus', 'tip', 'gratuity', 'prize', 'winnings', 'lottery',
    'gambling', 'bonus payment', 'christmas bonus', 'birthday money'
  ],

  // Refund - Tax refunds, returns
  'refund': [
    'refund', 'tax refund', 'ird refund', 'ato refund', 'return',
    'reimbursement', 'cashback', 'rebate'
  ],

  // Other Income - Miscellaneous income
  'other-income': [
    'other income', 'miscellaneous', 'side hustle', 'odd job',
    'extra income', 'additional income'
  ]
};

/**
 * Get category ID based on merchant name or description
 * @param text - The text to analyze (merchant name, description, etc.)
 * @returns The category ID or null if no match found
 */
export function getCategoryFromBusiness(text: string): string | null {
  const searchText = text.toLowerCase().trim();
  
  // First pass: Look for exact phrase matches (prioritize longer, more specific matches)
  let bestMatch = { categoryId: '', matchLength: 0 };
  
  for (const [categoryId, keywords] of Object.entries(BUSINESS_CATEGORY_MAPPING)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        // Prioritize longer matches (more specific)
        if (keyword.length > bestMatch.matchLength) {
          bestMatch = { categoryId, matchLength: keyword.length };
        }
      }
    }
  }
  
  return bestMatch.categoryId || null;
}

/**
 * Get all business names for a specific category
 * @param categoryId - The category ID to get businesses for
 * @returns Array of business names/keywords for that category
 */
export function getBusinessesForCategory(categoryId: string): string[] {
  return BUSINESS_CATEGORY_MAPPING[categoryId] || [];
}

/**
 * Get all available category IDs that have business mappings
 * @returns Array of category IDs
 */
export function getAvailableCategories(): string[] {
  return Object.keys(BUSINESS_CATEGORY_MAPPING);
}
