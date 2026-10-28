import type {
  ContentType,
  ErrorCorrectionLevel,
  FormDataMap,
  StyleConfig,
  StylePresetId,
} from '@/lib/types'

export const APP_NAME = 'QR Code Studio'
export const MAX_LOGO_BYTES = 1024 * 1024
export const LOGO_MAX_AREA = 0.2
export const MAX_HISTORY_LIMIT = 100
export const DEFAULT_HISTORY_LIMIT = 50
export const HISTORY_LIMITS = [10, 25, 50, 100] as const
export const PREVIEW_SIZE = 640
export const MIN_QR_SIZE = 128
export const MIN_MARGIN = 0
export const MAX_MARGIN = 8

export const ERROR_CORRECTION_RECOVERY: Record<ErrorCorrectionLevel, number> = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
}

export const SIZE_PRESETS = [128, 256, 512, 1024] as const

export const DEFAULT_FORMS: FormDataMap = {
  url: {
    url: 'https://example.com/atelier',
  },
  text: {
    text: '',
  },
  wifi: {
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  },
  vcard: {
    lastName: '',
    firstName: '',
    phone: '',
    email: '',
    org: '',
    title: '',
    url: '',
    address: '',
  },
  vevent: {
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
  },
  geo: {
    lat: '',
    lng: '',
    label: '',
  },
  contact: {
    channel: 'email',
    email: '',
    subject: '',
    body: '',
    phone: '',
    message: '',
  },
  crypto: {
    scheme: 'bitcoin',
    address: '',
    amount: '',
    label: '',
  },
}

export const DEFAULT_STYLE: StyleConfig = {
  dotStyle: 'rounded',
  cornerSquareStyle: 'extra-rounded',
  cornerDotStyle: 'dot',
  colorMode: 'solid',
  dotColor: '#171714',
  dotColor2: '#546b2a',
  gradientRotation: 35,
  backgroundColor: '#fbfaf5',
  transparentBackground: false,
  size: 512,
  margin: 4,
  errorCorrection: 'M',
  logoSource: null,
  logo: null,
  logoName: null,
  logoImageSize: 0.38,
  logoBackground: 'light',
  logoBackgroundColor: '#fbfaf5',
}

export interface StylePreset {
  id: StylePresetId
  swatches: [string, string]
  surface: string
  style: Pick<
    StyleConfig,
    | 'dotStyle'
    | 'cornerSquareStyle'
    | 'cornerDotStyle'
    | 'colorMode'
    | 'dotColor'
    | 'dotColor2'
    | 'gradientRotation'
    | 'backgroundColor'
    | 'logoBackground'
    | 'logoBackgroundColor'
    | 'logoImageSize'
  >
  defaultErrorCorrection: ErrorCorrectionLevel
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'minimal',
    swatches: ['#171714', '#fbfaf5'],
    surface: '#fbfaf5',
    style: {
      dotStyle: 'square',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'square',
      colorMode: 'solid',
      dotColor: '#171714',
      dotColor2: '#171714',
      gradientRotation: 0,
      backgroundColor: '#fbfaf5',
      logoBackground: 'none',
      logoBackgroundColor: '#fbfaf5',
      logoImageSize: 0.36,
    },
    defaultErrorCorrection: 'M',
  },
  {
    id: 'corporate',
    swatches: ['#17324d', '#f4f6f7'],
    surface: '#f4f6f7',
    style: {
      dotStyle: 'classy-rounded',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'square',
      colorMode: 'solid',
      dotColor: '#17324d',
      dotColor2: '#17324d',
      gradientRotation: 0,
      backgroundColor: '#f4f6f7',
      logoBackground: 'light',
      logoBackgroundColor: '#f4f6f7',
      logoImageSize: 0.34,
    },
    defaultErrorCorrection: 'Q',
  },
  {
    id: 'event',
    swatches: ['#e85d2a', '#f4b63f'],
    surface: '#fff6ec',
    style: {
      dotStyle: 'dots',
      cornerSquareStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      colorMode: 'linear',
      dotColor: '#e85d2a',
      dotColor2: '#b42f6a',
      gradientRotation: 45,
      backgroundColor: '#fff6ec',
      logoBackground: 'dark',
      logoBackgroundColor: '#231d18',
      logoImageSize: 0.3,
    },
    defaultErrorCorrection: 'Q',
  },
  {
    id: 'business',
    swatches: ['#173e34', '#c5d6be'],
    surface: '#edf0e7',
    style: {
      dotStyle: 'extra-rounded',
      cornerSquareStyle: 'square',
      cornerDotStyle: 'dot',
      colorMode: 'radial',
      dotColor: '#173e34',
      dotColor2: '#4b7258',
      gradientRotation: 0,
      backgroundColor: '#edf0e7',
      logoBackground: 'light',
      logoBackgroundColor: '#edf0e7',
      logoImageSize: 0.32,
    },
    defaultErrorCorrection: 'Q',
  },
]

export const CONTENT_TYPE_LABEL_KEYS: Record<
  ContentType,
  | 'type.url'
  | 'type.text'
  | 'type.wifi'
  | 'type.vcard'
  | 'type.vevent'
  | 'type.geo'
  | 'type.contact'
  | 'type.crypto'
> = {
  url: 'type.url',
  text: 'type.text',
  wifi: 'type.wifi',
  vcard: 'type.vcard',
  vevent: 'type.vevent',
  geo: 'type.geo',
  contact: 'type.contact',
  crypto: 'type.crypto',
}

export function createDefaultForms(): FormDataMap {
  return structuredClone(DEFAULT_FORMS)
}

export function createEmptyForms(): FormDataMap {
  const forms = createDefaultForms()
  forms.url.url = ''
  return forms
}

export function createDefaultStyle(): StyleConfig {
  return { ...DEFAULT_STYLE }
}
