import { enUS, ja as jaLocale, fr as frLocale, es as esLocale, pt as ptLocale } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { CalendarMessages, LocaleCode } from '../types';
import { en } from './en';
import { ja } from './ja';
import { fr } from './fr';
import { es } from './es';
import { pt } from './pt';

const dictionaries: Record<LocaleCode, CalendarMessages> = { en, ja, fr, es, pt };
const dateFnsLocales: Record<LocaleCode, Locale> = {
  en: enUS,
  ja: jaLocale,
  fr: frLocale,
  es: esLocale,
  pt: ptLocale,
};

export function resolveMessages(
  locale: LocaleCode = 'en',
  overrides?: Partial<CalendarMessages>,
): CalendarMessages {
  const base = dictionaries[locale] ?? dictionaries.en;
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    prev: { ...base.prev, ...(overrides.prev ?? {}) } as CalendarMessages['prev'],
    next: { ...base.next, ...(overrides.next ?? {}) } as CalendarMessages['next'],
    view: { ...base.view, ...(overrides.view ?? {}) } as CalendarMessages['view'],
    popover: { ...base.popover, ...(overrides.popover ?? {}) } as CalendarMessages['popover'],
    more: overrides.more ?? base.more,
  };
}

export function resolveDateLocale(locale: LocaleCode = 'en'): Locale {
  return dateFnsLocales[locale] ?? dateFnsLocales.en;
}
