import {
  AddressBook,
  CalendarDots,
  ChatCircleText,
  CurrencyBtc,
  LinkSimple,
  MapPin,
  TextT,
  WifiHigh,
  type Icon,
} from '@phosphor-icons/react'
import type { ContentType } from '@/lib/types'

export const CONTENT_ICONS: Record<ContentType, Icon> = {
  url: LinkSimple,
  text: TextT,
  wifi: WifiHigh,
  vcard: AddressBook,
  vevent: CalendarDots,
  geo: MapPin,
  contact: ChatCircleText,
  crypto: CurrencyBtc,
}
