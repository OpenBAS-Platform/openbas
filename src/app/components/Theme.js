import {
  blueGrey500, blueGrey600, blueGrey700,
  indigo500, lightBlueA200,
  grey200, grey700, grey900,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: blueGrey700,
    primary2Color: blueGrey600,
    primary3Color: blueGrey500,
    accent1Color: lightBlueA200,
    accent2Color: grey200,
    accent3Color: grey900,
    textColor: grey700,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey200,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: indigo500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  }
}