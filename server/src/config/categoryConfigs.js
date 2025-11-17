const CATEGORY_CONFIGS = {
  IN: [
    { category: 'Groceries', keywords: ['grocery', 'bigbasket', 'dmart', 'fresh', 'hypermarket'], weight: 0.9 },
    { category: 'Food & Dining', keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'eatery', 'dine'], weight: 0.8 },
    { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'lifestyle', 'mall'], weight: 0.8 },
    { category: 'Utilities', keywords: ['electric', 'power', 'water', 'gas', 'recharge', 'dth', 'broadband'], weight: 0.7 },
    { category: 'Transport', keywords: ['uber', 'ola', 'metro', 'fuel', 'petrol', 'diesel'], weight: 0.6 },
    { category: 'Salary', keywords: ['salary', 'payroll', 'credited', 'neft', 'imps'], weight: 0.9 },
    { category: 'Fees & Charges', keywords: ['fee', 'charge', 'penalty', 'gst', 'imposed'], weight: 0.5 },
    { category: 'Rent & Housing', keywords: ['rent', 'maintenance', 'housing', 'builder'], weight: 0.7 },
  ],
  SG: [
    { category: 'Dining', keywords: ['grabfood', 'foodpanda', 'restaurant'], weight: 0.8 },
    { category: 'Transport', keywords: ['grab', 'gocar', 'ez-link', 'mrt'], weight: 0.7 },
    { category: 'Utilities', keywords: ['sp services', 'singtel', 'starhub'], weight: 0.7 },
    { category: 'Shopping', keywords: ['shopee', 'lazada', 'qoo10'], weight: 0.8 },
  ],
};

const DEFAULT_REGION = 'IN';

function getCategoryConfig(region) {
  return CATEGORY_CONFIGS[region?.toUpperCase()] || CATEGORY_CONFIGS[DEFAULT_REGION];
}

module.exports = {
  CATEGORY_CONFIGS,
  DEFAULT_REGION,
  getCategoryConfig,
};

