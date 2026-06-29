# Design

## Theme

Piano-inspired warmth with professional clarity. Warm neutrals as base, with piano black/white accents and a warm accent color. Mobile-optimized spacing and typography.

## Palette (OKLCH)

### Brand Colors

```css
--piano-black: oklch(0.15 0.01 260);     /* #1a1a1a - Piano key black */
--piano-white: oklch(0.98 0.005 85);     /* #f8f6f3 - Ivory white */
--piano-accent: oklch(0.55 0.12 45);      /* #8b7355 - Warm brown/wood */
--piano-highlight: oklch(0.65 0.18 50);    /* #c9a66b - Gold/brass warmth */
```

### Neutral Ramp

```css
--ink-900: oklch(0.20 0.01 260);
--ink-700: oklch(0.35 0.012 260);
--ink-500: oklch(0.50 0.015 260);
--ink-300: oklch(0.70 0.01 260);

--surface-100: oklch(0.97 0.008 85);     /* Warm white */
--surface-200: oklch(0.94 0.01 85);      /* Ivory tint */
--surface-300: oklch(0.88 0.015 85);     /* Warm gray */

--muted: oklch(0.70 0.02 85);            /* Subtle warmth for borders */
```

### Semantic Colors

```css
--success: oklch(0.60 0.15 145);          /* Available slots - warm green */
--warning: oklch(0.70 0.12 75);          /* Pending alerts - warm amber */
--error: oklch(0.55 0.18 25);             /* Errors/booked - warm red */
--info: oklch(0.55 0.12 220);            /* Info - warm blue */
```

### Background Strategy

Body background: `--surface-100` (warm ivory, not cream)
Cards: `--piano-white` with subtle border
Sections: Alternating `--surface-100` / `--surface-200` for rhythm
Accents: `--piano-accent` for CTAs and highlights

## Typography

### Font Stack

```css
--font-display: 'Playfair Display', Georgia, serif;       /* Elegant headings */
--font-body: 'Inter', system-ui, sans-serif;               /* Clean, readable */
--font-mono: 'Space Mono', monospace;                       /* Times, codes */
```

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Space+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

```css
--text-xs: 0.75rem;     /* 12px - Labels, metadata */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body */
--text-lg: 1.125rem;    /* 18px - Emphasized body */
--text-xl: 1.25rem;     /* 20px - Subheadings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page headings */
--text-4xl: 2.25rem;    /* 36px - Hero subhead */
--text-5xl: clamp(2.5rem, 5vw + 1rem, 4rem); /* Hero - responsive */
```

### Typography Rules

**Headings:** `--font-display` with `font-weight: 600`
- Letter-spacing: -0.02em (elegant, not cramped)
- Line-height: 1.2
- `text-wrap: balance` on h1-h3

**Body:** `--font-body` with `font-weight: 400`
- Line-height: 1.6
- Max width: 65ch
- `text-wrap: pretty` on long prose

**Metadata/Times:** `--font-mono` with `font-weight: 500`

### Mobile Optimization

Body text minimum: 16px (never scale below)
Line-height: 1.6 on mobile
Reduced letter-spacing on small screens

## Components

### Buttons

**Primary:** `--piano-accent` background, white text, rounded 8px
- Hover: `--piano-highlight` background
- Active: Scale 0.98

**Secondary:** `--piano-black` background, white text, rounded 8px
- Hover: Lighten 10%

**Ghost:** `--muted` border, `--ink-700` text
- Hover: `--surface-200` background

```css
.btn {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease-out;
}

.btn-primary {
  background: var(--piano-accent);
  color: white;
}

.btn-primary:hover {
  background: var(--piano-highlight);
  transform: translateY(-1px);
}
```

### Cards

```css
.card {
  background: var(--piano-white);
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease-out;
}
```

### Input Fields

```css
.input {
  background: var(--surface-100);
  border: 1px solid var(--muted);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: var(--piano-accent);
  box-shadow: 0 0 0 3px var(--piano-accent-alpha-10);
}
```

### Calendar Slots

**Available:** Green background (`--success`), white text
**Booked:** Red background (`--error`), white text
**Pending:** Amber background (`--warning`), white text

```css
.slot-available {
  background: var(--success);
  cursor: pointer;
}

.slot-booked {
  background: var(--error);
  opacity: 0.7;
  cursor: not-allowed;
}
```

## Layout

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-mobile {
  padding: 0 var(--space-3);
}
```

### Grid

**Responsive card grid:**
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

**Calendar grid (mobile-first):**
```css
.calendar-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .calendar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Z-Index Scale

```css
--z-dropdown: 100;
--z-sticky: 200;
--z-modal-backdrop: 300;
--z-modal: 400;
--z-toast: 500;
--z-tooltip: 600;
```

## Motion

### Timing Functions

```css
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Transitions

```css
/* Fast micro-interactions */
.transition-fast {
  transition: all 0.15s var(--ease-out);
}

/* Standard transitions */
.transition {
  transition: all 0.2s var(--ease-out);
}

/* Slow, deliberate motions */
.transition-slow {
  transition: all 0.3s var(--ease-out);
}
```

### Animations

**Fade in:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale in:**
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Visual Elements

### Piano Keyboard Pattern

Subtle piano key pattern for decorative elements:
```css
.piano-keys {
  background: repeating-linear-gradient(
    to right,
    var(--piano-white) 0px,
    var(--piano-white) 20px,
    var(--piano-black) 20px,
    var(--piano-black) 24px
  );
  opacity: 0.05;
}
```

### Musical Notes

SVG icons for musical notes integrated tastefully:
- Header decoration
- Success confirmations
- Loading states

### Border Radius

```css
--radius-sm: 4px;    /* Tags, badges */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards */
--radius-xl: 16px;   /* Modals */
--radius-full: 9999px; /* Pills */
```

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.12);
```

**Note:** Never pair 1px borders with 8px+ blur shadows. Choose one.

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

Mobile-first approach. Test on:
- Small phone: 375px
- Phone: 414px
- Tablet: 768px
- Desktop: 1024px+
