import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {T} from '../../../../components/I18n'
import {Paper} from '../../../../components/Paper'
import * as Constants from '../../../../constants/ComponentTypes'
import {Button} from '../../../../components/Button'
import {i18nRegister} from '../../../../utils/Messages'
import {createExerciseTest, deleteUsersTest} from '../../../../actions/Tests'
import {deleteExercise, exportExercise, importExerciseFromPath} from '../../../../actions/Exercise'
import {addDryrun} from '../../../../actions/Dryrun'

i18nRegister({
  fr: {
    'Beginning of the test': 'Début des tests',
    'End of the test': 'Fin des tests',
    'Execute the tests': 'Exécution des tests',
    'Run the test': 'Lancer le test',
    'Execute Tests after update': 'Exécution de tests après une mise à jour de l\'application.',
    'Creating a test exercise...': 'Création d\'un exercice de test...',
    'Creating a test exercise... OK': 'Création d\'un exercice de test... OK',
    'Export the test exercise...': 'Export de l\'exercice de test...',
    'Export the test exercise... OK': 'Export de l\'exercice de test... OK',
    'Deleting the test exercise...': 'Suppression de l\'exercice...',
    'Deleting the test exercise... OK': 'Suppression de l\'exercice... OK',
    'Deleting test accounts...': 'Suppression des comptes de test...',
    'Deleting test accounts... OK': 'Suppression des comptes de test... OK',
    'Reimport of the test exercise...': 'Réimport de l\'exercice de test...',
    'Reimport of the test exercise... OK': 'Réimport de l\'exercice de test... OK',
    'Execution of the Dryrun...': 'Exécution d\'une simulation...',
    'Execution of the Dryrun... OK': 'Exécution d\'une simulation... OK',
    'Deleting test data...': 'Suppression des données de test...',
    'Deleting test data... OK': 'Suppression des données de test... OK',
    'An error occurred while creating the test exercise': 'Une erreur est survenue lors de la création de l\'exercice de test',
    'An error occurred while exporting the exercise': 'Une erreur est survenue lors de l\'export de l\'exercice',
    'An error occurred while deleting test user accounts': 'Une erreur est survenue lors de la suppression des comptes utilisateur de test',
    'An error occurred while importing the test exercise': 'Une erreur est survenue lors de l\'importation de l\'exercice de test',
    'Creating a test exercise': 'Création d\'un exercice de test',
    'Export the test exercise': 'Export de cet exercice',
    'Deleting the test exercise': 'Suppression de l\'exercice en base de données',
    'Import of the test exercise': 'Import de cet exercise',
    'Execute a dryrun': 'Exécution d\'une simulation',
    'Deleting test accounts': 'Suppression des comptes utilisateur de test'
  }
})

