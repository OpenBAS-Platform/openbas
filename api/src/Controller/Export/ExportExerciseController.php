<?php

namespace App\Controller\Export;

use App\Constant\ExerciseConstantClass;
use App\Entity\File;
use App\Utils\Transform;
use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use PHPExcel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;
use function json_encode;

class ExportExerciseController extends AbstractController
{

    /**
     * @OA\Property(description="Export an exercise")
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/api/exercises/{exercise_id}/export")
     */
    public function exportExerciseAction(Request $request)
    {
        $activeSheetIndex = 0;

        $exportTypes = array(
            'export_exercise' => array('sheetName' => ExerciseConstantClass::CST_EXERCISE, 'export' => $request->get('export_exercise')),
            'export_audience' => array('sheetName' => ExerciseConstantClass::CST_AUDIENCE, 'export' => $request->get('export_audience')),
            'export_objective' => array('sheetName' => ExerciseConstantClass::CST_OBJECTIVE, 'export' => $request->get('export_objective')),
            'export_scenarios' => array('sheetName' => ExerciseConstantClass::CST_SCENARIOS, 'export' => $request->get('export_scenarios')),
            'export_incidents' => array('sheetName' => ExerciseConstantClass::CST_INCIDENTS, 'export' => $request->get('export_incidents')),
            'export_injects' => array('sheetName' => ExerciseConstantClass::CST_INJECTS, 'export' => $request->get('export_injects'))
        );

        // L'export des audiences necessite l'export des exercises
        if ($exportTypes['export_audience']['export'] == '1') {
            $exportTypes['export_exercise']['export'] = '1';
        }
        // L'export des objectives necessite l'export des exercises
        if ($exportTypes['export_objective']['export'] == '1') {
            $exportTypes['export_exercise']['export'] = '1';
        }
        // L'export des scenarios necessite l'export des exercises
        if ($exportTypes['export_scenarios']['export'] == '1') {
            $exportTypes['export_exercise']['export'] = '1';
        }
        // L'export des incidents necessite l'export des scenarios et exercises
        if ($exportTypes['export_incidents']['export'] == '1') {
            $exportTypes['export_scenarios']['export'] = '1';
            $exportTypes['export_exercise']['export'] = '1';
        }
        // L'export des injects necessite l'export des incidents, scenarios et exercises
        if ($exportTypes['export_injects']['export'] == '1') {
            $exportTypes['export_incidents']['export'] = '1';
            $exportTypes['export_scenarios']['export'] = '1';
            $exportTypes['export_exercise']['export'] = '1';
        }

        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        $xlsExport = new Spreadsheet();

        $xlsExport->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[" . Transform::strToNoAccent($exercise->getExerciseName()) . "] Export");

        foreach ($exportTypes as $exportType => $sheetData) {
            if ($sheetData['export'] == '1') {
                if ($activeSheetIndex > 0) {
                    $xlsExport->createSheet($activeSheetIndex);
                    $xlsExport->setActiveSheetIndex($activeSheetIndex);
                }
                $activeSheet = $xlsExport->getActiveSheet();
                $activeSheet->setTitle($sheetData['sheetName']);
                switch ($sheetData['sheetName']) {
                    case ExerciseConstantClass::CST_EXERCISE:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_EXERCISE);
                        $activeSheet = $this->setXlsValue($activeSheet, 'A2', $exercise->getExerciseImage()->getFileName());
                        ($exercise->getExerciseAnimationGroup() !== null) ? $activeSheet = $this->setXlsValue($activeSheet, 'B2', $exercise->getExerciseAnimationGroup()->getGroupId()) : "";
                        $activeSheet = $this->setXlsValue($activeSheet, 'C2', $exercise->getExerciseName());
                        $activeSheet = $this->setXlsValue($activeSheet, 'D2', $exercise->getExerciseSubtitle());
                        $activeSheet = $this->setXlsValue($activeSheet, 'E2', $exercise->getExerciseDescription());
                        $activeSheet = $this->setXlsValue($activeSheet, 'F2', $exercise->getExerciseStartDate());
                        $activeSheet = $this->setXlsValue($activeSheet, 'G2', $exercise->getExerciseEndDate());
                        $activeSheet = $this->setXlsValue($activeSheet, 'H2', $exercise->getExerciseMessageHeader());
                        $activeSheet = $this->setXlsValue($activeSheet, 'I2', $exercise->getExerciseMessageFooter());
                        if ($exercise->getExerciseCanceled() == false) {
                            $activeSheet = $this->setXlsValue($activeSheet, 'J2', '0');
                        } else {
                            $activeSheet = $this->setXlsValue($activeSheet, 'J2', '1');
                        }
                        $activeSheet = $this->setXlsValue($activeSheet, 'K2', $exercise->getExerciseMailExpediteur());
                        break;
                    case ExerciseConstantClass::CST_AUDIENCE:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_AUDIENCE);
                        $i = 2;
                        foreach ($exercise->getExerciseAudiences() as $audience) {
                            if (count($audience->getAudienceSubaudiences()) > 0) {
                                foreach ($audience->getAudienceSubaudiences() as $subAudience) {
                                    if (count($subAudience->getSubaudienceUsers()) > 0) {
                                        foreach ($subAudience->getSubaudienceUsers() as $user) {
                                            //audience
                                            $activeSheet = $this->exportXlsAudienceData($activeSheet, $audience, $i);
                                            $activeSheet = $this->exportXlsSubAudienceData($activeSheet, $subAudience, $i);
                                            $activeSheet = $this->exportXlsUserData($activeSheet, $user, $i);
                                            $i++;
                                        }
                                    } else {
                                        $activeSheet = $this->exportXlsAudienceData($activeSheet, $audience, $i);
                                        $activeSheet = $this->exportXlsSubAudienceData($activeSheet, $subAudience, $i);
                                        $i++;
                                    }
                                }
                            } else {
                                $activeSheet = $this->exportXlsAudienceData($activeSheet, $audience, $i);
                                $i++;
                            }
                        }
                        break;
                    case ExerciseConstantClass::CST_OBJECTIVE:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_OBJECTIVE);
                        $i = 2;
                        $objectives = $em->getRepository('App:Objective')->findBy(['objective_exercise' => $exercise]);
                        foreach ($objectives as $objective) {
                            if (count($objective->getObjectiveSubobjectives()) > 0) {
                                foreach ($objective->getObjectiveSubobjectives() as $subAubjective) {
                                    $activeSheet = $this->exportXlsObjectiveData($activeSheet, $objective, $i);
                                    $activeSheet = $this->exportXlsSubObjectiveData($activeSheet, $subAubjective, $i);
                                    $i++;
                                }
                            } else {
                                $activeSheet = $this->exportXlsObjectiveData($activeSheet, $objective, $i);
                                $i++;
                            }
                        }
                        break;
                    case ExerciseConstantClass::CST_SCENARIOS:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_SCENARIOS);
                        $i = 2;
                        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
                        foreach ($events as $event) {
                            $activeSheet = $this->exportXlsEventData($activeSheet, $event, $i);
                            $i++;
                        }
                        break;
                    case ExerciseConstantClass::CST_INCIDENTS:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_INCIDENTS);
                        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
                        $i = 2;
                        foreach ($events as $event) {
                            foreach ($event->getEventIncidents() as $incident) {
                                if ($incident->getIncidentOutcome() !== null) {
                                    if (is_array($incident->getIncidentOutcome())) {
                                        foreach ($incident->getIncidentOutcome() as $incidentOutcome) {
                                            $activeSheet = $this->exportXlsIncidentData($activeSheet, $incident, $i);
                                            $activeSheet = $this->exportXlsIncidentOutcomeData($activeSheet, $incidentOutcome, $i);
                                            $i++;
                                        }
                                    } else {
                                        $activeSheet = $this->exportXlsIncidentData($activeSheet, $incident, $i);
                                        $activeSheet = $this->exportXlsIncidentOutcomeData($activeSheet, $incident->getIncidentOutcome(), $i);
                                        $i++;
                                    }
                                } else {
                                    $activeSheet = $this->exportXlsIncidentData($activeSheet, $incident, $i);
                                    $i++;
                                }
                            }
                        }
                        break;
                    case ExerciseConstantClass::CST_INJECTS:
                        $activeSheet = $this->writeXlsColumnsHeader($activeSheet, ExerciseConstantClass::CST_INJECTS);

                        $xlsInjectAudienceColumn = 'J';
                        $xlsInjectSubAudienceColumn = 'K';

                        $i = 2;
                        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
                        foreach ($events as $event) {
                            foreach ($event->getEventIncidents() as $incident) {
                                foreach ($incident->getIncidentInjects() as $inject) {
                                    $exportedInjectAudiences = [];
                                    $exportedInjectSubAudiences = [];
                                    $exportedInjectStatus = null;

                                    //foreach inject_audiences
                                    foreach ($inject->getInjectAudiences() as $audience) {
                                        if ($inject->getInjectStatus() !== null) {
                                            if (is_array($inject->getInjectStatus())) {
                                                foreach ($inject->getInjectStatus() as $injectStatus) {
                                                    $exportedInjectAudiences[] = $audience->getAudienceName();
                                                    $exportedInjectStatus = $injectStatus;
                                                }
                                            } else {
                                                $exportedInjectAudiences[] = $audience->getAudienceName();
                                                $exportedInjectStatus = $inject->getInjectStatus();
                                            }
                                        }
                                    }

                                    //foreach inject_subaudiences
                                    foreach ($inject->getInjectSubaudiences() as $subaudience) {
                                        if ($inject->getInjectStatus() !== null) {
                                            if (is_array($inject->getInjectStatus())) {
                                                foreach ($inject->getInjectStatus() as $injectStatus) {
                                                    $exportedInjectSubAudiences[] = $subaudience->getSubaudienceName();
                                                    $exportedInjectStatus = $injectStatus;
                                                }
                                            } else {
                                                $exportedInjectSubAudiences[] = $subaudience->getSubaudienceName();
                                                $exportedInjectStatus = $inject->getInjectStatus();
                                            }
                                        }
                                    }

                                    // contournement d'un "potentiel" bug dû à la mauvaise définition de l'objet dans l'entité
                                    // (si aucune audience/subaudience n'est définie)
                                    if (!count($inject->getInjectAudiences()) && !count($inject->getInjectSubaudiences())) {
                                        if ($inject->getInjectStatus() !== null) {
                                            if (is_array($inject->getInjectStatus())) {
                                                foreach ($inject->getInjectStatus() as $injectStatus) {
                                                    $exportedInjectStatus = $injectStatus;
                                                }
                                            } else {
                                                $exportedInjectStatus = $inject->getInjectStatus();
                                            }
                                        }
                                    }

                                    // Export inject data
                                    $activeSheet = $this->exportXlsInjectData($activeSheet, $inject, $i);
                                    $activeSheet = $this->setXlsValue($activeSheet, $xlsInjectAudienceColumn . $i, json_encode($exportedInjectAudiences));
                                    $activeSheet = $this->setXlsValue($activeSheet, $xlsInjectSubAudienceColumn . $i, json_encode($exportedInjectSubAudiences));
                                    $activeSheet = $this->exportXlsInjectStatusData($activeSheet, $exportedInjectStatus, $i);
                                    $i++;
                                }
                            }
                        }
                        break;
                }
                $activeSheetIndex++;
            }
        }

        $writer = new Xlsx($xlsExport);
        $exportFilePath = $request->get('export_path');
        if ($exportFilePath) {
            $writer->save($exportFilePath);
            $response = ['success' => true];
        } else {
            $response = new StreamedResponse(function () use ($writer) {
                $writer->save('php://output');
            });
            $dispositionHeader = $response->headers->makeDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, "[" . Transform::strToNoAccent($exercise->getExerciseName()) . "] Export");

            $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
            $response->headers->set('Pragma', 'public');
            $response->headers->set('Cache-Control', 'maxage=1');
            $response->headers->set('Content-Disposition', $dispositionHeader);
        }

        return $response;
    }

    /**
     * Write Columns header for XLS
     * @param type $activeSheet
     * @param type $type
     * @return type
     */
    private function writeXlsColumnsHeader($activeSheet, $type)
    {
        switch ($type) {
            case ExerciseConstantClass::CST_EXERCISE:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_EXERCISE_IMAGE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_EXERCISE_ANIMATION_GROUP);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_EXERCISE_NAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_EXERCISE_SUBTITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'E', ExerciseConstantClass::CST_EXERCISE_DESCRIPTION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'F', ExerciseConstantClass::CST_EXERCISE_START_DATE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'G', ExerciseConstantClass::CST_EXERCISE_END_DATE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'H', ExerciseConstantClass::CST_EXERCISE_MESSAGE_HEADER);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'I', ExerciseConstantClass::CST_EXERCISE_MESSAGE_FOOTER);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'J', ExerciseConstantClass::CST_EXERCISE_CANCELED);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'K', ExerciseConstantClass::CST_EXERCISE_MAIL_EXPEDITEUR);
                break;
            case ExerciseConstantClass::CST_AUDIENCE:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_AUDIENCE_NAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_AUDIENCE_ENABLED);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_SUBAUDIENCE_NAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_SUBAUDIENCE_ENABLED);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'E', ExerciseConstantClass::CST_USER_ORGANIZATION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'F', ExerciseConstantClass::CST_USER_LOGIN);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'G', ExerciseConstantClass::CST_USER_PASSWORD);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'H', ExerciseConstantClass::CST_USER_FIRSTNAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'I', ExerciseConstantClass::CST_USER_LASTNAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'J', ExerciseConstantClass::CST_USER_EMAIL);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'K', ExerciseConstantClass::CST_USER_EMAIL2);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'L', ExerciseConstantClass::CST_USER_PHONE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'M', ExerciseConstantClass::CST_USER_PHONE2);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'N', ExerciseConstantClass::CST_USER_PHONE3);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'O', ExerciseConstantClass::CST_USER_ADMIN);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'P', ExerciseConstantClass::CST_USER_STATUS);
                break;
            case ExerciseConstantClass::CST_OBJECTIVE:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_OBJECTIVE_TITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_OBJECTIVE_DESCRIPTION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_OBJECTIVE_PRIORITY);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_SUBOBJECTIVE_TITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'E', ExerciseConstantClass::CST_SUBOBJECTIVE_DESCRIPTION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'F', ExerciseConstantClass::CST_SUBOBJECTIVE_PRIORITY);
                break;
            case ExerciseConstantClass::CST_SCENARIOS:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_EVENT_IMAGE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_EVENT_TITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_EVENT_DESCRIPTION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_EVENT_ORDER);
                break;
            case ExerciseConstantClass::CST_INCIDENTS:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_INCIDENT_TYPE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_INCIDENT_EVENT);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_INCIDENT_TITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_INCIDENT_STORY);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'E', ExerciseConstantClass::CST_INCIDENT_WEIGHT);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'F', ExerciseConstantClass::CST_INCIDENT_ORDER);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'G', ExerciseConstantClass::CST_INCIDENT_OUTCOME_COMMENT);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'H', ExerciseConstantClass::CST_INCIDENT_OUTCOME_RESULT);
                break;
            case ExerciseConstantClass::CST_INJECTS:
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'A', ExerciseConstantClass::CST_INJECT_INCIDENT_ID);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'B', ExerciseConstantClass::CST_INJECT_USER);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'C', ExerciseConstantClass::CST_INJECT_TITLE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'D', ExerciseConstantClass::CST_INJECT_DESCRIPTION);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'E', ExerciseConstantClass::CST_INJECT_CONTENT);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'F', ExerciseConstantClass::CST_INJECT_DATE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'G', ExerciseConstantClass::CST_INJECT_TYPE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'H', ExerciseConstantClass::CST_INJECT_ALL_AUDIENCES);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'I', ExerciseConstantClass::CST_INJECT_ENABLED);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'J', ExerciseConstantClass::CST_INJECT_AUDIENCES);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'K', ExerciseConstantClass::CST_INJECT_SUBAUDIENCES);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'L', ExerciseConstantClass::CST_INJECT_STATUS_NAME);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'M', ExerciseConstantClass::CST_INJECT_STATUS_MESSAGE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'N', ExerciseConstantClass::CST_INJECT_STATUS_DATE);
                $activeSheet = $this->setXlsHeaderValue($activeSheet, 'O', ExerciseConstantClass::CST_INJECT_STATUS_EXECUTION);
                break;
        }
        return $activeSheet;
    }

    /**
     * Set XLS Header Value
     * @param type $activeSheet Active Sheet
     * @param type $columnName Column name
     * @param type $value Value
     * @return type                 ActiveSheet
     */
    private function setXlsHeaderValue($activeSheet, $columnName, $value)
    {
        $activeSheet->setCellValue($columnName . '1', $value)->getColumnDimension($columnName)->setAutoSize(true);
        $activeSheet->getStyle($columnName . '1')->getFont()->setBold(true);
        $activeSheet->getStyle($columnName . '1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER_CONTINUOUS);
        return $activeSheet;
    }

    /**
     * Set Xls cell Value
     * @param type $activeSheet Active Sheet
     * @param type $cellName Cell Name
     * @param type $value Value
     * @return type ActiveSheet
     */
    private function setXlsValue($activeSheet, $cellName, $value)
    {
        $activeSheet->setCellValue($cellName, $value);
        return $activeSheet;
    }

    /**
     * Export Audience Data to XLS
     * @param type $activeSheet Active sheet
     * @param type $audience Current Audience
     * @param type $indexRow Current index
     * @return type
     */
    private function exportXlsAudienceData($activeSheet, $audience, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'A' . $indexRow, $audience->getAudienceName());
        if ($audience->getAudienceEnabled() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, '1');
        }
        return $activeSheet;
    }

    /**
     * Export SubAudience Data to xls
     * @param type $activeSheet Active Sheet
     * @param type $subAudience Sub Audience
     * @param type $indexRow Index row
     * @return type             Return SubAudience
     */
    private function exportXlsSubAudienceData($activeSheet, $subAudience, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'C' . $indexRow, $subAudience->getSubaudienceName());
        if ($subAudience->getSubaudienceEnabled() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, '1');
        }
        return $activeSheet;
    }

    /**
     * Export User Data to XLS
     * @param type $activeSheet Active Sheet
     * @param type $user Current User to export
     * @param type $indexRow Index Row
     * @return type                 Return sheet
     */
    private function exportXlsUserData($activeSheet, $user, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'E' . $indexRow, $user->getUserOrganization()->getOrganizationName());
        $activeSheet = $this->setXlsValue($activeSheet, 'F' . $indexRow, $user->getUserLogin());
        $activeSheet = $this->setXlsValue($activeSheet, 'G' . $indexRow, $user->getUserPassword());
        $activeSheet = $this->setXlsValue($activeSheet, 'H' . $indexRow, $user->getUserFirstname());
        $activeSheet = $this->setXlsValue($activeSheet, 'I' . $indexRow, $user->getUserLastname());
        $activeSheet = $this->setXlsValue($activeSheet, 'J' . $indexRow, $user->getUserEmail());
        $activeSheet = $this->setXlsValue($activeSheet, 'K' . $indexRow, $user->getUserEmail2());
        $activeSheet = $this->setXlsValue($activeSheet, 'L' . $indexRow, $user->getUserPhone());
        $activeSheet = $this->setXlsValue($activeSheet, 'M' . $indexRow, $user->getUserPhone2());
        $activeSheet = $this->setXlsValue($activeSheet, 'N' . $indexRow, $user->getUserPhone3());

        if ($user->getUserAdmin() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'O' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'O' . $indexRow, '1');
        }
        if ($user->getUserStatus() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'P' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'P' . $indexRow, '1');
        }
        return $activeSheet;
    }

    /**
     * Export Objective Data to XLS
     * @param type $activeSheet Active Sheet
     * @param type $objective Current Objective
     * @param type $indexRow Current index
     * @return type                 Return sheet
     */
    private function exportXlsObjectiveData($activeSheet, $objective, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'A' . $indexRow, $objective->getObjectiveTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, $objective->getObjectiveDescription());
        $activeSheet = $this->setXlsValue($activeSheet, 'C' . $indexRow, $objective->getObjectivePriority());
        return $activeSheet;
    }

    /**
     * Export Subobjective Data to XLS
     * @param type $activeSheet Active sheet
     * @param type $subObjective Current SubObjective
     * @param type $indexRow Current index
     * @return type
     */
    private function exportXlsSubObjectiveData($activeSheet, $subObjective, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, $subObjective->getSubobjectiveTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'E' . $indexRow, $subObjective->getSubobjectiveDescription());
        $activeSheet = $this->setXlsValue($activeSheet, 'F' . $indexRow, $subObjective->getSubobjectivePriority());
        return $activeSheet;
    }

    /**
     * Export events data to XLS
     * @param type $activeSheet
     * @param type $event
     * @param type $indexRow
     * @return type
     */
    private function exportXlsEventData($activeSheet, $event, $indexRow)
    {
        if ($event->getEventImage() instanceof File) {
            $activeSheet = $this->setXlsValue($activeSheet, 'A' . $indexRow, $event->getEventImage()->getFilePath());
        }
        $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, $event->getEventTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'C' . $indexRow, $event->getEventdescription());
        $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, $event->getEventOrder());
        return $activeSheet;
    }

    /**
     * Export incident data to XLS
     * @param type $activeSheet Active sheet
     * @param type $incident Incident object to extract
     * @param type $indexRow Index row
     * @return type                 return sheet
     */
    private function exportXlsIncidentData($activeSheet, $incident, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'A' . $indexRow, $incident->getIncidentType()->getTypeName());
        $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, $incident->getIncidentEvent()->getEventTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'C' . $indexRow, $incident->getIncidentTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, $incident->getIncidentStory());
        $activeSheet = $this->setXlsValue($activeSheet, 'E' . $indexRow, $incident->getIncidentWeight());
        $activeSheet = $this->setXlsValue($activeSheet, 'F' . $indexRow, $incident->getIncidentOrder());
        return $activeSheet;
    }

    private function exportXlsIncidentOutcomeData($activeSheet, $incidentOutcome, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'G' . $indexRow, $incidentOutcome->getOutcomeComment());
        $activeSheet = $this->setXlsValue($activeSheet, 'H' . $indexRow, $incidentOutcome->getOutcomeResult());
        return $activeSheet;
    }

    private function exportXlsInjectData($activeSheet, $inject, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'A' . $indexRow, $inject->getInjectIncident()->getIncidentTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'B' . $indexRow, $inject->getInjectUser()->getUserEmail());
        $activeSheet = $this->setXlsValue($activeSheet, 'C' . $indexRow, $inject->getInjectTitle());
        $activeSheet = $this->setXlsValue($activeSheet, 'D' . $indexRow, $inject->getInjectDescription());
        $activeSheet = $this->setXlsValue($activeSheet, 'E' . $indexRow, $inject->getInjectContent());
        $activeSheet = $this->setXlsValue($activeSheet, 'F' . $indexRow, $inject->getInjectDate());
        $activeSheet = $this->setXlsValue($activeSheet, 'G' . $indexRow, $inject->getInjectType());

        if ($inject->getInjectAllAudiences() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'H' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'H' . $indexRow, '1');
        }

        if ($inject->getInjectEnabled() == false) {
            $activeSheet = $this->setXlsValue($activeSheet, 'I' . $indexRow, '0');
        } else {
            $activeSheet = $this->setXlsValue($activeSheet, 'I' . $indexRow, '1');
        }

        return $activeSheet;
    }

    private function exportXlsInjectStatusData($activeSheet, $injectStatus, $indexRow)
    {
        $activeSheet = $this->setXlsValue($activeSheet, 'L' . $indexRow, $injectStatus->getStatusName());
        $activeSheet = $this->setXlsValue($activeSheet, 'M' . $indexRow, $injectStatus->getStatusMessage());
        $activeSheet = $this->setXlsValue($activeSheet, 'N' . $indexRow, $injectStatus->getStatusDate());
        $activeSheet = $this->setXlsValue($activeSheet, 'O' . $indexRow, $injectStatus->getStatusExecution());
        return $activeSheet;
    }
}
