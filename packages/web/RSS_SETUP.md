# RSS Feed Setup

RSS feeds have been successfully added to the Lemma Oracle web application.

## Available RSS Feeds

1. **English RSS Feed**: `/rss.xml`
   - Contains all English blog posts
   - Accessible at: `https://lemma.frame00.com/rss.xml`

2. **Japanese RSS Feed**: `/ja/rss.xml`
   - Contains all Japanese blog posts
   - Accessible at: `https://lemma.frame00.com/ja/rss.xml`

## Features

- **Automatic Updates**: New blog posts automatically appear in the RSS feed
- **Rich Metadata**: Includes post titles, publication dates, descriptions, and categories
- **Stylish Display**: Includes XSL stylesheet for browser-friendly RSS viewing
- **Multi-language Support**: Separate feeds for English and Japanese content
- **Atom Support**: Includes Atom self-link for better feed discovery

## How It Works

The RSS feeds are generated using `@astrojs/rss` package. The feeds:
1. Fetch blog posts from the configured GitHub repository
2. Transform post data into RSS/Atom format
3. Generate XML files at build time

## Implementation Details

### Files Created

1. `src/pages/rss.xml.js` - English RSS feed endpoint
2. `src/pages/ja/rss.xml.js` - Japanese RSS feed endpoint  
3. `public/rss/styles.xsl` - XSL stylesheet for browser display

### Dependencies Added

- `@astrojs/rss: ^4.0.17` - RSS generation for Astro

## Adding RSS Links to UI

To make the RSS feeds discoverable, consider adding RSS links to:

### Navigation Component
Add RSS icons/links to the navigation menu:

```astro
<!-- Example in Navigation.astro -->
<a href="/rss.xml" title="Subscribe to RSS feed">
  <i class="fas fa-rss"></i> RSS
</a>
```

### Blog Pages
Add RSS subscription options to blog listing pages:

```astro
<!-- Example in BlogList.astro -->
<div class="rss-subscribe">
  <a href="/rss.xml" class="rss-link">
    <i class="fas fa-rss"></i> Subscribe to RSS
  </a>
</div>
```

### HTML Head
Add RSS autodiscovery links in the page head:

```html
<link rel="alternate" type="application/rss+xml" title="Lemma Oracle Blog RSS" href="/rss.xml" />
<link rel="alternate" type="application/rss+xml" title="Lemma Oracle ブログ RSS" href="/ja/rss.xml" />
```

## Testing

1. Build the application:
   ```bash
   pnpm build
   ```

2. Preview the build:
   ```bash
   pnpm preview
   ```

3. Visit the RSS feeds:
   - http://localhost:4321/rss.xml (English)
   - http://localhost:4321/ja/rss.xml (Japanese)

4. Test with RSS readers or validate with: https://validator.w3.org/feed/

## Environment Variables

The RSS feeds rely on the same environment variables as the blog system:
- `LEMMA_POSTS_REPO` - GitHub repository for blog posts
- `LEMMA_POSTS_BRANCH` - Branch to read from (default: "main")
- `LEMMA_POSTS_PATH` - Subdirectory inside the repo
- `LEMMA_GH_TOKEN` - Personal Access Token for private repos

## Customization

To customize the RSS feeds, modify:
- `src/pages/rss.xml.js` - English feed configuration
- `src/pages/ja/rss.xml.js` - Japanese feed configuration
- `public/rss/styles.xsl` - RSS display styles

## Troubleshooting

### No Posts in RSS Feed
- Ensure `LEMMA_POSTS_REPO` environment variable is set
- Check that blog posts have proper frontmatter (date, title, etc.)

### RSS Feed Not Updating
- Clear Astro build cache: `rm -rf node_modules/.astro`
- Rebuild the application

### RSS Validation Errors
- Check that all required fields are present in blog posts
- Ensure dates are in ISO 8601 format

## Resources

- [@astrojs/rss Documentation](https://docs.astro.build/en/guides/rss/)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Atom Syndication Format](https://tools.ietf.org/html/rfc4287)