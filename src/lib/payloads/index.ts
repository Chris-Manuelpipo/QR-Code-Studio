import type {
  AnyFormData,
  ContentType,
  CryptoForm,
  FormDataMap,
  ContactForm,
  GeoForm,
  TextForm,
  UrlForm,
  VCardForm,
  VEventForm,
  WifiForm,
} from '@/lib/types'
import { validateFormData } from '@/lib/schemas/forms'

export type PayloadSuccess = {
  ok: true
  payload: string
}

export type PayloadFailure = {
  ok: false
  errors: Record<string, string>
}

export type PayloadResult = PayloadSuccess | PayloadFailure

const CRLF = '\r\n'

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function escapeICalendar(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function sanitizeMatmsg(value: string): string {
  return value.replace(/;/g, '\\;').replace(/\r?\n/g, ' ')
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, '')
}

export function normalizeNumber(value: string): string {
  return value.trim().replace(',', '.')
}

function buildUrl(data: UrlForm): string {
  return data.url.trim()
}

function buildText(data: TextForm): string {
  return (
    data.text
      .replace(/\r\n/g, '\n')
      // Strip control characters except newlines: they break QR decoders.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  )
}

function buildWifi(data: WifiForm): string {
  const password = data.encryption === 'nopass' ? '' : data.password
  return `WIFI:T:${data.encryption};S:${escapeWifi(data.ssid)};P:${escapeWifi(
    password,
  )};H:${data.hidden ? 'true' : 'false'};;`
}

function buildVCard(data: VCardForm): string {
  const lastName = escapeVCard(data.lastName)
  const firstName = escapeVCard(data.firstName)
  const fullName = escapeVCard(
    [data.firstName, data.lastName].filter(Boolean).join(' '),
  )
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${fullName}`,
  ]

  if (data.org) lines.push(`ORG:${escapeVCard(data.org)}`)
  if (data.title) lines.push(`TITLE:${escapeVCard(data.title)}`)
  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(normalizePhone(data.phone))}`)
  }
  if (data.email) lines.push(`EMAIL:${escapeVCard(data.email)}`)
  if (data.url) lines.push(`URL:${escapeVCard(data.url)}`)
  if (data.address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(data.address)};;;;`)
  }
  lines.push('END:VCARD')
  return lines.join(CRLF)
}

function toICalendarDate(value: string): string {
  const [datePart = '', timePart = ''] = value.split('T')
  const date = datePart.replace(/-/g, '')
  const time = timePart.replace(/:/g, '').padEnd(6, '0').slice(0, 6)
  return `${date}T${time}`
}

function buildVEvent(data: VEventForm): string {
  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICalendar(data.title)}`,
    `DTSTART:${toICalendarDate(data.start)}`,
  ]
  if (data.end) lines.push(`DTEND:${toICalendarDate(data.end)}`)
  if (data.location) lines.push(`LOCATION:${escapeICalendar(data.location)}`)
  if (data.description) {
    lines.push(`DESCRIPTION:${escapeICalendar(data.description)}`)
  }
  lines.push('END:VEVENT')
  return lines.join(CRLF)
}

function buildGeo(data: GeoForm): string {
  const lat = normalizeNumber(data.lat)
  const lng = normalizeNumber(data.lng)
  const label = data.label ? `(${encodeURIComponent(data.label)})` : ''
  return `geo:${lat},${lng}?q=${lat},${lng}${label}`
}

function buildContact(data: ContactForm): string {
  if (data.channel === 'email') {
    return `MATMSG:TO:${sanitizeMatmsg(data.email)};SUB:${sanitizeMatmsg(
      data.subject,
    )};BODY:${sanitizeMatmsg(data.body)};;`
  }
  const phone = normalizePhone(data.phone)
  if (data.channel === 'phone') return `tel:${phone}`
  return `SMSTO:${phone}:${data.message.replace(/\r?\n/g, ' ')}`
}

function buildCrypto(data: CryptoForm): string {
  const params: string[] = []
  if (data.amount)
    params.push(`amount=${encodeURIComponent(normalizeNumber(data.amount))}`)
  if (data.label) params.push(`label=${encodeURIComponent(data.label)}`)
  const query = params.length > 0 ? `?${params.join('&')}` : ''
  return `${data.scheme}:${data.address.trim()}${query}`
}

export function buildPayload<K extends ContentType>(
  type: K,
  data: FormDataMap[K],
): string {
  switch (type) {
    case 'url':
      return buildUrl(data as UrlForm)
    case 'text':
      return buildText(data as TextForm)
    case 'wifi':
      return buildWifi(data as WifiForm)
    case 'vcard':
      return buildVCard(data as VCardForm)
    case 'vevent':
      return buildVEvent(data as VEventForm)
    case 'geo':
      return buildGeo(data as GeoForm)
    case 'contact':
      return buildContact(data as ContactForm)
    case 'crypto':
      return buildCrypto(data as CryptoForm)
  }
}

export function getValidatedPayload<K extends ContentType>(
  type: K,
  data: unknown,
): PayloadResult {
  const validation = validateFormData(type, data)
  if (!validation.success) {
    return { ok: false, errors: validation.errors }
  }
  return {
    ok: true,
    payload: buildPayload(type, validation.data),
  }
}

export function getPayloadForForms(
  type: ContentType,
  forms: FormDataMap,
): PayloadResult {
  return getValidatedPayload(type, forms[type])
}

export function getAnyPayload(type: ContentType, data: AnyFormData): string {
  return buildPayload(type, data as never)
}

/**
 * qr-code-styling encodes JavaScript char codes as single bytes. Passing the
 * UTF-8 byte sequence as a binary string makes the resulting QR payload real
 * UTF-8 without requiring an ECI segment, which scanning apps interpret
 * consistently.
 */
export function toUtf8BinaryString(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let result = ''
  for (const byte of bytes) result += String.fromCharCode(byte)
  return result
}
