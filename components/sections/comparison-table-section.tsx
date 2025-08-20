'use client'

interface TableRow {
  id: string
  name: string
  slopes?: string
  elevation?: string
  dayPass?: string
  bestFor?: string
  rating?: string
  highlights?: string[]
  [key: string]: any // Allow dynamic columns
}

interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface ComparisonTableSectionProps {
  data?: {
    title?: string
    subtitle?: string
    columns?: TableColumn[]
    rows?: TableRow[]
    showTitle?: boolean
    showSubtitle?: boolean
    alternateRowColors?: boolean
    headerBgColor?: 'gray' | 'blue' | 'green' | 'purple'
  }
}

export function ComparisonTableSection({ data }: ComparisonTableSectionProps) {
  // Default settings
  const title = data?.title || "Top Destinations Comparison"
  const subtitle = data?.subtitle || "Compare the best destinations to find your perfect match"
  const showTitle = data?.showTitle !== false
  const showSubtitle = data?.showSubtitle !== false
  const alternateRowColors = data?.alternateRowColors !== false
  const headerBgColor = data?.headerBgColor || 'gray'

  // Default columns
  const defaultColumns: TableColumn[] = [
    { key: 'name', label: 'Destination', align: 'left' },
    { key: 'highlights', label: 'Key Features', align: 'left' },
    { key: 'elevation', label: 'Elevation', align: 'left' },
    { key: 'dayPass', label: 'Day Pass', align: 'left' },
    { key: 'bestFor', label: 'Best For', align: 'left' }
  ]

  // Default rows (can be overridden from CMS)
  const defaultRows: TableRow[] = [
    {
      id: "destination-1",
      name: "Lake Como",
      highlights: "Stunning villas, boat tours",
      elevation: "199m",
      dayPass: "€45",
      bestFor: "Luxury travelers, couples"
    },
    {
      id: "destination-2", 
      name: "Lake Garda",
      highlights: "Thermal spas, hiking trails",
      elevation: "65m",
      dayPass: "€35",
      bestFor: "Families, outdoor enthusiasts"
    },
    {
      id: "destination-3",
      name: "Lake Maggiore",
      highlights: "Borromean Islands, gardens",
      elevation: "193m", 
      dayPass: "€40",
      bestFor: "Culture lovers, photographers"
    },
    {
      id: "destination-4",
      name: "Lake Orta",
      highlights: "Medieval village, peaceful",
      elevation: "290m",
      dayPass: "€25",
      bestFor: "Romantic getaways"
    }
  ]

  const columns = data?.columns && data.columns.length > 0 ? data.columns : defaultColumns
  const rows = data?.rows && data.rows.length > 0 ? data.rows : defaultRows

  // Header background classes
  const headerBgClasses = {
    'gray': 'bg-gray-100',
    'blue': 'bg-blue-100',
    'green': 'bg-green-100', 
    'purple': 'bg-purple-100'
  }

  // Alignment classes
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  }

  return (
    <div className="mb-12">
      {showTitle && (
        <h2 className="text-3xl font-semibold mt-12 mb-6">{title}</h2>
      )}
      
      {showSubtitle && subtitle && (
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">{subtitle}</p>
      )}
      
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr className={headerBgClasses[headerBgColor]}>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`${alignmentClasses[column.align || 'left']} p-4 font-semibold`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr 
                key={row.id}
                className={alternateRowColors && index % 2 === 1 ? 'bg-gray-50 border-b' : 'border-b'}
              >
                {columns.map((column) => (
                  <td 
                    key={`${row.id}-${column.key}`}
                    className={`${alignmentClasses[column.align || 'left']} p-4`}
                  >
                    {column.key === 'name' ? (
                      <span className="font-medium">{row[column.key]}</span>
                    ) : (
                      <span>{row[column.key] || '-'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}