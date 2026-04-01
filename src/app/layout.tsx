// Root layout is a passthrough — child layouts ([locale]/layout.tsx, os/layout.tsx)
// each own their own <html> and <body> tags to support locale, direction, and theme.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
