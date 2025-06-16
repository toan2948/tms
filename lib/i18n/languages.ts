import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { zhCN } from "date-fns/locale/zh-CN";
import { zhTW } from "date-fns/locale/zh-TW";

export type TLocale = "en-US" | "zh-CN" | "zh-TW";
export const defaultLocale: TLocale = "en-US";

type UILanguage = {
  locale: TLocale;
  name: string;
  title: string;
};

export const uiLanguages: UILanguage[] = [
  {
    locale: "en-US",
    name: "English",
    title: "EN",
  },
  {
    locale: "zh-CN",
    name: "简体中文",
    title: "简体",
  },
  {
    locale: "zh-TW",
    name: "繁體中文",
    title: "正體",
  },
];

export function getLocale(locale?: TLocale) {
  switch (locale) {
    case "en-US":
      return enUS;
    case "zh-TW":
      return zhTW;
    case "zh-CN":
      return zhCN;
    default:
      return enUS;
  }
}

export function localeDate(
  date: Date | number | string,
  locale?: TLocale,
  formatStr?: string
) {
  if (!date) return "";

  return format(date, formatStr || "PPp", {
    locale: locale ? getLocale(locale) : enUS,
  });
}
