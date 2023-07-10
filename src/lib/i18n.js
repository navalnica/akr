// internationalization module. refer to:
// https://svelte.dev/repl/de39de663ef2445b8fe17b79c500013b

import { writable, derived } from "svelte/store";
import translations from "./translations";

export const locale = writable("en");
export const localesList = Object.keys(translations);

function _translate(locale, key){
    if (!locale) throw new Error("no locale passed to $translate()");
    if (!key) throw new Error ("no key passed to $transcribe()");

    let text = translations[locale][key];

    if (!text) throw new Error(`no translation found for ${locale}.${key}`);

    return text;
}

export const tr = derived(locale, $locale => key => _translate($locale, key));
