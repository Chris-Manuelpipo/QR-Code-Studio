import { z } from 'zod'
import type { ContentType, FormDataMap, VCardForm, VEventForm } from '@/lib/types'
import { CONTENT_TYPES, CRYPTO_SCHEMES } from '@/lib/types'

const MESSAGES = {
  required: 'required',
  tooLong: 'too_long',
  urlInvalid: 'url_invalid',
  urlScheme: 'url_scheme',
  emailInvalid: 'email_invalid',
  phoneInvalid: 'phone_invalid',
  dateInvalid: 'date_invalid',
  endBeforeStart: 'end_before_start',
  latInvalid: 'lat_invalid',
  lngInvalid: 'lng_invalid',
  amountInvalid: 'amount_invalid',
  passwordRequired: 'password_required',
} as const

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^\+?[\d\s().-]{3,32}$/

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function hasDigits(value: string, minimum = 3): boolean {
  return (value.match(/\d/g) ?? []).length >= minimum
}

const optionalText = (max: number) => z.string().trim().max(max, MESSAGES.tooLong)

const urlSchema = z
  .string()
  .trim()
  .min(1, MESSAGES.required)
  .max(2000, MESSAGES.tooLong)
  .superRefine((value, ctx) => {
    if (!isHttpUrl(value)) {
      const looksLikeOtherScheme = /^[a-z][a-z\d+.-]*:/i.test(value)
      ctx.addIssue({
        code: 'custom',
        message: looksLikeOtherScheme ? MESSAGES.urlScheme : MESSAGES.urlInvalid,
      })
    }
  })

const optionalEmail = z
  .string()
  .trim()
  .max(320, MESSAGES.tooLong)
  .refine((value) => value === '' || emailPattern.test(value), MESSAGES.emailInvalid)

const optionalPhone = z
  .string()
  .trim()
  .max(40, MESSAGES.tooLong)
  .refine(
    (value) => value === '' || (phonePattern.test(value) && hasDigits(value)),
    MESSAGES.phoneInvalid,
  )

const optionalHttpUrl = z
  .string()
  .trim()
  .max(2000, MESSAGES.tooLong)
  .refine((value) => value === '' || isHttpUrl(value), MESSAGES.urlInvalid)

export const urlFormSchema = z.object({
  url: urlSchema,
})

export const textFormSchema = z.object({
  text: z.string().trim().min(1, MESSAGES.required).max(1000, MESSAGES.tooLong),
})

export const wifiFormSchema = z
  .object({
    ssid: z.string().trim().min(1, MESSAGES.required).max(128, MESSAGES.tooLong),
    password: z.string().max(256, MESSAGES.tooLong),
    encryption: z.enum(['WPA', 'WEP', 'nopass']),
    hidden: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.encryption !== 'nopass' && data.password.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: MESSAGES.passwordRequired,
      })
    }
  })

export const vcardFormSchema = z.object({
  lastName: z.string().trim().min(1, MESSAGES.required).max(100, MESSAGES.tooLong),
  firstName: optionalText(100),
  phone: optionalPhone,
  email: optionalEmail,
  org: optionalText(160),
  title: optionalText(160),
  url: optionalHttpUrl,
  address: optionalText(240),
})

export const veventFormSchema = z
  .object({
    title: z.string().trim().min(1, MESSAGES.required).max(200, MESSAGES.tooLong),
    start: z
      .string()
      .min(1, MESSAGES.required)
      .refine(isValidLocalDate, MESSAGES.dateInvalid),
    end: z
      .string()
      .refine((value) => value === '' || isValidLocalDate(value), MESSAGES.dateInvalid),
    location: optionalText(240),
    description: optionalText(600),
  })
  .superRefine((data, ctx) => {
    if (data.end && data.start && Date.parse(data.end) <= Date.parse(data.start)) {
      ctx.addIssue({
        code: 'custom',
        path: ['end'],
        message: MESSAGES.endBeforeStart,
      })
    }
  })

export const geoFormSchema = z.object({
  lat: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .refine((value) => {
      const numeric = toFiniteNumber(value)
      return numeric !== null && numeric >= -90 && numeric <= 90
    }, MESSAGES.latInvalid),
  lng: z
    .string()
    .trim()
    .min(1, MESSAGES.required)
    .refine((value) => {
      const numeric = toFiniteNumber(value)
      return numeric !== null && numeric >= -180 && numeric <= 180
    }, MESSAGES.lngInvalid),
  label: optionalText(200),
})

