export const CONTENT_TYPES = [
  'url',
  'text',
  'wifi',
  'vcard',
  'vevent',
  'geo',
  'contact',
  'crypto',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export const CONTACT_CHANNELS = ['email', 'phone', 'sms'] as const
export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export const CRYPTO_SCHEMES = ['bitcoin', 'ethereum', 'litecoin', 'solana'] as const
export type CryptoScheme = (typeof CRYPTO_SCHEMES)[number]

export type Encryption = 'WPA' | 'WEP' | 'nopass'
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface UrlForm {
  url: string
}

export interface TextForm {
  text: string
}

export interface WifiForm {
  ssid: string
  password: string
  encryption: Encryption
  hidden: boolean
}

export interface VCardForm {
  lastName: string
  firstName: string
  phone: string
  email: string
  org: string
  title: string
  url: string
  address: string
}

export interface VEventForm {
  title: string
  start: string
  end: string
  location: string
  description: string
}

export interface GeoForm {
  lat: string
  lng: string
  label: string
}

export interface ContactForm {
  channel: ContactChannel
  email: string
  subject: string
  body: string
  phone: string
  message: string
}

export interface CryptoForm {
  scheme: CryptoScheme
  address: string
  amount: string
  label: string
}

export interface FormDataMap {
  url: UrlForm
  text: TextForm
  wifi: WifiForm
  vcard: VCardForm
  vevent: VEventForm
  geo: GeoForm
  contact: ContactForm
  crypto: CryptoForm
}

export type AnyFormData = FormDataMap[ContentType]

export const DOT_STYLES = [
  'square',
  'rounded',
  'dots',
  'classy',
  'classy-rounded',
  'extra-rounded',
] as const
export type DotStyle = (typeof DOT_STYLES)[number]

export const CORNER_SQUARE_STYLES = ['square', 'extra-rounded', 'dot'] as const
export type CornerSquareStyle = (typeof CORNER_SQUARE_STYLES)[number]

export const CORNER_DOT_STYLES = ['square', 'dot'] as const
export type CornerDotStyle = (typeof CORNER_DOT_STYLES)[number]

export type ColorMode = 'solid' | 'linear' | 'radial'
export type LogoBackground = 'none' | 'light' | 'dark' | 'custom'
export type ThemeMode = 'light' | 'dark'
export type Locale = 'fr' | 'en'

export interface StyleConfig {
  dotStyle: DotStyle
  cornerSquareStyle: CornerSquareStyle
  cornerDotStyle: CornerDotStyle
  colorMode: ColorMode
  dotColor: string
  dotColor2: string
  gradientRotation: number
  backgroundColor: string
  transparentBackground: boolean
  size: number
  margin: number
  errorCorrection: ErrorCorrectionLevel
  logoSource: string | null
  logo: string | null
  logoName: string | null
  logoImageSize: number
  logoBackground: LogoBackground
  logoBackgroundColor: string
}

export type StylePresetId = 'minimal' | 'corporate' | 'event' | 'business'

export interface QrEntry {
  id: string
  type: ContentType
  payload: string
  formData: AnyFormData
  style: StyleConfig
  thumbnail: string
  createdAt: number
  updatedAt: number
}

export type ValidationStatus =
  'idle' | 'checking' | 'scannable' | 'attention' | 'unscannable'

export interface ValidationWarning {
  code:
    'logo_too_large' | 'ec_low_for_logo' | 'margin_low' | 'contrast_low' | 'inverted'
  action?: 'reduce_logo' | 'set_h' | 'set_margin' | 'set_size'
}

export interface ScannabilityResult {
  status: ValidationStatus
  decoded: string | null
  expected: string
  durationMs: number
  warnings: ValidationWarning[]
  message?: string
  checkedAt: number
}

export interface QrMetrics {
  moduleCount: number
  capacityError: boolean
}

export interface GeneratedArtifact {
  blob: Blob
  size: number
}
