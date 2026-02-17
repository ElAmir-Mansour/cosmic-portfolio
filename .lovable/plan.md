

# Interactive X-Ray Architecture Walkthroughs

## Overview
Upgrade the `ArchitectureDiagram` component so that each node in the SVG flowchart is clickable. Clicking a node reveals a syntax-highlighted code snippet tied to that technology/layer, proving real code quality directly inside the visualization.

## Data Schema Changes

### 1. Extend `DataService.ts` with a `CodeSnippet` interface

Add a new interface and attach it to the `Project` type:

```typescript
export interface CodeSnippet {
  nodeId: string;       // matches the Mermaid node ID (e.g., "B", "C")
  language: string;     // "swift", "go", "python", "typescript", etc.
  filename: string;     // e.g., "ViewModel.swift", "main.go"
  code: string;         // the actual code string (multi-line)
}
```

Add `codeSnippets?: CodeSnippet[]` to the `Project` interface alongside the existing `architecture` field.

### 2. Populate `content.json` with sample snippets

For projects that already have `architecture` definitions (e.g., Fitness Tracker, E-Commerce Platform, Sentiment Analysis Engine), add 2-3 representative code snippets per project. Examples:

- **Fitness Tracker** node "B" (ViewModel): A SwiftUI ObservableObject snippet showing HealthKit data binding
- **E-Commerce** node "B" (Go Backend): A Go HTTP handler showing goroutine-based order processing
- **Sentiment Analysis** node "C" (BERT Encoder): A Python snippet showing model loading and tokenization

## Component Changes

### 3. Refactor `ArchitectureDiagram.tsx`

**Props**: Accept a new optional `codeSnippets` prop of type `CodeSnippet[]`.

**Interactive nodes**: 
- Make each SVG `<g>` node clickable with a `cursor: pointer` style and a hover highlight effect (brighter stroke on hover)
- Track `selectedNodeId` state
- When a node is clicked, check if a matching snippet exists in `codeSnippets` (by `nodeId`)
- If a match exists, display the code panel; if not, show nothing (node stays non-interactive visually for nodes without snippets)
- Nodes with available snippets get a small dot indicator (e.g., a 4px circle in the corner) so users know they are clickable

**Code panel**: 
- Render below the SVG as a collapsible section within the same modal
- Show the filename as a header tab, the language as a badge, and the code in a `<pre><code>` block
- Apply basic syntax coloring using a lightweight approach: keyword highlighting via regex for common keywords (`const`, `func`, `class`, `import`, `return`, `if`, `for`, `def`, `self`) mapped to CSS classes
- No external syntax highlighting library needed; simple regex-based token coloring keeps the bundle small

**Close behavior**: Clicking the same node again or clicking a different node toggles/swaps the snippet.

### 4. Update `PlanetDrawer.tsx`

Pass `project.codeSnippets` to `ArchitectureDiagram` in the `DefaultProjectCard` component:

```tsx
<ArchitectureDiagram 
  definition={project.architecture} 
  title={`${project.title} Architecture`}
  codeSnippets={project.codeSnippets}
/>
```

### 5. Admin Editor Support

Add a `CodeSnippetsEditor` sub-component in `Admin.tsx` that allows adding/editing/removing code snippets per project. Each snippet entry needs fields for `nodeId`, `language`, `filename`, and a `<textarea>` for the `code` content.

## Visual Design

- Clickable nodes get a subtle pulsing glow on hover (CSS transition on stroke opacity)
- The code panel uses a dark background (`bg-background`) with monospace font
- Keywords are colored using the existing primary/accent theme colors
- A small "code available" indicator dot appears on nodes that have linked snippets
- Smooth expand/collapse animation using framer-motion for the code panel

## Technical Details

- **Lightweight syntax coloring**: A simple `highlightCode(code, language)` function that wraps known keywords in `<span>` tags with color classes. Covers Swift, Go, Python, TypeScript keywords. No heavy dependency like Prism or Shiki.
- **Node matching**: The `nodeId` in `CodeSnippet` maps directly to the Mermaid node ID parsed by `parseMermaid()` (e.g., `"A"`, `"B"`, `"C"`).
- **Responsive**: The code panel scrolls horizontally for long lines and vertically if the snippet exceeds the modal height.

## File Changes Summary

| File | Change |
|------|--------|
| `src/services/DataService.ts` | Add `CodeSnippet` interface, add `codeSnippets?` to `Project` |
| `public/data/content.json` | Add sample code snippets to 3 projects |
| `src/components/ArchitectureDiagram.tsx` | Add click handling, hover states, code panel with syntax coloring |
| `src/components/PlanetDrawer.tsx` | Pass `codeSnippets` prop to `ArchitectureDiagram` |
| `src/pages/Admin.tsx` | Add `CodeSnippetsEditor` for editing snippets per project |

