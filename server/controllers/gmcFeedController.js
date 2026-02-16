const Product = require('../models/Product.js');

/**
 * Helper function to escape XML special characters
 */
const escapeXml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Generate Google Merchant Center XML Feed
 * GET /api/gmc-feed.xml
 */
const generateGMCFeed = async (req, res) => {
    try {
        // Fetch all published (non-draft) products
        const products = await Product.find({ isDraft: false })
            .populate('categories')
            .lean();

        if (!products || products.length === 0) {
            // Return empty but valid RSS feed
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.send('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Wolf Supplies</title><link>https://wolfsupplies.co.uk</link><description>Product Feed</description></channel></rss>');
        }

        // Build product items XML
        let itemsXml = '';

        for (const product of products) {
            // Determine availability
            const availability = product.inStock || product.stock > 0 ? 'in stock' : 'out of stock';

            // Get primary image
            let imageLink = '';
            if (product.images && product.images.length > 0) {
                imageLink = product.images[0].startsWith('http')
                    ? product.images[0]
                    : `https://wolfsupplies.co.uk${product.images[0]}`;
            }

            // Build product URL - using slug for SEO-friendly URLs
            const productUrl = `https://wolfsupplies.co.uk/product/${product.slug}`;

            // Get brand - use first category name as brand or fallback to company name
            const brand = (product.categories && product.categories.length > 0 && product.categories[0].name)
                ? product.categories[0].name
                : 'Wolf Supplies';

            // Get SKU - use product ID prefixed with 'WOLF-' or use variant SKU
            const sku = product.variantCombinations && product.variantCombinations.length > 0
                ? product.variantCombinations[0].sku || `WOLF-${product._id}`
                : `WOLF-${product._id}`;

            // Clean description - strip HTML tags and limit length
            const plainDescription = product.description
                ? escapeXml(product.description.replace(/<[^>]*>/g, '').substring(0, 5000))
                : escapeXml(product.name);

            // Build item XML
            itemsXml += `
    <item>
      <g:id>${escapeXml(product._id.toString())}</g:id>
      <g:title>${escapeXml(product.name.substring(0, 150))}</g:title>
      <g:description>${plainDescription}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${escapeXml(availability)}</g:availability>
      <g:price>${escapeXml(product.price.toString())} GBP</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:sku>${escapeXml(sku)}</g:sku>
      <g:item_type>product</g:item_type>`;

            // Add optional fields
            if (product.rating > 0) {
                itemsXml += `\n      <g:review_rating>${product.rating}</g:review_rating>`;
            }
            if (product.numReviews > 0) {
                itemsXml += `\n      <g:review_count>${product.numReviews}</g:review_count>`;
            }

            // Include additional images (up to 10 total)
            if (product.images && product.images.length > 1) {
                for (let i = 1; i < Math.min(product.images.length, 10); i++) {
                    const additionalImg = product.images[i].startsWith('http')
                        ? product.images[i]
                        : `https://wolfsupplies.co.uk${product.images[i]}`;
                    itemsXml += `\n      <g:additional_image_link>${escapeXml(additionalImg)}</g:additional_image_link>`;
                }
            }

            itemsXml += `\n    </item>`;
        }

        // Build complete RSS feed
        const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Wolf Supplies - Product Feed</title>
    <link>https://wolfsupplies.co.uk</link>
    <description>Google Merchant Center Feed for Wolf Supplies</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${itemsXml}
  </channel>
</rss>`;

        // Send response with proper content type
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(feed);

    } catch (error) {
        console.error('Error generating GMC feed:', error);
        res.status(500).json({ message: 'Error generating GMC feed', error: error.message });
    }
};

module.exports = {
    generateGMCFeed,
};
