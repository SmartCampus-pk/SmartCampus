# Smart Campus Design System

## Color Palette

### Primary Colors
- `--color-primary-500`: #ff6b35 (Main brand color)
- `--color-primary-600`: #ea580c (Hover/Active state)
- `--color-primary-700`: #c2410c (Dark variant)
- `--color-primary-50`: #fff7ed (Light background)
- `--color-primary-100`: #ffedd5 (Lighter background)

### Neutral Colors
- `--color-gray-50`: #f9fafb (Lightest gray)
- `--color-gray-100`: #f3f4f6
- `--color-gray-200`: #e5e7eb
- `--color-gray-300`: #d1d5db
- `--color-gray-600`: #4b5563
- `--color-gray-700`: #374151
- `--color-gray-900`: #1a1a1a (Text primary)

### Semantic Colors
- `--color-success`: #10b981 (Success states)
- `--color-error`: #ef4444 (Error states)

## Typography

### Font Families
- System: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell

### Font Sizes
- Headings follow a modular scale
- Body text: 1rem (16px base)
- Small text: 0.875rem (14px)

## Spacing

Based on 0.25rem (4px) scale:
- `--spacing-1`: 0.25rem (4px)
- `--spacing-2`: 0.5rem (8px)
- `--spacing-3`: 0.75rem (12px)
- `--spacing-4`: 1rem (16px)
- `--spacing-5`: 1.5rem (24px)
- `--spacing-6`: 2rem (32px)
- `--spacing-8`: 3rem (48px)
- `--spacing-10`: 4rem (64px)
- `--spacing-12`: 6rem (96px)

## Border Radius

- `--radius-sm`: 0.375rem (6px)
- `--radius-md`: 0.5rem (8px)
- `--radius-lg`: 0.75rem (12px)
- `--radius-xl`: 1rem (16px)
- `--radius-full`: 9999px (Fully rounded)

## Shadows

- `--shadow-sm`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- `--shadow-md`: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
- `--shadow-lg`: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
- `--shadow-xl`: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)

## Components

### Buttons

#### Primary Button (.btn-primary)
- Background: Linear gradient from primary-500 to primary-600
- Color: White
- Shadow: sm (hover: lg)
- Hover: translateY(-2px)

#### Secondary Button (.btn-secondary)
- Background: gray-100
- Color: gray-700
- Hover: gray-200, translateY(-2px)

### Cards

#### Event Card
- Background: White
- Border: 1px solid gray-200
- Border radius: lg
- Shadow: sm (hover: md)
- Hover: translateY(-4px)

#### Organization Card
- Similar to Event Card
- Logo section with fixed height

### Inputs

- Border: 2px solid gray-300
- Border radius: md
- Padding: spacing-3 spacing-4
- Min height: 44px (accessibility)
- Focus: border-color primary-500, shadow ring

## Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Accessibility

- Min touch target: 44px × 44px
- Focus states: Visible ring with primary color
- Color contrast: WCAG AA compliant
- Semantic HTML throughout

## Usage Guidelines

1. **Consistency**: Always use design tokens (CSS variables) instead of hardcoded values
2. **Spacing**: Use the spacing scale for margins, paddings, and gaps
3. **Colors**: Stick to the defined palette for brand consistency
4. **Shadows**: Use appropriate shadow depth for elevation hierarchy
5. **Animations**: Use predefined transitions for consistency

## File Structure

- Main stylesheet: `src/app/(frontend)/styles.css`
- Component-specific styles: Co-located with components (e.g., `EventStatsCard.css`)
- Design tokens: Defined in `:root` of main stylesheet
