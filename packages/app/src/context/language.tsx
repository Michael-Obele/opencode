import * as i18n from "@solid-primitives/i18n"
import { createEffect, createMemo, createResource } from "solid-js"
import { createStore } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { pluralCategory, type UiI18nPluralKey } from "@opencode-ai/ui/context/i18n"
import { Persist, persisted } from "@/utils/persist"
import { dict as en } from "@/i18n/en"
import { dict as uiEn } from "@opencode-ai/ui/i18n/en"
import {
  createDesktopNativeBundle,
  DESKTOP_NATIVE_ENGLISH,
  type DesktopNativeBundle,
  type DesktopNativeLocale,
} from "@/i18n/desktop-native"

export type Locale = "en"
export type Direction = "ltr" | "rtl"

function localeDirection(): Direction {
  return "ltr"
}

type RawDictionary = typeof en & typeof uiEn
type Dictionary = i18n.Flatten<RawDictionary>
type PluralKey =
  | UiI18nPluralKey
  | "session.question.pending"
  | "session.followupDock.summary"
  | "session.revertDock.summary"

function cookie(locale: Locale) {
  return `oc_locale=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`
}

const LOCALES: readonly Locale[] = ["en"] as const
const INTL: Record<Locale, string> = { en: "en" }
const base = i18n.flatten({ ...en, ...uiEn })
const dicts = new Map<Locale, Dictionary>([["en", base]])

function loadDict(locale: Locale): Promise<Dictionary> {
  const hit = dicts.get(locale)
  if (hit) return Promise.resolve(hit)
  return Promise.resolve(base)
}

export function loadLocaleDict(_locale: Locale) {
  return loadDict("en").then(() => undefined)
}

function detectLocale(): Locale {
  return "en"
}

export function normalizeLocale(_value: string): Locale {
  return "en"
}

function readStoredLocale(): Locale | undefined {
  return undefined
}

const warm: Locale = "en"
const initialLocale: Promise<Locale> = Promise.resolve("en")

export function loadInitialLocale() {
  return initialLocale
}

export const { use: useLanguage, provider: LanguageProvider } = createSimpleContext({
  name: "Language",
  gate: false,
  init: (props: { locale?: Locale; onNativeTranslations?: (bundle: DesktopNativeBundle) => void }) => {
    const initial = props.locale ?? "en"
    const [store, setStore, _, ready] = persisted(
      Persist.global("language", ["language.v1"]),
      createStore({
        locale: initial as Locale,
      }),
    )

    const locale = createMemo<Locale>(() => "en")
    const intl = createMemo(() => INTL["en"])
    const [layout, setLayout] = createStore({ direction: undefined as Direction | undefined })
    const direction = createMemo(() => layout.direction ?? localeDirection())
    const layoutLocale = createMemo(() => intl())

    const [dict] = createResource(locale, loadDict, {
      initialValue: base,
    })

    const t = i18n.translator(() => dict() ?? base, i18n.resolveTemplate) as (
      key: keyof Dictionary,
      params?: Record<string, string | number | boolean>,
    ) => string

    const plural = (key: PluralKey, count: number, params?: Record<string, string | number | boolean>) => {
      const category = pluralCategory(intl(), count)
      const current = (dict.loading ? base : (dict() ?? base)) as Record<string, string>
      const candidate = `${key}.${category}`
      const fallback = `${key}.other`
      return i18n.resolveTemplate(current[candidate] ?? current[fallback] ?? fallback, { ...params, count })
    }

    const label = (_value: Locale) => "English"

    createEffect(() => {
      if (typeof document !== "object") return
      document.documentElement.lang = intl()
      document.documentElement.dir = direction()
      document.cookie = cookie(locale())
    })

    createEffect(() => {
      if (!props.onNativeTranslations || dict.loading) return
      const current = dict()
      if (!current) return
      props.onNativeTranslations(
        createDesktopNativeBundle("en", (key) => current[key] ?? DESKTOP_NATIVE_ENGLISH[key]),
      )
    })

    return {
      ready,
      locale,
      intl,
      direction,
      layoutLocale,
      locales: LOCALES,
      label,
      t,
      plural,
      setLocale(_next: Locale) {
        setStore("locale", "en")
      },
      setDirection(next: Direction) {
        setLayout("direction", next === localeDirection() ? undefined : next)
      },
    }
  },
})
