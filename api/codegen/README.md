# Code Generation Engine

Converts Figma designs to React + Tailwind components automatically.

## How It Works

1. **Extract Frames** - Parse Figma document tree and find all frames/components
2. **Map Styles** - Convert Figma styles (colors, spacing, layout) to Tailwind classes
3. **Generate JSX** - Create React component code with proper structure
4. **Store Results** - Save generated components to database

## File Structure

```
api/codegen/
├── index.ts           # Orchestrator (main entry point)
├── figmaParser.ts     # Parse Figma node structure
├── styleMapper.ts     # Convert styles to Tailwind
├── codeGenerator.ts   # Generate React code
└── README.md          # This file
```

## Usage

### Via API

```bash
POST /api/designs/:designId/generate
Authorization: Bearer <token>
```

### Programmatically

```typescript
import { generateCodeFromDesign } from './codegen'

const result = await generateCodeFromDesign(designId)
// Returns: { designId, components, stats }
```

## Supported Features

### Layout

✅ **Auto Layout** → Flexbox
- Horizontal layout → `flex flex-row`
- Vertical layout → `flex flex-col`
- Alignment (justify-center, items-center, etc.)
- Gap (item spacing)

✅ **Padding**
- Mapped to Tailwind scale (p-4, pt-2, etc.)

### Styling

✅ **Colors**
- Fill colors → `bg-{color}`
- Common colors mapped to Tailwind palette
- Custom colors as arbitrary values `bg-[#abc123]`

✅ **Border Radius**
- Mapped to Tailwind scale (rounded, rounded-lg, etc.)

✅ **Text Styles**
- Font size → `text-{size}`
- Font weight → `font-{weight}`
- Text align → `text-{align}`

✅ **Shadows**
- Drop shadow effects → `shadow-lg`

### Node Types

✅ **TEXT** → `<div>` with text content
✅ **RECTANGLE** → `<div>` with background
✅ **FRAME** → `<div>` container
✅ **COMPONENT** → `<div>` container
✅ **GROUP** → `<div>` container

## Example

### Input: Figma Frame

```json
{
  "type": "FRAME",
  "name": "Button",
  "layoutMode": "HORIZONTAL",
  "paddingLeft": 16,
  "paddingRight": 16,
  "paddingTop": 8,
  "paddingBottom": 8,
  "itemSpacing": 8,
  "fills": [{ "type": "SOLID", "color": { "r": 0.23, "g": 0.51, "b": 0.96, "a": 1 } }],
  "cornerRadius": 8,
  "children": [
    {
      "type": "TEXT",
      "name": "Label",
      "characters": "Click me",
      "style": { "fontSize": 16, "fontWeight": 600 }
    }
  ]
}
```

### Output: React Component

```tsx
import React from 'react'

export default function Button() {
  return (
    <div className="flex flex-row px-4 py-2 gap-2 bg-blue-500 rounded-lg">
      <div className="text-base font-semibold">Click me</div>
    </div>
  )
}
```

## Limitations & Future Improvements

### Current Limitations

- Absolute positioning not fully supported (uses Auto Layout)
- Complex gradients not yet implemented
- Images need manual handling
- Interactive elements (buttons, inputs) generated as divs

### Planned Improvements

- [ ] Semantic HTML (button, input, etc. instead of div)
- [ ] Responsive breakpoints from Figma variants
- [ ] Image optimization and hosting
- [ ] Component props for dynamic content
- [ ] State management for interactive elements
- [ ] TypeScript interfaces from component structure
- [ ] Storybook stories generation
- [ ] Unit test scaffolding

## Customization

### Adding New Style Mappings

Edit `styleMapper.ts`:

```typescript
// Add new Tailwind mapping
function mapCustomStyle(node: FigmaNode): string[] {
  const classes: string[] = []

  if (node.customProperty) {
    classes.push('custom-tailwind-class')
  }

  return classes
}
```

### Supporting New Node Types

Edit `codeGenerator.ts`:

```typescript
switch (node.type) {
  case 'NEW_TYPE':
    return generateCustomElement(node)
  // ...
}
```

## Testing

```bash
# Run codegen on a specific design
curl -X POST http://localhost:3000/api/designs/:id/generate \
  -H "Authorization: Bearer $TOKEN"

# View generated components
curl http://localhost:3000/api/designs/:id/components \
  -H "Authorization: Bearer $TOKEN"
```

## Architecture Decision

**Why generate to database instead of files?**

- ✅ Multi-interface access (Web UI, MCP, CLI)
- ✅ Version history (via updated_at)
- ✅ User-specific permissions (RLS)
- ✅ Easy editing and updating
- ✅ No file system dependencies
- ✅ Works with Capacitor mobile app

Generated code can be exported to files when needed via API endpoint (future feature).
