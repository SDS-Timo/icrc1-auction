import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ENUS from './locales/en/en-us.json'
import ESES from './locales/es/es-es.json'
import PTBR from './locales/pt/pt-br.json'
import { Language } from '../types'

interface Resources {
  [key: string]: Record<string, Language>
}

const resources: Resources = {
  'en-US': ENUS,
  'pt-BR': PTBR,
  'es-ES': ESES,
}

i18n.use(initReactI18next).init({
  debug: false,
  resources,
  lng: navigator.language,
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
