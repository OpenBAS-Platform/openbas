import {fromJS} from 'immutable'

export const i18n = {
  messages: {
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
  }
}
export const i18nRegister = (data) => {
  var mergedMessages = fromJS(i18n.messages).mergeDeep(fromJS(data))
  i18n.messages = mergedMessages.toJS()
}