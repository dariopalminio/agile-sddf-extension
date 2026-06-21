# User-Friendly Release Notes

Use for public, end-user-facing announcements that highlight new features and improvements
in approachable language.

**Approach:** a cumulative `RELEASE_NOTES.md` at the project root. Keep a single fixed
`# What's New` title and add a new `## Version X.X.X (YYYY-MM-DD)` section for each release,
newest on top, so versions accumulate in the same file.

```markdown
# What's New

## Version 2.1 (2026-01-29)

We're excited to announce version 2.1 with dark mode and major performance improvements!

### ✨ New Features

#### Dark Mode
Finally here! Switch between light and dark themes in Settings > Appearance. Your preference syncs across devices.

#### CSV Export
Export your data to CSV with one click. Find it in the Actions menu on any data view.

#### Keyboard Shortcuts
Work faster with shortcuts:
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + N` - New item
- `?` - Show all shortcuts

### 🚀 Improvements

- **50% Faster Loading** - Completely rebuilt our data loading pipeline
- **New Dashboard** - Cleaner design with customizable widgets
- **Better Authentication** - Upgraded to OAuth 2.0 for enhanced security

### 🐛 Bug Fixes

- Fixed login timeouts on slower connections
- Export button now works properly on mobile devices
- Resolved memory issues with real-time updates

### ⚠️ Important Notes

- **Deprecation Notice**: Legacy API v1 will be removed in version 3.0
- **Browser Support**: Internet Explorer is no longer supported

## Version 2.0 (2025-12-01)

A major release with a redesigned experience and team workspaces.

### ✨ New Features

- Brand-new dashboard and navigation
- Team workspaces with shared views

### 🐛 Bug Fixes

- Various stability and performance improvements

---

Questions? Contact support@example.com or visit our [Help Center](link).
```
