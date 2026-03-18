<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <title><xsl:value-of select="/rss/channel/title"/> RSS Feed</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <meta name="description" content="{/rss/channel/description}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <style type="text/css">
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: #f9f9f9;
      }
      
      header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin-bottom: 10px;
      }
      
      .description {
        color: #7f8c8d;
        font-size: 1.2rem;
        margin-bottom: 20px;
      }
      
      .meta {
        color: #95a5a6;
        font-size: 0.9rem;
        margin-bottom: 30px;
      }
      
      .feed-info {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      
      .item {
        background: white;
        border-radius: 8px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      
      .item h2 {
        margin-top: 0;
        color: #3498db;
        font-size: 1.5rem;
      }
      
      .item h2 a {
        color: inherit;
        text-decoration: none;
      }
      
      .item h2 a:hover {
        text-decoration: underline;
      }
      
      .item-meta {
        color: #95a5a6;
        font-size: 0.9rem;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
      }
      
      .date {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      
      .category {
        display: inline-flex;
        align-items: center;
        background: #f1f8ff;
        color: #0366d6;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        gap: 5px;
      }
      
      .description {
        color: #555;
        margin-bottom: 15px;
      }
      
      .read-more {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #3498db;
        text-decoration: none;
        font-weight: 500;
      }
      
      .read-more:hover {
        text-decoration: underline;
      }
      
      footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        color: #95a5a6;
        font-size: 0.9rem;
      }
      
      .subscribe-options {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
      }
      
      .subscribe-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        transition: background 0.2s ease;
      }
      
      .subscribe-btn:hover {
        background: #2980b9;
      }
      
      @media (max-width: 600px) {
        body {
          padding: 15px;
        }
        
        h1 {
          font-size: 2rem;
        }
        
        .item {
          padding: 20px;
        }
        
        .subscribe-options {
          flex-direction: column;
          align-items: center;
        }
        
        .item-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <h1><xsl:value-of select="/rss/channel/title"/></h1>
      <div class="description"><xsl:value-of select="/rss/channel/description"/></div>
      <div class="meta">
        <span><i class="fas fa-rss"></i> RSS Feed</span>
        <span> · </span>
        <span><xsl:value-of select="count(/rss/channel/item)"/> articles</span>
        <span> · </span>
        <span>Updated: <xsl:value-of select="/rss/channel/lastBuildDate"/></span>
      </div>
    </header>
    
    <div class="feed-info">
      <p>This is an RSS feed. Subscribe to get automatic updates when new content is published.</p>
      <div class="subscribe-options">
        <a href="#" class="subscribe-btn" onclick="navigator.clipboard.writeText(window.location.href); alert('Feed URL copied to clipboard!'); return false;">
          <i class="fas fa-link"></i> Copy Feed URL
        </a>
        <a href="https://aboutfeeds.com" class="subscribe-btn" target="_blank">
          <i class="fas fa-info-circle"></i> Learn about RSS
        </a>
      </div>
    </div>
    
    <xsl:for-each select="/rss/channel/item">
      <div class="item">
        <h2>
          <a href="{link}">
            <xsl:value-of select="title"/>
          </a>
        </h2>
        <div class="item-meta">
          <span class="date">
            <i class="far fa-calendar"></i>
            <xsl:value-of select="pubDate"/>
          </span>
          <xsl:if test="category">
            <span class="category">
              <i class="fas fa-tag"></i>
              <xsl:value-of select="category"/>
            </span>
          </xsl:if>
        </div>
        <div class="description">
          <xsl:value-of select="description"/>
        </div>
        <a href="{link}" class="read-more">
          <i class="fas fa-arrow-right"></i> Read full article
        </a>
      </div>
    </xsl:for-each>
    
    <footer>
      <p>© <xsl:value-of select="/rss/channel/copyright"/></p>
      <p>Generated by <a href="https://astro.build/">Astro</a> with <a href="https://docs.astro.build/en/guides/rss/">@astrojs/rss</a></p>
    </footer>
  </body>
</html>
</xsl:template>
</xsl:stylesheet>