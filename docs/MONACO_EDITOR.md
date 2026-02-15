# Monaco Editor Integration

Professional code editing experience powered by VS Code's Monaco Editor.

## Features

### CodeEditor Component

✅ **Syntax Highlighting**
- TypeScript/TSX support
- JavaScript/JSX support
- Automatic language detection

✅ **Code Editing**
- IntelliSense (auto-complete)
- Error detection
- Format on type/paste
- Line numbers
- Minimap

✅ **Themes**
- Dark mode (vs-dark)
- Light mode
- Toggle button

✅ **Toolbar Actions**
- Copy code to clipboard
- Download as file
- Fullscreen mode
- Theme toggle

✅ **Editor Options**
- Word wrap
- Auto-formatting
- Tab size: 2 spaces
- Read-only mode support

### ComponentViewer Component

✅ **View Modes**
- **Code Only** - Full code editor
- **Preview** - Component preview (placeholder for now)
- **Split View** - Code + preview side-by-side

✅ **Code Editing**
- Edit component code live
- Save changes to database
- Auto-detects unsaved changes
- Real-time change tracking

✅ **Actions**
- Save component
- Copy code
- Download file
- Toggle fullscreen
- Close viewer

## Usage

### Basic Code Editor

```tsx
import CodeEditor from '@/components/CodeEditor'

function MyComponent() {
  const [code, setCode] = useState('const hello = "world"')

  return (
    <CodeEditor
      code={code}
      language="typescript"
      onChange={setCode}
      fileName="example.ts"
    />
  )
}
```

### Component Viewer

```tsx
import ComponentViewer from '@/components/ComponentViewer'

function MyComponent() {
  const [selectedComponent, setSelectedComponent] = useState(null)

  return (
    <>
      <button onClick={() => setSelectedComponent(component)}>
        View Component
      </button>

      {selectedComponent && (
        <ComponentViewer
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onUpdate={() => console.log('Component updated')}
        />
      )}
    </>
  )
}
```

## Component Props

### CodeEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | - | The code to display |
| `language` | `string` | `'typescript'` | Language mode |
| `onChange` | `(value: string) => void` | - | Called when code changes |
| `readOnly` | `boolean` | `false` | Disable editing |
| `fileName` | `string` | `'Component.tsx'` | Display name |

### ComponentViewer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `component` | `Component` | ✅ | Component object with id, name, code, language |
| `onClose` | `() => void` | ✅ | Called when viewer closes |
| `onUpdate` | `() => void` | - | Called after saving changes |

## Keyboard Shortcuts

Monaco Editor supports all standard VS Code shortcuts:

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Format document |
| `Cmd/Ctrl + F` | Find |
| `Cmd/Ctrl + H` | Find and replace |
| `Cmd/Ctrl + /` | Toggle comment |
| `Cmd/Ctrl + D` | Select next occurrence |
| `Alt + Up/Down` | Move line up/down |
| `Shift + Alt + Up/Down` | Copy line up/down |
| `Cmd/Ctrl + Shift + K` | Delete line |

## Workflow

### Viewing Component Code

1. Click "Generate Code" on a design
2. Click on a component to expand
3. Click "View" button
4. Component opens in full-screen editor

### Editing Component Code

1. Open component in ComponentViewer
2. Switch to "Code" or "Split" view
3. Edit the code
4. "Save Changes" button appears
5. Click to save to database
6. Changes persist across sessions

### Copying/Downloading

1. Open component in viewer
2. Click "Copy" in toolbar → Copied to clipboard
3. Click "Download" → Saves as .tsx file
4. Use in your project

## View Modes

### Code Only
- Full-screen code editor
- Best for focused editing
- All Monaco features available

### Preview (Coming Soon)
- Live component rendering
- See changes in real-time
- Currently shows placeholder

### Split View
- Code on right, preview on left
- Edit and see results side-by-side
- Best for iterative development

## Saving Changes

Changes are saved to Supabase via API:

```typescript
// Triggered when "Save Changes" is clicked
PUT /api/components/:id
{
  "code": "updated code here"
}
```

After saving:
- `hasChanges` resets to false
- Database updated
- `onUpdate` callback fired
- Other users see updated code

## Themes

**Dark Theme (vs-dark)**
- Easy on eyes
- Professional look
- Default theme

**Light Theme**
- High contrast
- Better for bright environments
- Toggle anytime

## Fullscreen Mode

- Click maximize icon
- Editor expands to full window
- Press ESC or click minimize to exit
- Useful for focused coding

## Future Enhancements

Planned features:

- [ ] Live component preview (iframe rendering)
- [ ] Hot module reload for preview
- [ ] Multiple file editing (imports)
- [ ] Git-style diff view (show changes)
- [ ] Version history
- [ ] Collaborative editing (multiplayer)
- [ ] Prettier integration
- [ ] ESLint integration
- [ ] TypeScript type checking
- [ ] Import optimization

## Performance

Monaco Editor is loaded asynchronously:

```tsx
import Editor from '@monaco-editor/react'
```

- Lazy-loaded (doesn't slow initial page load)
- Cached after first load
- Minimal bundle impact
- Runs in Web Worker (non-blocking)

## Browser Support

Works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Brave, Arc, etc.

Requires JavaScript enabled.

## Troubleshooting

### Editor not loading
- Check console for errors
- Ensure Monaco package installed
- Clear browser cache

### Code not saving
- Check authentication (must be logged in)
- Verify API is running (port 3000)
- Check network tab for failed requests

### Fullscreen not working
- Check browser permissions
- Try clicking again
- Use ESC to exit

### Syntax highlighting wrong
- Verify `language` prop is correct
- Supported: typescript, javascript, tsx, jsx
- Check file extension matches

## Examples

### Read-Only Viewer

```tsx
<CodeEditor
  code={component.code}
  language="typescript"
  readOnly={true}
  fileName="ReadOnly.tsx"
/>
```

### Custom Theme

```tsx
// Component handles theme internally
// User can toggle with button
```

### With Auto-Save

```tsx
const [code, setCode] = useState(initial)

useEffect(() => {
  const timer = setTimeout(() => {
    saveToDatabase(code)
  }, 1000)
  return () => clearTimeout(timer)
}, [code])

return <CodeEditor code={code} onChange={setCode} />
```

## Integration with Code Generation

The Monaco editor integrates seamlessly with Phase 4 (Code Generation):

1. **Generate** - Click "Generate Code" on design
2. **View** - Components appear in DesignCard
3. **Edit** - Click "View" → Opens Monaco editor
4. **Save** - Edit and save changes
5. **Download** - Export to your project

All changes are:
- Saved to Supabase
- Accessible via API
- Available in Claude Desktop (via MCP)
- Synced across all interfaces

---

**Enjoy professional code editing in your browser!** 💻
