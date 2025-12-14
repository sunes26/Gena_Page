# Missing Icons and Images - SEO & PWA Requirements

This document lists all icon and image files that are referenced in the codebase but currently missing. These files are required for optimal SEO, PWA functionality, and social media sharing.

## Priority: Critical

### 1. Favicon
**File:** `public/favicon.ico`
- **Size:** 32x32, 16x16 (multi-resolution ICO file)
- **Purpose:** Browser tab icon
- **Referenced in:** `middleware.ts:72`
- **Spec:** Standard favicon format, should include 16x16 and 32x32 sizes in one file
- **Tool:** Use a favicon generator or create from logo.png

### 2. Open Graph Image (General)
**File:** `public/og-image.png`
- **Size:** 1200x630 pixels
- **Purpose:** Social media preview (Twitter, Facebook, LinkedIn)
- **Referenced in:**
  - `lib/metadata.ts:23` (default OG image)
  - `lib/metadata.ts:277` (Product schema)
  - `app/(marketing)/page.tsx:33`
  - `app/(marketing)/layout.tsx:13,24`
- **Spec:**
  - Aspect ratio: 1.91:1 (required by Facebook/Twitter)
  - Format: PNG or JPG
  - Max file size: 8MB (recommended < 300KB)
  - Safe zone: Keep important content within 1200x600 center area
- **Content suggestions:**
  - App logo
  - Tagline: "웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로"
  - Clean background with brand colors

### 3. Open Graph Image (Pricing)
**File:** `public/og-pricing.png`
- **Size:** 1200x630 pixels
- **Purpose:** Social media preview for pricing page
- **Referenced in:** `app/(marketing)/pricing/page.tsx:22`
- **Spec:** Same as og-image.png
- **Content suggestions:**
  - Highlight pricing plans (Free vs Pro)
  - Show key features or value proposition

## Priority: High

### 4. Logo (Public Root)
**File:** `public/logo.png`
- **Size:** 512x512 pixels (square, transparent background)
- **Purpose:** Organization schema for SEO
- **Referenced in:** `lib/metadata.ts:219` (Organization schema)
- **Spec:**
  - Square format
  - Transparent background (PNG)
  - High resolution for various uses
- **Note:** Currently exists at `public/images/logo.png` - consider copying/symlinking to root

### 5. PWA App Icons
**File:** `public/icon-192x192.png`
- **Size:** 192x192 pixels
- **Purpose:** PWA maskable icon (Android)
- **Referenced in:** `app/manifest.ts:26,38,81,94`
- **Spec:**
  - Square format
  - Maskable safe zone: 40px padding on all sides (icon content within 112x112 center)
  - PNG format with transparency

**File:** `public/icon-512x512.png`
- **Size:** 512x512 pixels
- **Purpose:** PWA maskable icon (Android, high-res displays)
- **Referenced in:** `app/manifest.ts:32,44`
- **Spec:**
  - Square format
  - Maskable safe zone: 102px padding on all sides (icon content within 308x308 center)
  - PNG format with transparency

### 6. Apple Touch Icon
**File:** `public/apple-touch-icon.png`
- **Size:** 180x180 pixels
- **Purpose:** iOS home screen icon
- **Referenced in:** `app/manifest.ts:50`
- **Spec:**
  - Square format
  - PNG format
  - iOS automatically rounds corners - provide square image
  - No transparency (use solid background color)

## Priority: Medium

### 7. PWA Screenshots
**Directory:** `public/screenshots/`

**File:** `public/screenshots/desktop-1.png`
- **Size:** 1280x720 pixels
- **Purpose:** PWA install prompt screenshot (desktop)
- **Referenced in:** `app/manifest.ts:58`
- **Spec:**
  - 16:9 aspect ratio
  - PNG or JPG
  - Show dashboard or main feature
  - Label: "Gena Dashboard"

