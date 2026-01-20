import type { Metadata } from 'next'
import { ApolloWrapper } from '@/lib/ApolloWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'Purchases Filter',
  description: 'Filter purchases by products and users',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', overflowY: 'auto' }}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}
