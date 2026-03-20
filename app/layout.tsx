// Root layout: minimal passthrough — locale layout provides <html> and <body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
