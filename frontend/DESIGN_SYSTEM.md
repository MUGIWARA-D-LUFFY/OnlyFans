# OnlyFans-Style Design System

This project uses a complete OnlyFans-inspired CSS design system optimized for:
- Long scrolling
- Media consumption
- Low visual fatigue
- High engagement retention

## Design Philosophy

**Style Type:** Minimalist · Neutral · Content-First · Mobile-Dominant

**Key Intentions:**
- Remove visual noise
- Let media dominate
- Make interactions frictionless
- Encourage habitual scrolling
- No gradients, no flashy animations, no decorative clutter

## Color System

### Primary Brand Color
- `--primary-blue: #00AFF0` - Used for CTA buttons, links, icons, active states

### Neutral Palette
- `--white: #ffffff` - Background
- `--light-gray: #f1f3f5` - Light backgrounds
- `--border-gray: #e6e6e6` - Borders
- `--text-black: #000000` - Primary text
- `--text-gray: #6b7280` - Secondary text

## Typography

**Font Stack:** System UI fonts for performance and native feel
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

**Font Sizes:**
- `--title: 18px` - Titles and headings
- `--body: 15px` - Body text
- `--meta: 13px` - Metadata and secondary info
- `--caption: 12px` - Captions and small text

## Layout Architecture

### Grid Structure
- Center feed: ~600-650px max-width
- Sidebars: 280px fixed width (hidden on mobile)
- Container: 1200px max-width

### Classes
- `.container` - Main content container with auto margins
- `.feed-container` - Flex container for feed layout
- `.feed-main` - Main feed column (centered, 650px max)
- `.sidebar` - Sidebar column (280px, sticky)

## Components

### Cards
```css
.card {
  background: var(--white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border-gray);
}
```

### Buttons

**Primary Button:**
```css
.button-primary {
  background: var(--primary-blue);
  color: var(--white);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 600;
}
```

**Secondary Button:**
```css
.button-secondary {
  background: transparent;
  color: var(--primary-blue);
  border: 1px solid var(--primary-blue);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 600;
}
```

### Forms
- Inputs use `--border-gray` for borders
- Focus state: `--primary-blue` border
- Rounded corners: 8px
- Padding: 10px

### Media
```css
.media {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}
```

## Spacing System

- `--spacing-xs: 4px`
- `--spacing-sm: 8px`
- `--spacing-md: 12px`
- `--spacing-lg: 16px`
- `--spacing-xl: 24px`

## Border Radius

- `--radius-sm: 8px` - Small elements
- `--radius-md: 12px` - Cards and media
- `--radius-full: 999px` - Buttons and pills

## Transitions

- `--transition-fast: all 0.15s ease-in-out` - Subtle hover effects

## Responsive Design

Mobile breakpoint: `768px`

**Mobile changes:**
- Sidebars collapse
- Feed becomes full width
- Buttons become larger (12px 20px padding)
- Touch-friendly spacing

## Usage Examples

### Card Component
```tsx
<div className="card">
  <div className="media">
    <img src="..." alt="..." />
  </div>
  <h3 className="text-title">Title</h3>
  <p className="text-meta">Metadata</p>
</div>
```

### Button
```tsx
<button className="button-primary">Click Me</button>
<button className="button-secondary">Cancel</button>
```

### Form Input
```tsx
<input type="text" placeholder="Enter text..." />
```

## Key Principles

1. **White background always** - Creates trust and clarity
2. **Blue CTA** - Calm and safe feeling
3. **Rounded corners** - Friendly appearance
4. **Minimal UI** - Encourages addictive scrolling
5. **Content dominance** - Optimizes for monetization

## No Dark Mode

This design system is optimized for bright viewing and media clarity. Dark mode is intentionally not implemented to match the OnlyFans aesthetic.

