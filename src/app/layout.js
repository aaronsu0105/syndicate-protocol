import './globals.css'

export const metadata = {
  title: 'Syndicate Protocol | RWA Liquidity',
  description: 'Bridge elite real-world assets into the decentralized economy with volumetric 3D physical-asset backing.',
  openGraph: {
    title: 'Syndicate Protocol',
    description: 'Institutional-grade Web3 Real World Asset syndication.',
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syndicate Protocol',
    description: 'Institutional-grade Web3 Real World Asset syndication.',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#02040a] text-white selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  )
}