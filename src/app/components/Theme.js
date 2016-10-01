import {
  blueGrey700, blueGrey600,
  indigo500,
  pinkA200,
  grey100, grey400, grey500,
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
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: grey500,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: blueGrey600,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: indigo500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  }
}