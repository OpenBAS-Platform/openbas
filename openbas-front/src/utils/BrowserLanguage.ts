import * as R from 'ramda';

export const DEFAULT_LANG = 'en';
// These window.navigator contain language information
// 1. languages -> [] of preferred languages (eg ["en-US", "zh-CN", "ja-JP"]) Firefox^32, Chrome^32
// 2. language  -> Preferred language as String (eg "en-US") Firefox^5, IE^11, Safari,
//                 Chrome sends Browser UI language
// 3. browserLanguage -> UI Language of IE
// 4. userLanguage    -> Language of Windows Regional Options
// 5. systemLanguage  -> UI Language of Windows
const browserLanguagePropertyKeys = [
  'languages',
  'language',
  'browserLanguage',
  'userLanguage',
  'systemLanguage',
];

const availableLanguages = ['en', 'fr', 'zh'];

const detectedLocale = R.pipe(
  R.pick(browserLanguagePropertyKeys), // Get only language properties
  R.values(), // Get values of the properties
  R.flatten(), // flatten all arrays
  R.reject(R.isNil), // Remove undefined values
  R.map((x: string) => x.substr(0, 2)),
  R.find((x: string) => R.includes(x, availableLanguages)), // Returns first language matched in languages
);

export default detectedLocale(window.navigator) || DEFAULT_LANG; // If no locale is detected, fallback to 'en'
