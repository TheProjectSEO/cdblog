import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </div>
  )
}