const styles = {
  'PaperContent': {
    padding: '20px'
  },
  'title': {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600
  },
  'li': {
    listStyle: 'none'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTests: false,
      typesToExport: {
        'exercise': '1',
        'audience': '1',
        'objective': '1',
        'scenarios': '1',
        'incidents': '1',
        'injects': '1'
      },
      resultTest: {
        'step1': '',
        'step2': '',
        'step3': '',
        'step4': '',
        'step5': '',
        'step6': '',
        'step7': ''
      },
      resultTestDesc : []
    }
  }

  componentDidMount() {
  }

  handleOpenTests() {
    this.setState({openTests: true})
  }

  handleCloseTests() {
    this.setState({openTests: false})
  }

  updateTestResult(step, result) {
    let resultTest = this.state.resultTest
    resultTest[step] = result
    this.setState({resultTest: resultTest})
  }

  submitTests(data) {
    this.setState({openTests: false})
    this.updateResultTestDesc('Beginning of the test')
    let now = Date.now()
    let exportFileName = '../var/files/test_' + now + '.xls'

    //try to create test exercise
    this.updateResultTestDesc('Creating a test exercise...')
    this.updateTestResult('step1', 'doing')
    this.props.createExerciseTest(data).then(resultCreateExercise => {
        if (resultCreateExercise.result.success === true) {
            this.updateResultTestDesc('Creating a test exercise... OK')
            this.updateTestResult('step1', true)
            let paramExportExercise = this.state.typesToExport
            paramExportExercise['export_path'] = exportFileName

            //try to export test exercise
            this.updateResultTestDesc('Export the test exercise...')
            this.updateTestResult('step2', 'doing')
            this.props.exportExercise(resultCreateExercise.result.exercise_id, paramExportExercise).then(resultExportExercise => {
                if (resultExportExercise.result.success === true) {
                    this.updateResultTestDesc('Export the test exercise... OK')
                    this.updateTestResult('step2', true)

                    //try to delete exercise
                    this.updateResultTestDesc('Deleting the test exercise...')
                    this.updateTestResult('step3', 'doing')
                    this.props.deleteExercise(resultCreateExercise.result.exercise_id).then(resultDeleteExercise => {
                        this.updateResultTestDesc('Deleting the test exercise... OK')
                        this.updateTestResult('step3', true)

                        //try to delete test accounts
                        this.updateResultTestDesc('Deleting test accounts...')
                        this.updateTestResult('step4', 'doing')
                        this.props.deleteUsersTest().then(resultDeleteUsers => {
                            if (resultDeleteUsers.result.success === true) {
                                this.updateResultTestDesc('Deleting test accounts... OK')
                                this.updateTestResult('step4', true)

                                //try to import xls data
                                let paramImportExercise = this.state.typesToExport
                                paramImportExercise['import_path'] = exportFileName
                                this.updateResultTestDesc('Reimport of the test exercise...')
                                this.updateTestResult('step5', 'doing')
                                this.props.importExerciseFromPath(paramImportExercise).then(resultImportExercise => {
                                    if (resultImportExercise.result.success === true) {
                                        this.updateResultTestDesc('Reimport of the test exercise... OK')
                                        this.updateTestResult('step5', true)

                                        //try to run dryrun
                                        let paramAddDryrun = {'dryrun_speed': 72}
                                        this.updateResultTestDesc('Execution of the Dryrun...')
                                        this.updateTestResult('step6', 'doing')
                                        this.props.addDryrun(resultImportExercise.result.exercise_id, paramAddDryrun).then(resultAddDryrun => {
                                            this.updateResultTestDesc('Execution of the Dryrun... OK')
                                            this.updateTestResult('step6', true)

                                            //delete test data
                                            this.updateResultTestDesc('Deleting test data...')
                                            this.updateTestResult('step7', 'doing')
                                            this.props.deleteExercise(resultImportExercise.result.exercise_id).then(resultDeleteExercise => {
                                                this.props.deleteUsersTest().then(resultDeleteUsers => {
                                                    this.updateResultTestDesc('Deleting test data... OK')

                                                    //delete test accounts
                                                    this.updateResultTestDesc('Deleting test accounts...')
                                                    if (resultDeleteUsers.result.success === true) {
                                                        this.updateResultTestDesc('Deleting test accounts... OK')
                                                        this.updateTestResult('step7', true)

                                                        //end
                                                        this.updateResultTestDesc('End of the test')
                                                    }
                                                })
                                            })
                                        })
                                    } else {
                                        this.updateResultTestDesc('An error occurred while importing the test exercise')
                                    }
                                })
                            } else {
                                this.updateResultTestDesc('An error occurred while deleting test user accounts')
                            }
                        })
                    })
                } else {
                    this.updateResultTestDesc('An error occurred while exporting the exercise')
                }
            });
        } else {
            this.updateResultTestDesc('An error occurred while creating the test exercise')
        }

    })
  }

  updateResultTestDesc(description) {
      let resultTestDesc = this.state.resultTestDesc
      resultTestDesc.push(description)
      this.setState({resultTestDesc: resultTestDesc})
  }

  handleSubmitTests(data) {
      this.updateTestResult('step1', '')
      this.updateTestResult('step2', '')
      this.updateTestResult('step3', '')
      this.updateTestResult('step4', '')
      this.updateTestResult('step5', '')
      this.updateTestResult('step6', '')
      this.updateTestResult('step7', '')
      this.setState({resultTestDesc: ''})
      this.submitTests(data)
  }

  renderUnitTestStatus(step) {
      return (
        (this.state.resultTest[step] === false)
        ? (<span role="img" aria-label="">❌</span>)
        : (this.state.resultTest[step] === true)
          ? (<span role="img" aria-label="">☑️</span>)
          : (this.state.resultTest[step] === 'doing')
            ? (<span role="img" aria-label="">➡️</span>)
            : (<span></span>)
      )
  }

  render() {
    return <div>
      <div style={styles.title}><T>Execute Tests after update</T></div>
      <div className="clearfix"></div>
        <br/>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Execute the tests</T></h2>
            <ul>
                <li style={styles.li}>{this.renderUnitTestStatus('step1')}&nbsp;<T>Creating a test exercise</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step2')}&nbsp;<T>Export the test exercise</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step3')}&nbsp;<T>Deleting the test exercise</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step4')}&nbsp;<T>Import of the test exercise</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step5')}&nbsp;<T>Execute a dryrun</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step6')}&nbsp;<T>Deleting the test exercise</T></li>
                <li style={styles.li}>{this.renderUnitTestStatus('step7')}&nbsp;<T>Deleting test accounts</T></li>
            </ul>
            <Button label='Run the test' onClick={this.handleSubmitTests.bind(this)}/>
          </div>
          <div style={styles.PaperContent}>
            {this.state.resultTestDesc.map((key, item) => {return (<div><T>{key}</T></div>)})}
          </div>
        </Paper>
    </div>
  }
}

Index.propTypes = {
  groups: PropTypes.object,
  organizations: PropTypes.object,
  exercises: PropTypes.object,
  users: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchExercises: PropTypes.func,
  fetchGroups: PropTypes.func,
  createExerciseTest: PropTypes.func,
  deleteExercise: PropTypes.func,
  deleteUsersTest: PropTypes.func,
  exportExercise: PropTypes.func,
  importExerciseFromPath: PropTypes.func,
  addDryrun: PropTypes.func
}

const select = (state) => {
  return {
    groups: state.referential.entities.groups,
    exercises: state.referential.entities.exercises,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {createExerciseTest, deleteExercise, exportExercise, deleteUsersTest, importExerciseFromPath, addDryrun})(Index);
