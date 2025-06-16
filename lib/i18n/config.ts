import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "./en-US/translation.json";
import zhCN from "./zh-CN/translation.json";
import zhTW from "./zh-TW/translation.json";

import { defaultLocale } from "./languages";

i18next.use(initReactI18next).init({
  lng: defaultLocale, // if you're using a language detector, do not define the lng option
  debug: true,
  resources: {
    "en-US": { translation: enUS },
    "zh-CN": { translation: zhCN },
    "zh-TW": { translation: zhTW },
  },
  fallbackLng: defaultLocale,
  // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
  // set returnNull to false (and also in the i18next.d.ts options)
  // returnNull: false,
});
