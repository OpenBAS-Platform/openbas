import Immutable from 'seamless-immutable'

export const i18n = {
  messages: Immutable({
    fr: {
      'TECHNICAL': 'Technique',
      'OPERATIONAL': 'Opérationnel',
      'STRATEGIC': 'Stratégique',
      'SCHEDULED': 'Planifié',
      'RUNNING': 'En cours',
      'FINISHED': 'Terminé',
    },
    en: {
      'TECHNICAL': 'Technique',
      'OPERATIONAL': 'Opérationnel',
      'STRATEGIC': 'Stratégique',
      'SCHEDULED': 'Scheduled',
      'RUNNING': 'Running',
      'FINISHED': 'Finished',
    }
  })
}
export const i18nRegister = (data) => {
  i18n.messages = i18n.messages.merge(data, {deep: true})
}
