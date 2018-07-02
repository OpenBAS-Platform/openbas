import Immutable from 'seamless-immutable'
import {logDate} from './Time'

export const i18n = {
  messages: Immutable({
    fr: {
      'OpenEx - Crisis management exercises platform': 'OpenEx - Plateforme d’exercices de crise',
      'TECHNICAL': 'Technique',
      'OPERATIONAL': 'Opérationnel',
      'STRATEGIC': 'Stratégique',
      'SCHEDULED': 'Planifié',
      'RUNNING': 'En cours',
      'FINISHED': 'Terminé',
      'CANCELED': 'Désactivé',
      'Cancel': 'Annuler',
      'Next': 'Suivant',
      'Create': 'Créer',
      'Launch': 'Lancer',
      'Edit': 'Modifier',
      'Update': 'Modifier',
      'Delete': 'Supprimer',
      'Confirmation': 'Confirmation',
      'Search': 'Rechercher',
      'Required': 'Obligatoire',
      'Close': 'Fermer',
      'Export to XLS': 'Exporter en XLS',
      'Copy': 'Copier'
    },
    en: {
      'TECHNICAL': 'Technique',
      'OPERATIONAL': 'Opérationnel',
      'STRATEGIC': 'Stratégique',
      'SCHEDULED': 'Scheduled',
      'RUNNING': 'Running',
      'FINISHED': 'Finished',
      'CANCELED': 'Disabled',
    }
  })
}
export const i18nRegister = (data) => {
  i18n.messages = i18n.messages.merge(data, {deep: true})
}

export const debug = (...msg) => {
  if (process.env.NODE_ENV === `development`) Function.prototype.apply.call(console.log, console, [logDate(), msg]);
}
