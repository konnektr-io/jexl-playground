# JEXL Playground

An interactive web-based playground for testing and exploring [JEXL Extended](https://github.com/nikoraes/jexl-extended) expressions. Built with React, TypeScript, Monaco Editor, and shadcn/ui.

![JEXL Playground Screenshot](https://via.placeholder.com/800x400/f8f9fa/6c757d?text=JEXL+Playground+Screenshot)

## 🚀 Features

- **Interactive Monaco Editor** with full JEXL syntax highlighting and IntelliSense
- **Real-time evaluation** with automatic debouncing
- **Resizable panels** for customizable layout
- **Example library** showcasing JEXL Extended capabilities
- **JSON context editor** with validation
- **Copy/paste functionality** for expressions and results
- **Error handling** with clear error messages
- **Modern UI** built with shadcn/ui components

## 🎯 What is JEXL Extended?

JEXL Extended is a powerful expression language that extends the original JEXL with 80+ additional functions for:

- **String manipulation**: `uppercase`, `lowercase`, `trim`, `split`, `join`, `substringBefore`, `substringAfter`
- **Array operations**: `filter`, `map`, `reduce`, `sort`, `distinct`, `any`, `every`
- **Mathematical functions**: `sum`, `average`, `min`, `max`, `round`, `floor`, `ceil`
- **Date/time operations**: `now`, `dateTimeAdd`, `dateTimeFormat`, `toDateTime`
- **Type conversions**: `toString`, `toNumber`, `toBoolean`, `toObject`
- **Encoding/decoding**: `base64Encode`, `base64Decode`, `formUrlEncoded`
- **And much more!**

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/nikoraes/jexl-playground.git
cd jexl-playground

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The playground will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the project
pnpm build

# Preview the production build
pnpm preview
```

## 🎮 Usage

1. **Select an example** from the left sidebar to load a pre-built JEXL expression
2. **Edit the JEXL expression** in the top-left editor panel
3. **Modify the JSON context** in the top-right panel to test with different data
4. **View results** in the bottom panel, which updates automatically as you type
5. **Use IntelliSense** (Ctrl+Space) in the JEXL editor for function suggestions
6. **Resize panels** by dragging the panel separators to customize your layout

### Example Expressions

Try these expressions in the playground:

```javascript
// Filter and transform arrays
users|filter('value.active')|map('value.name')|sort()

// String manipulation
"Hello World"|uppercase|split(" ")|join("-")

// Mathematical operations
products|map('value.price')|sum

// Date operations
now()|dateTimeAdd("days", 7)|dateTimeFormat("yyyy-MM-dd")

// Conditional logic
users[0].department|case("Engineering","Tech","Sales","Business","Other")
```

## 🛠️ Tech Stack

- **[React 19](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor with JEXL language support
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[JEXL Extended](https://github.com/nikoraes/jexl-extended)** - Expression evaluation engine

## 🏗️ Architecture

The playground consists of three main components:

1. **Examples Sidebar** (`ResizablePanel`) - Pre-built example expressions
2. **Expression Editors** (`Monaco Editor`) - JEXL expression and JSON context input
3. **Output Panel** (`Monaco Editor`) - Read-only results display

Key features:
- **Real-time evaluation** with 500ms debouncing
- **Automatic syntax highlighting** for JEXL expressions
- **IntelliSense completion** for all JEXL Extended functions
- **Error handling** with clear error messages
- **Responsive layout** with resizable panels

## 🚢 Deployment

The project is configured for deployment to GitHub Pages:

```bash
# Deploy to GitHub Pages
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build the project
2. Deploy to GitHub Pages
3. Make it available at `https://nikoraes.github.io/jexl-playground/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run the tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[JEXL Extended](https://github.com/nikoraes/jexl-extended)** - The core JEXL expression engine
- **[Original JEXL](https://github.com/TomFrost/jexl)** - The base JEXL implementation

## 📞 Support

- **Documentation**: [JEXL Extended Docs](https://github.com/nikoraes/jexl-extended#readme)
- **Issues**: [GitHub Issues](https://github.com/nikoraes/jexl-playground/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nikoraes/jexl-playground/discussions)

---

Made with ❤️ by [nikoraes](https://github.com/nikoraes)
