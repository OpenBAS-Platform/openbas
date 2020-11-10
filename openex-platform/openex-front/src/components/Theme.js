import {
  indigo500, indigo700, pinkA200,
  grey100, grey400, grey500, grey700,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors'
import {fade} from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: indigo500,
    primary2Color: indigo700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: grey700,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey400,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: indigo500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  }
}