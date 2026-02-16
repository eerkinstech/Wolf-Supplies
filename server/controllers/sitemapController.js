const Product = require('../models/Product.js');
const Page = require('../models/Page.js');

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
 * Generate sitemap.xml for SEO
 * GET /api/sitemap.xml
 */
const generateSitemap = async (req, res) => {
    try {
        // Fetch all published products and pages
        const products = await Product.find({ isDraft: false }).select('slug updatedAt').lean();
        const pages = await Page.find({ published: true }).select('slug updatedAt').lean();

        // Build URL entries
        let urlEntries = '';

        // Add homepage
        urlEntries += `
  <url>
    <loc>https://wolfsupplies.co.uk/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

        // Add products
        if (products && products.length > 0) {
            products.forEach((product) => {
                const lastmod = product.updatedAt
                    ? new Date(product.updatedAt).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];

                urlEntries += `
  <url>
    <loc>https://wolfsupplies.co.uk/product/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
        }

        // Add static pages
        const staticPages = [
            { slug: 'products', priority: 0.8, changefreq: 'weekly' },
            { slug: 'categories', priority: 0.7, changefreq: 'weekly' },
            { slug: 'about-us', priority: 0.6, changefreq: 'monthly' },
            { slug: 'contact-us', priority: 0.6, changefreq: 'monthly' },
            { slug: 'search', priority: 0.6, changefreq: 'weekly' },
            { slug: 'checkout', priority: 0.7, changefreq: 'daily' },
            { slug: 'cart', priority: 0.7, changefreq: 'daily' },
            { slug: 'order-lookup', priority: 0.6, changefreq: 'monthly' },
            { slug: 'wishlist', priority: 0.6, changefreq: 'weekly' },
            { slug: 'payment-options', priority: 0.6, changefreq: 'monthly' },
            { slug: 'policies/shipping', priority: 0.5, changefreq: 'yearly' },
            { slug: 'policies/returns', priority: 0.5, changefreq: 'yearly' },
            { slug: 'policies/privacy', priority: 0.5, changefreq: 'yearly' },
            { slug: 'policies/terms', priority: 0.5, changefreq: 'yearly' },
            { slug: 'policies/faq', priority: 0.6, changefreq: 'monthly' },
        ];

        staticPages.forEach((page) => {
            urlEntries += `
  <url>
    <loc>https://wolfsupplies.co.uk/${page.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // Add custom pages from database
        if (pages && pages.length > 0) {
            pages.forEach((page) => {
                const lastmod = page.updatedAt
                    ? new Date(page.updatedAt).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];

                urlEntries += `
  <url>
    <loc>https://wolfsupplies.co.uk/page/${encodeURIComponent(page.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
            });
        }

        // Build complete sitemap
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

        // Send response with proper content type
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(sitemap);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ message: 'Error generating sitemap', error: error.message });
    }
};

/**
 * Generate sitemap-products.xml specifically for products
 * GET /api/sitemap-products.xml
 */
const generateProductSitemap = async (req, res) => {
    try {
        const products = await Product.find({ isDraft: false })
            .select('slug name images price updatedAt')
            .lean();

        if (!products || products.length === 0) {
            const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.send(emptySitemap);
        }

        let urlEntries = '';

        products.forEach((product) => {
            const lastmod = product.updatedAt
                ? new Date(product.updatedAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            const images = product.images?.filter(img => img) || [];
            let imageXml = '';

            if (images.length > 0) {
                const imageUrl = images[0].startsWith('http')
                    ? images[0]
                    : `https://wolfsupplies.co.uk${images[0]}`;

                // Properly escape XML special characters in image URL
                const escapedImageUrl = escapeXml(imageUrl);
                const escapedTitle = escapeXml(product.name || '');

                imageXml = `
    <image:image>
      <image:loc>${escapedImageUrl}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>`;
            }

            urlEntries += `
  <url>
    <loc>https://wolfsupplies.co.uk/product/${encodeURIComponent(product.slug)}</loc>${imageXml}
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.send(sitemap);

    } catch (error) {
        console.error('Error generating product sitemap:', error);
        res.status(500).json({ message: 'Error generating product sitemap', error: error.message });
    }
};

module.exports = {
    generateSitemap,
    generateProductSitemap,
};
