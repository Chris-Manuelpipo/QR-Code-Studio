import type {
  ContactForm,
  CryptoForm,
  GeoForm,
  QrEntry,
  TextForm,
  UrlForm,
  VCardForm,
  VEventForm,
  WifiForm,
} from '@/lib/types'

function compact(value: string, max = 64): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

export function describeEntry(entry: QrEntry): string {
  const data = entry.formData
  switch (entry.type) {
    case 'url':
      return compact((data as UrlForm).url)
    case 'text':
      return compact((data as TextForm).text) || '—'
    case 'wifi':
      return compact((data as WifiForm).ssid) || '—'
    case 'vcard': {
      const card = data as VCardForm
      return (
        compact(
          [card.firstName, card.lastName].filter(Boolean).join(' ') || card.org,
        ) || '—'
      )
    }
    case 'vevent':
      return compact((data as VEventForm).title) || '—'
    case 'geo': {
      const geo = data as GeoForm
      return compact(geo.label || `${geo.lat}, ${geo.lng}`) || '—'
    }
    case 'contact': {
      const contact = data as ContactForm
      return compact(contact.channel === 'email' ? contact.email : contact.phone) || '—'
    }
    case 'crypto':
      return compact((data as CryptoForm).address) || '—'
    default:
      return '—'
  }
}
