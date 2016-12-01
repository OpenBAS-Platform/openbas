import {fromJS} from 'immutable'

export const i18n = {
  messages: {
    fr: {
      //Constants
      'TECHNICAL': 'Technique',
      'OPERATIONAL': 'Opérationnel',
      'STRATEGIC': 'Stratégique',
      'SCHEDULED': 'Prévu',
      'RUNNING': 'En cours',
      'FINISHED': 'Terminé',
      //Validations
      'This value should not be blank.': 'Cette valeur est obligatoire',
      'This value is not valid.': 'Valeur invalide',
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
