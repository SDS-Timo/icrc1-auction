import ptFlag from '../assets/img/flags/br.png'
import esFlag from '../assets/img/flags/es.png'
import usFlag from '../assets/img/flags/us.png'

export const LANGUAGES_OPTIONS: {
  [key: string]: { icon: string; name: string; lng: string }
} = {
  en: {
    icon: usFlag,
    name: 'English',
    lng: 'en-US',
  },
  pt: {
    icon: ptFlag,
    name: 'Portuguese',
    lng: 'pt-BR',
  },
  es: {
    icon: esFlag,
    name: 'Spanish',
    lng: 'es-ES',
  },
}
