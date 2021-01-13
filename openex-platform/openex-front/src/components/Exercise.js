import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Grid from '@material-ui/core/Grid';
import { Image } from './Image';

const styles = () => ({
  container: {
    width: '100%',
    height: '250px',
    cursor: 'pointer',
    position: 'relative',
  },
  header: {
    width: '100%',
    fontWeight: 400,
    padding: 10,
  },
  subHeader: {
    width: '100%',
    fontWeight: 400,
    color: '#616161',
    height: '30px',
    padding: 10,
  },
  title: {
    margin: '5px 0 5px 0',
    fontSize: '25px',
    fontWeight: 600,
    fontVariant: 'small-caps',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 300,
    color: '#808080',
  },
  description: {
    padding: 0,
    margin: 0,
    color: '#ffffff',
    fontWeight: 400,
    fontSize: '13px',
  },
  line: {
    marginTop: -10,
    position: 'relative',
    padding: '0 20px 0 20px',
  },
  dateLeft: {
    fontSize: '13px',
    position: 'absolute',
    left: 18,
    top: '8px',
  },
  dateRight: {
    fontSize: '13px',
    position: 'absolute',
    right: 20,
    top: '8px',
  },
});

const Exercise = (props) => {
  const { classes } = props;
  return (
    <Grid item xs={3}>
      <Card className={classes.container} variant="outlined">
        <CardActionArea
          classes={{ root: classes.area }}
          component={Link}
          to={`/private/exercise/${props.id}`}
        >
          <CardHeader title={props.name} subheader={props.subtitle} />
          <CardContent style={{ padding: 0, marginBottom: 40 }}>
            <div className={classes.line}>
              <div className={classes.dateLeft}>{props.startDate}</div>
              <div className="line">
                <ul>
                  <li> &nbsp; </li>
                  <li> &nbsp; </li>
                </ul>
              </div>
              <div className={classes.dateRight}>{props.endDate}</div>
              <div className="clearfix" />
            </div>
          </CardContent>
          <Image image_id={props.image_id} style={{ width: '100%' }} />
        </CardActionArea>
      </Card>
    </Grid>
  );
};

Exercise.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  organizer: PropTypes.string,
  organizerLogo: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  image_id: PropTypes.string,
};

export default withStyles(styles)(Exercise);
