const slugify = require('slugify');

/**
 * Generate URL-safe slug from Vietnamese text
 */
const generateSlug = (text) =>
  slugify(text, { lower: true, strict: true, locale: 'vi', trim: true });

module.exports = { generateSlug };