export const contactFormSchema = z
  .object({
    channel: z.enum(['email', 'phone', 'sms']),
    email: optionalEmail,
    subject: optionalText(200),
    body: optionalText(600),
    phone: optionalPhone,
    message: optionalText(600),
  })
  .superRefine((data, ctx) => {
    if (data.channel === 'email') {
      if (data.email === '') {
        ctx.addIssue({ code: 'custom', path: ['email'], message: MESSAGES.required })
      }
    } else if (data.phone === '') {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: MESSAGES.required })
    }
  })

export const cryptoFormSchema = z.object({
  scheme: z.enum(CRYPTO_SCHEMES),
  address: z.string().trim().min(1, MESSAGES.required).max(200, MESSAGES.tooLong),
  amount: z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true
      const numeric = toFiniteNumber(value)
      return numeric !== null && numeric > 0
    }, MESSAGES.amountInvalid),
  label: optionalText(200),
})

export const FORM_SCHEMAS = {
  url: urlFormSchema,
  text: textFormSchema,
  wifi: wifiFormSchema,
  vcard: vcardFormSchema,
  vevent: veventFormSchema,
  geo: geoFormSchema,
  contact: contactFormSchema,
  crypto: cryptoFormSchema,
} as const

export type FormSchemaMap = {
  [K in ContentType]: z.ZodType<FormDataMap[K]>
}

export function getFormSchema<K extends ContentType>(
  type: K,
): (typeof FORM_SCHEMAS)[K] {
  return FORM_SCHEMAS[type]
}

export interface ValidationSuccess<T> {
  success: true
  data: T
}

export interface ValidationFailure {
  success: false
  errors: Record<string, string>
}

export type FormValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function validateFormData<K extends ContentType>(
  type: K,
  data: unknown,
): FormValidationResult<FormDataMap[K]> {
  const result = FORM_SCHEMAS[type].safeParse(data)
  if (result.success) {
    return { success: true, data: result.data as FormDataMap[K] }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'root')
    if (!errors[key]) errors[key] = issue.message
  }
  return { success: false, errors }
}

export function isFormComplete(type: ContentType, forms: FormDataMap): boolean {
  return validateFormData(type, forms[type]).success
}

export function findFirstErrorKey(errors: Record<string, string>): string | null {
  return Object.keys(errors)[0] ?? null
}

export function formatValidationErrors(
  type: ContentType,
  data: unknown,
): Partial<Record<string, string>> {
  const result = validateFormData(type, data)
  return result.success ? {} : result.errors
}

export function isValidLocalDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!match) return false
  const [, year, month, day, hour, minute, second = '0'] = match
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  )
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day) &&
    date.getHours() === Number(hour) &&
    date.getMinutes() === Number(minute) &&
    date.getSeconds() === Number(second)
  )
}

function toFiniteNumber(value: string): number | null {
  if (value.trim() === '') return null
  const numeric = Number(value.trim().replace(',', '.'))
  return Number.isFinite(numeric) ? numeric : null
}

export type UrlFormValues = z.infer<typeof urlFormSchema>
export type TextFormValues = z.infer<typeof textFormSchema>
export type WifiFormValues = z.infer<typeof wifiFormSchema>
export type VCardFormValues = z.infer<typeof vcardFormSchema>
export type VEventFormValues = z.infer<typeof veventFormSchema>
export type GeoFormValues = z.infer<typeof geoFormSchema>
export type ContactFormValues = z.infer<typeof contactFormSchema>
export type CryptoFormValues = z.infer<typeof cryptoFormSchema>

export type FormValues = {
  [K in ContentType]: z.infer<(typeof FORM_SCHEMAS)[K]>
}

export type TypedFormValues = {
  url: UrlFormValues
  text: TextFormValues
  wifi: WifiFormValues
  vcard: VCardFormValues
  vevent: VEventFormValues
  geo: GeoFormValues
  contact: ContactFormValues
  crypto: CryptoFormValues
}

export function isSupportedType(value: unknown): value is ContentType {
  return typeof value === 'string' && CONTENT_TYPES.includes(value as ContentType)
}

export type { VCardForm, VEventForm }