**File:** `public/screenshots/mobile-1.png`
- **Size:** 750x1334 pixels
- **Purpose:** PWA install prompt screenshot (mobile)
- **Referenced in:** `app/manifest.ts:65`
- **Spec:**
  - iPhone 6/7/8 aspect ratio (9:16)
  - PNG or JPG
  - Show mobile responsive view
  - Label: "Gena Mobile"

## Quick Setup Guide

### Option 1: Generate Icons (Recommended)
Use an online PWA icon generator:
1. Visit https://realfavicongenerator.net or https://www.pwabuilder.com/imageGenerator
2. Upload your source logo (`public/images/logo.png`)
3. Configure:
   - Favicon: 32x32, 16x16
   - Apple touch icon: 180x180
   - Android icons: 192x192, 512x512 (maskable)
4. Download and extract to `public/` directory

### Option 2: Manual Creation
Using image editing software (Photoshop, Figma, GIMP):

1. **Create favicon.ico:**
   ```bash
   # Using ImageMagick
   convert public/images/logo.png -resize 32x32 -colors 256 public/favicon.ico
   ```

2. **Create OG images:**
   - Create 1200x630 canvas
   - Add logo, text, and branding
   - Export as PNG (<300KB)

3. **Create PWA icons:**
   - Resize logo to 192x192 and 512x512
   - Ensure proper maskable safe zones
   - Export as PNG with transparency

4. **Create Apple touch icon:**
   - Resize to 180x180
   - Add solid background color
   - Export as PNG

### Option 3: Use Existing Logo
If you want to quickly test with the existing logo:

```bash
# From project root
cd public

# Create basic icons from existing logo (requires ImageMagick)
convert images/logo.png -resize 32x32 favicon.ico
convert images/logo.png -resize 192x192 icon-192x192.png
convert images/logo.png -resize 512x512 icon-512x512.png
convert images/logo.png -resize 180x180 apple-touch-icon.png
convert images/logo.png -resize 1200x630 -gravity center -extent 1200x630 og-image.png
cp og-image.png og-pricing.png

# Copy logo to root
cp images/logo.png logo.png

# Create screenshots directory
mkdir -p screenshots
```

## Verification Checklist

After adding icons, verify:

- [ ] Favicon appears in browser tab
- [ ] OG images show in social media link previews (test with https://www.opengraph.xyz/)
- [ ] PWA install prompt works on Android Chrome
- [ ] iOS home screen icon looks correct
- [ ] PWA manifest validates (test with https://manifest-validator.appspot.com/)
- [ ] Lighthouse PWA audit passes
- [ ] Google Search Console shows no missing image errors

## Design Specifications Summary

| File | Size | Format | Purpose |
|------|------|--------|---------|
| favicon.ico | 32x32, 16x16 | ICO | Browser tab |
| og-image.png | 1200x630 | PNG/JPG | Social preview |
| og-pricing.png | 1200x630 | PNG/JPG | Pricing page preview |
| logo.png | 512x512 | PNG | SEO schema |
| icon-192x192.png | 192x192 | PNG | PWA icon (low-res) |
| icon-512x512.png | 512x512 | PNG | PWA icon (high-res) |
| apple-touch-icon.png | 180x180 | PNG | iOS home screen |
| screenshots/desktop-1.png | 1280x720 | PNG/JPG | PWA desktop preview |
| screenshots/mobile-1.png | 750x1334 | PNG/JPG | PWA mobile preview |

## Additional Resources

- [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Open Graph Preview Tool](https://www.opengraph.xyz/)
- [PWA Manifest Validator](https://manifest-validator.appspot.com/)
- [Google's PWA Maskable Icon Guide](https://web.dev/maskable-icon/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Notes

- All icons should use the Gena brand colors and logo
- Maintain consistent visual identity across all icon sizes
- Test PWA installation on both Android and iOS devices
- Consider using SVG for icon.tsx (app icon) for better quality at all sizes
- OG images should be optimized for file size (use TinyPNG or similar)
- Screenshots should show actual app functionality, not placeholder content
