import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bar, HorizontalBar, Line } from 'react-chartjs-2';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { getStatisticsForExercise } from '../../../../actions/Exercise';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';

i18nRegister({
  fr: {
    Statistics: 'Statistiques',
    'Interval:': 'Intervalle :',
  },
});

const styles = {
  container: {
    textAlign: 'left',
  },
  empty: {
    marginTop: '30',
    fontSize: '18px',
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  lineStatistic: {
    display: 'inline-block',
    width: '100%',
  },
  columnStatistic: {
    display: 'inline-block',
    fontSize: '14px',
    width: '50%',
  },
};

const keyArrayStatistics = [
  'allInjectsCount',
  'avgInjectPerPlayerCount',
  'allPlayersCount',
  'organizationsCount',
  'frequencyOfInjectsCount',
  'injectPerPlayer',
  'injectPerIncident',
  'injectPerInterval',
  'value',
];

class Index extends Component {
  constructor(props) {
    super(props);

    const oStatistics = {};

    keyArrayStatistics.forEach((key) => {
      oStatistics[key] = '';
    });

    this.state = oStatistics;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, index, value) {
    this.setState({ value });
    const data = { value };
    this.props
      .getStatisticsForExercise(this.props.exerciseId, data)
      .then((statistics) => {
        this.handleGetStatistics(statistics.result);
      });
  }

  componentDidMount() {
    const data = { value: null };
    this.props
      .getStatisticsForExercise(this.props.exerciseId, data)
      .then((statistics) => {
        this.handleGetStatistics(statistics.result);
      });
  }

  handleGetStatistics(data) {
    const oStatistics = this.state;
    keyArrayStatistics.forEach((key) => {
      oStatistics[key] = data[key];
    });

    // Construct data for graph bar inject per player
    const oInjectPerPlayer = this.state.injectPerPlayer;

    const labelArrayInjectPerPlayer = [];
    if (oInjectPerPlayer.labels) {
      oInjectPerPlayer.labels.forEach((label) => {
        labelArrayInjectPerPlayer.push(label);
      });
    }

    const dataArrayInjectPerPlayer = [];
    if (oInjectPerPlayer.datasets && oInjectPerPlayer.datasets.data) {
      oInjectPerPlayer.datasets.data.forEach((data) => {
        dataArrayInjectPerPlayer.push(data);
      });
    }

    oStatistics.injectPerPlayer = {
      labels: labelArrayInjectPerPlayer,
      datasets: [
        {
          data: dataArrayInjectPerPlayer,
          label: "Nombre d'impressions",
          backgroundColor: 'rgb(63, 81, 181)',
        },
      ],
    };

    // Construct data for graph bar inject per Incident
    const oInjectPerIncident = this.state.injectPerIncident;

    const labelArrayInjectPerIncident = [];
    if (oInjectPerIncident.labels) {
      oInjectPerIncident.labels.forEach((label) => {
        labelArrayInjectPerIncident.push(label);
      });
    }

    const dataArrayInjectPerIncident = [];
    if (
      oInjectPerIncident.datasets
      && oInjectPerIncident.datasets.data
    ) {
      oInjectPerIncident.datasets.data.forEach((data) => {
        dataArrayInjectPerIncident.push(data);
      });
    }

    oStatistics.injectPerIncident = {
      labels: labelArrayInjectPerIncident,
      datasets: [
        {
          data: dataArrayInjectPerIncident,
          label: "Nombre d'injects",
          backgroundColor: 'rgb(255, 64, 129)',
        },
      ],
    };

    // Construct data for graph line: inject per interval
    const oInjectPerInterval = this.state.injectPerInterval;

    const labelArrayInjectPerInterval = [];
    if (oInjectPerInterval.labels) {
      oInjectPerInterval.labels.forEach((label) => {
        labelArrayInjectPerInterval.push(label);
      });
    }

    const dataArrayInjectPerInterval = [];
    if (
      oInjectPerInterval.datasets
      && oInjectPerInterval.datasets.data
    ) {
      oInjectPerInterval.datasets.data.forEach((data) => {
        dataArrayInjectPerInterval.push(data);
      });
    }

    oStatistics.injectPerInterval = {
      labels: labelArrayInjectPerInterval,
      datasets: [
        {
          data: dataArrayInjectPerInterval,
          label: "Nombre d'injects",
          fill: 'false',
          lineTension: '0.1',
          backgroundColor: 'rgb(63, 81, 181)',
          borderColor: 'rgb(63, 81, 181)',
        },
      ],
    };

    this.setState(oStatistics);
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <h2>
            <T>Statistics</T>
          </h2>
        </div>
        <div className="clearfix"></div>
        <div style={styles.lineStatistic}>
          <div style={styles.columnStatistic}>
            <p>
              Nombre total d'impressions pour cet exercice&nbsp;:{' '}
              {this.state.allInjectsCount}
              &nbsp;
              <span
                title="nombre d'impressions = somme (inject i * nombre de destinataires i) pour i de 1 à n."
                role="img"
                aria-label="info"
              >
                ℹ️
              </span>
            </p>
            <p>
              Nombre moyen d'injects par joueur&nbsp;:{' '}
              {this.state.avgInjectPerPlayerCount}
            </p>
            <p>Nombre total de joueurs&nbsp;: {this.state.allPlayersCount}</p>
          </div>
          <div style={styles.columnStatistic}>
            <p>Nombre d'organisations&nbsp;: {this.state.organizationsCount}</p>
            <p>
              Fréquence des impressions&nbsp;:{' '}
              {this.state.frequencyOfInjectsCount} impression(s)/heure
            </p>
          </div>
        </div>

        <div>
          <h3>Répartition du nombre d'impressions par joueur :</h3>
          <Bar
            data={this.state.injectPerPlayer}
            width={100}
            height={25}
            options={{
              maintainAspectRatio: true,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      callback(value) {
                        if (value % 1 === 0) {
                          return value;
                        }
                      },
                    },
                  },
                ],
                xAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                ],
              },
            }}
          />
        </div>

        <div>
          <h3>Répartition du nombre d'injects par incident :</h3>
          <HorizontalBar
            data={this.state.injectPerIncident}
            width={100}
            height={25}
            options={{
              maintainAspectRatio: true,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                ],
                xAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      callback(value) {
                        if (value % 1 === 0) {
                          return value;
                        }
                      },
                    },
                  },
                ],
              },
            }}
          />
        </div>

        <div>
          <h3>Répartition du nombre d'injects par pas de temps :</h3>
          <p>
            <T>Interval:</T>
            <br />
            <Select
              labelId="interval-select-label"
              name="interval"
              id="interval-select"
              value={this.state.value}
              onChange={this.handleChange}
              autoWidth={true}
            >
              <MenuItem key={'0.5'} value={'0.5'} primaryText="30 minutes" />
              <MenuItem key={'1'} value={'1'} primaryText="1h" />
              <MenuItem key={'2'} value={'2'} primaryText="2h" />
              <MenuItem key={'6'} value={'6'} primaryText="6h" />
              <MenuItem key={'12'} value={'12'} primaryText="12h" />
              <MenuItem key={'24'} value={'24'} primaryText="24h" />
            </Select>
          </p>

          <Line
            data={this.state.injectPerInterval}
            width={100}
            height={25}
            options={{
              maintainAspectRatio: true,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      callback(value) {
                        if (value % 1 === 0) {
                          return value;
                        }
                      },
                    },
                  },
                ],
                xAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                ],
              },
            }}
          />
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  getStatisticsForExercise: PropTypes.func,
};

const select = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
  return {
    exerciseId,
  };
};

export default connect(select, { getStatisticsForExercise })(Index);
