<?php

namespace App\Controller\Import;

use App\Constant\ExerciseConstantClass;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use App\Entity\InjectStatus;
use App\Entity\Objective;
use App\Entity\Organization;
use App\Entity\Outcome;
use App\Entity\Subaudience;
use App\Entity\Subobjective;
use App\Entity\User;
use DateTime;
use Doctrine\DBAL\DBALException;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PHPExcel;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use stdClass;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use function is_array;
use function json_decode;

class ImportExerciseController extends AbstractController
{

    /**
     * @OA\Response(
     *    response=200,description="Import an exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/api/exercises/import/check/exercise/{file_id}")
     */
    public function checkIfExerciseNameExistAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $reader = new Xlsx();
        if ($request->get('file_id') !== null) {
            $file = $em->getRepository('App:File')->find($request->get('file_id'));
            if (empty($file)) {
                return $this->fileNotFound();
            }
            $fileAddress = $this->get('kernel')->getProjectDir() . "/var/files/" . $file->getFilePath();
        } else {
            $fileAddress = $request->get('import_path');
        }

        if (!file_exists($fileAddress)) {
            return $this->fileNotFound($fileAddress);
        }

        $spreadsheet = $reader->load($fileAddress);
        foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
            if (strtolower($worksheet->getTitle()) == ExerciseConstantClass::CST_EXERCISE) {
                $data = $this->getData($spreadsheet, strtolower($worksheet->getTitle()));
                // Test if an exerise exist with same name and owner
                $exercise = $em->getRepository('App:Exercise')->findOneBy(array('exercise_owner' => $this->getUser(), 'exercise_name' => $data[ExerciseConstantClass::CST_EXERCISE_NAME]));
                if ($exercise) {
                    return array('exercise_exist' => true);
                }
            }
        }
        return array('exercise_exist' => false);
    }

    /**
     *
     * @return type
     */
    private function fileNotFound()
    {
        return View::create(['message' => 'File not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * Get Data for sheet by sheet name
     * @param type $objPHPExcel Excel worksheet
     * @param type $sheetName Excel sheetName
     * @return type                 Return Array
     */
    private function getData(&$objPHPExcel, $sheetName)
    {
        $datas = array();
        $sheet = $objPHPExcel->getSheetByName($sheetName);
        switch ($sheetName) {
            case ExerciseConstantClass::CST_EXERCISE:
                $datas = [ExerciseConstantClass::CST_EXERCISE_IMAGE => $sheet->getCell('A2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_ANIMATION_GROUP => $sheet->getCell('B2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_NAME => $sheet->getCell('C2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_SUBTITLE => $sheet->getCell('D2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_DESCRIPTION => $sheet->getCell('E2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_START_DATE => $sheet->getCell('F2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_END_DATE => $sheet->getCell('G2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_MESSAGE_HEADER => $sheet->getCell('H2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_MESSAGE_FOOTER => $sheet->getCell('I2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_CANCELED => $sheet->getCell('J2')->getValue(),
                    ExerciseConstantClass::CST_EXERCISE_MAIL_EXPEDITEUR => $sheet->getCell('K2')->getValue()];
                break;
            case ExerciseConstantClass::CST_AUDIENCE:
                $i = 2;
                do {
                    $data = [ExerciseConstantClass::CST_AUDIENCE_NAME => $sheet->getCell('A' . $i)->getValue(),
                        ExerciseConstantClass::CST_AUDIENCE_ENABLED => $sheet->getCell('B' . $i)->getValue(),
                        ExerciseConstantClass::CST_SUBAUDIENCE_NAME => $sheet->getCell('C' . $i)->getValue(),
                        ExerciseConstantClass::CST_SUBAUDIENCE_ENABLED => $sheet->getCell('D' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_ORGANIZATION => $sheet->getCell('E' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_LOGIN => $sheet->getCell('F' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_PASSWORD => $sheet->getCell('G' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_FIRSTNAME => $sheet->getCell('H' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_LASTNAME => $sheet->getCell('I' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_EMAIL => $sheet->getCell('J' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_EMAIL2 => $sheet->getCell('K' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_PHONE => $sheet->getCell('L' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_PHONE2 => $sheet->getCell('M' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_PHONE3 => $sheet->getCell('N' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_ADMIN => $sheet->getCell('O' . $i)->getValue(),
                        ExerciseConstantClass::CST_USER_STATUS => $sheet->getCell('P' . $i)->getValue()];
                    $datas[] = $data;
                    $i++;
                } while (trim($sheet->getCell('A' . $i)->getValue()) !== '');
                break;
            case ExerciseConstantClass::CST_OBJECTIVE:
                $i = 2;
                do {
                    $data = [ExerciseConstantClass::CST_OBJECTIVE_TITLE => $sheet->getCell('A' . $i)->getValue(),
                        ExerciseConstantClass::CST_OBJECTIVE_DESCRIPTION => $sheet->getCell('B' . $i)->getValue(),
                        ExerciseConstantClass::CST_OBJECTIVE_PRIORITY => $sheet->getCell('C' . $i)->getValue(),
                        ExerciseConstantClass::CST_SUBOBJECTIVE_TITLE => $sheet->getCell('D' . $i)->getValue(),
                        ExerciseConstantClass::CST_SUBOBJECTIVE_DESCRIPTION => $sheet->getCell('E' . $i)->getValue(),
                        ExerciseConstantClass::CST_SUBOBJECTIVE_PRIORITY => $sheet->getCell('F' . $i)->getValue()];
                    $datas[] = $data;
                    $i++;
                } while (trim($sheet->getCell('A' . $i)->getValue()) !== '');
                break;
            case ExerciseConstantClass::CST_SCENARIOS:
                $i = 2;
                do {
                    $data = [ExerciseConstantClass::CST_EVENT_IMAGE => $sheet->getCell('A' . $i)->getValue(),
                        ExerciseConstantClass::CST_EVENT_TITLE => $sheet->getCell('B' . $i)->getValue(),
                        ExerciseConstantClass::CST_EVENT_DESCRIPTION => $sheet->getCell('C' . $i)->getValue(),
                        ExerciseConstantClass::CST_EVENT_ORDER => $sheet->getCell('D' . $i)->getValue()];
                    $datas[] = $data;
                    $i++;
                } while (trim($sheet->getCell('B' . $i)->getValue()) !== '');
                break;
            case ExerciseConstantClass::CST_INCIDENTS:
                $i = 2;
                do {
                    $data = [ExerciseConstantClass::CST_INCIDENT_TYPE => $sheet->getCell('A' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_EVENT => $sheet->getCell('B' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_TITLE => $sheet->getCell('C' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_STORY => $sheet->getCell('D' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_WEIGHT => $sheet->getCell('E' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_ORDER => $sheet->getCell('F' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_OUTCOME_COMMENT => $sheet->getCell('G' . $i)->getValue(),
                        ExerciseConstantClass::CST_INCIDENT_OUTCOME_RESULT => $sheet->getCell('H' . $i)->getValue()];
                    $datas[] = $data;
                    $i++;
                } while (trim($sheet->getCell('A' . $i)->getValue()) !== '');
                break;
            case ExerciseConstantClass::CST_INJECTS:
                $i = 2;
                do {
                    $data = [ExerciseConstantClass::CST_INJECT_INCIDENT_ID => $sheet->getCell('A' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_USER => $sheet->getCell('B' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_TITLE => $sheet->getCell('C' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_DESCRIPTION => $sheet->getCell('D' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_CONTENT => $sheet->getCell('E' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_DATE => $sheet->getCell('F' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_TYPE => $sheet->getCell('G' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_ALL_AUDIENCES => $sheet->getCell('H' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_ENABLED => $sheet->getCell('I' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_AUDIENCES => $sheet->getCell('J' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_SUBAUDIENCES => $sheet->getCell('K' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_STATUS_NAME => $sheet->getCell('L' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_STATUS_MESSAGE => $sheet->getCell('M' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_STATUS_DATE => $sheet->getCell('N' . $i)->getValue(),
                        ExerciseConstantClass::CST_INJECT_STATUS_EXECUTION => $sheet->getCell('O' . $i)->getValue()];
                    $datas[] = $data;
                    $i++;
                } while (trim($sheet->getCell('A' . $i)->getValue()) !== '');
                break;
        }
        return $datas;
    }

    /**
     * @OA\Response(
     *    response=200,description="Import an exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/api/exercises/import")
     */
    public function importExerciseAction(Request $request)
    {
        $reader = new Xlsx();
        $listTypeSheet = [ExerciseConstantClass::CST_EXERCISE => 'import_exercise',
            ExerciseConstantClass::CST_AUDIENCE => 'import_audience',
            ExerciseConstantClass::CST_OBJECTIVE => 'import_objective',
            ExerciseConstantClass::CST_SCENARIOS => 'import_scenarios',
            ExerciseConstantClass::CST_INCIDENTS => 'import_incidents',
            ExerciseConstantClass::CST_INJECTS => 'import_injects'];

        $em = $this->getDoctrine()->getManager();

        if ($request->get('file') !== null) {
            $file = $em->getRepository('App:File')->find($request->get('file'));
            if (empty($file)) {
                return $this->fileNotFound();
            }
            $fileAddress = $this->get('kernel')->getProjectDir() . "/var/files/" . $file->getFilePath();
        } else {
            $fileAddress = $request->get('import_path');
        }

        if (!file_exists($fileAddress)) {
            return $this->fileNotFound($fileAddress);
        }

        $objPHPExcel = $reader->load($fileAddress);

        // Force create element even if one similar is found (to allow duplicates in import)
        $forceCreateExercise = false;
        $forceCreateAudience = false;
        $forceCreateObjective = false;
        $forceCreateEvent = false;
        $forceCreateIncident = false;
        $forceCreateInject = true;

        foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
            if (array_key_exists(strtolower($worksheet->getTitle()), $listTypeSheet)) {
                if ($request->get($listTypeSheet[strtolower($worksheet->getTitle())]) == '1') {
                    $datas = $this->getData($objPHPExcel, strtolower($worksheet->getTitle()));
                    switch (strtolower($worksheet->getTitle())) {
                        case ExerciseConstantClass::CST_EXERCISE:
                            $result = $this->createOrUpdateExerciseSheet($em, $datas, $forceCreateExercise);
                            if ($result->success) {
                                $exercise = $result->return;
                            } else {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                        case ExerciseConstantClass::CST_AUDIENCE:
                            $result = $this->createOrUpdateAudienceSheet($em, $datas, $exercise, $forceCreateAudience);
                            if (!$result->success) {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                        case ExerciseConstantClass::CST_OBJECTIVE:
                            $result = $this->createOrUpdateObjectiveSheet($em, $datas, $exercise, $forceCreateObjective);
                            if (!$result->success) {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                        case ExerciseConstantClass::CST_SCENARIOS:
                            $result = $this->createOrUpdateEventSheet($em, $datas, $exercise, $forceCreateEvent);
                            if (!$result->success) {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                        case ExerciseConstantClass::CST_INCIDENTS:
                            $result = $this->createOrUpdateIncidentSheet($em, $datas, $exercise, $forceCreateIncident);
                            if (!$result->success) {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                        case ExerciseConstantClass::CST_INJECTS:
                            $result = $this->createOrUpdateInjectSheet($em, $datas, $exercise, $forceCreateInject);
                            if (!$result->success) {
                                return $this->returnImportError($result->errorMessage, $result->errorDetailMessage);
                            }
                            break;
                    }
                }
            }
        }
        return $this->returnImportSuccess($exercise);
    }

    /**
     * Create Exercise
     * @param type $em
     * @param type $data
     * @return Exercise
     */
    private function createOrUpdateExerciseSheet(&$em, $data, $forceCreate = false)
    {
        try {
            $exercise = $em->getRepository('App:Exercise')->findOneBy(array('exercise_owner' => $this->getUser(), 'exercise_name' => $data[ExerciseConstantClass::CST_EXERCISE_NAME]));
            if (!$exercise || $forceCreate) {
                $exercise = new Exercise();
            }

            $exercise->setExerciseOwner($this->getUser());
            $exercise->setExerciseName($data[ExerciseConstantClass::CST_EXERCISE_NAME]);
            $exercise->setExerciseSubtitle($data[ExerciseConstantClass::CST_EXERCISE_SUBTITLE]);
            $exercise->setExerciseDescription($data[ExerciseConstantClass::CST_EXERCISE_DESCRIPTION]);
            $exercise->setExerciseMessageHeader($data[ExerciseConstantClass::CST_EXERCISE_MESSAGE_HEADER]);
            $exercise->setExerciseMessageFooter($data[ExerciseConstantClass::CST_EXERCISE_MESSAGE_FOOTER]);
            $exercise->setExerciseCanceled($data[ExerciseConstantClass::CST_EXERCISE_CANCELED]);
            $exercise->setExerciseStartDate(new DateTime($data[ExerciseConstantClass::CST_EXERCISE_START_DATE]));
            $exercise->setExerciseEndDate(new DateTime($data[ExerciseConstantClass::CST_EXERCISE_END_DATE]));
            $exercise->setExerciseMailExpediteur($data[ExerciseConstantClass::CST_EXERCISE_MAIL_EXPEDITEUR]);
            if ($data[ExerciseConstantClass::CST_EXERCISE_IMAGE] !== null) {
                $file = $em->getRepository('App:File')->findOneBy(array('file_name' => $data[ExerciseConstantClass::CST_EXERCISE_IMAGE]));
                if ($file) {
                    $exercise->setExerciseImage($file);
                }
            }
            if ($data[ExerciseConstantClass::CST_EXERCISE_ANIMATION_GROUP] !== null) {
                $animationGroup = $em->getRepository('App:Group')->findOneBy(array('group_name' => $data[ExerciseConstantClass::CST_EXERCISE_ANIMATION_GROUP]));
                if ($animationGroup) {
                    $exercise->setExerciseAnimationGroup($animationGroup);
                }
            }
            $em->persist($exercise);
            $em->flush($exercise);
            return $this->returnSuccess($exercise);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour de l\'exercice');
        }
    }

    /**
     * Return Success
     * @param type $object
     * @return stdClass
     */
    private function returnSuccess($object = null)
    {
        $returnObject = new stdClass();
        $returnObject->success = true;
        $returnObject->return = $object;
        return $returnObject;
    }

    /**
     * Return Error Message
     * @param DBALException $ex
     * @return stdClass
     */
    private function returnException(DBALException $ex, $errorMessage = null)
    {
        $returnObject = new stdClass();
        $returnObject->success = false;
        if ($errorMessage !== null) {
            $returnObject->errorMessage = $errorMessage;
            $returnObject->errorDetailMessage = $ex->getMessage();
        } else {
            $returnObject->errorMessage = $ex->getMessage();
            $returnObject->errorDetailMessage = $ex->getMessage();
        }
        return $returnObject;
    }

    private function returnImportError($errorMessage, $errorDetailMessage = null)
    {
        return array('success' => false, 'errorMessage' => $errorMessage, 'errorDetailMessage' => $errorDetailMessage);
    }

    /**
     * Create Or Update Audience, sub Audience and User
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateAudienceSheet(&$em, $datas, $exercise, $forceCreate = false)
    {
        foreach ($datas as $data) {
            $result = $this->createOrUpdateAudience($em, $data, $exercise, $forceCreate);
            if ($result->success) {
                $audience = $result->return;
            } else {
                return $this->returnErrorMessage($result->errorMessage, $result->errorDetailMessage);
            }

            if ($data[ExerciseConstantClass::CST_SUBAUDIENCE_NAME] !== null) {
                $result = $this->createOrUpdateSubAudience($em, $data, $audience, $forceCreate);
                if ($result->success) {
                    $subAudience = $result->return;
                } else {
                    return $this->returnErrorMessage($return->errorMessage, $return->errorDetailMessage);
                }
                if ($data[ExerciseConstantClass::CST_USER_LOGIN] !== null) {
                    $result = $this->createOrUpdateUser($em, $data, $subAudience, $forceCreate);
                    if ($result->success) {
                        $user = $result->return;
                    } else {
                        return $this->returnErrorMessage($result->errorMessage, $result->errorDetailMessage);
                    }
                }
            }
        }
        return $this->returnSuccess();
    }

    /**
     *
     * @param type $em
     * @param type $data
     * @param type $exercise
     * @return Audience
     */
    private function createOrUpdateAudience(&$em, $data, $exercise, $forceCreate = false)
    {
        try {
            $audience = $em->getRepository('App:Audience')->findOneBy(array('audience_exercise' => $exercise, 'audience_name' => $data[ExerciseConstantClass::CST_AUDIENCE_NAME]));
            if (!$audience || $forceCreate) {
                $audience = new Audience();
            }
            $audience->setAudienceName($data[ExerciseConstantClass::CST_AUDIENCE_NAME]);
            $audience->setAudienceEnabled($data[ExerciseConstantClass::CST_AUDIENCE_ENABLED]);
            $audience->setAudienceExercise($exercise);
            $em->persist($audience);
            $em->flush($audience);
            return $this->returnSuccess($audience);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des audiences');
        }
    }

    private function returnErrorMessage($errorMessage, $errorDetailMessage = null)
    {
        $returnObject = new stdClass();
        $returnObject->success = false;
        $returnObject->errorMessage = $errorMessage;
        $returnObject->errorDetailMessage = $errorDetailMessage;
        return $returnObject;
    }

    /**
     *
     * @param type $em
     * @param type $data
     * @param type $audience
     * @return Subaudience
     */
    private function createOrUpdateSubAudience(&$em, $data, $audience, $forceCreate = false)
    {
        try {
            $subAudience = $em->getRepository('App:Subaudience')->findOneBy(array('subaudience_audience' => $audience, 'subaudience_name' => $data[ExerciseConstantClass::CST_SUBAUDIENCE_NAME]));
            if (!$subAudience || $forceCreate) {
                $subAudience = new Subaudience();
            }
            $subAudience->setSubaudienceAudience($audience);
            $subAudience->setSubaudienceName($data[ExerciseConstantClass::CST_SUBAUDIENCE_NAME]);
            $subAudience->setSubaudienceEnabled($data[ExerciseConstantClass::CST_SUBAUDIENCE_ENABLED]);
            $em->persist($subAudience);
            $em->flush($subAudience);
            return $this->returnSuccess($subAudience);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des sous-audiences');
        }
    }

    /**
     *
     * @param type $em
     * @param type $data
     * @param Subaudience $subAudience
     */
    private function createOrUpdateUser(&$em, $data, $subAudience = null, $forceCreate = false)
    {
        try {
            $user = $em->getRepository('App:User')->findOneBy(array('user_login' => $data[ExerciseConstantClass::CST_USER_LOGIN]));
            if (!$user) {
                $user = new User();
            }
            $result = $this->createOrUpdateOrganization($em, $data, $forceCreate);
            if ($result->success) {
                $organization = $result->return;
            } else {
                return $this->returnErrorMessage($result->errorMessage, $result->errorDetailMessage);
            }
            $user->setUserOrganization($organization);
            $user->setUserLogin($data[ExerciseConstantClass::CST_USER_LOGIN]);
            $user->setUserPassword($data[ExerciseConstantClass::CST_USER_PASSWORD]);
            $user->setUserFirstname($data[ExerciseConstantClass::CST_USER_FIRSTNAME]);
            $user->setUserLastname($data[ExerciseConstantClass::CST_USER_LASTNAME]);
            $user->setUserEmail($data[ExerciseConstantClass::CST_USER_EMAIL]);
            $user->setUserEmail2($data[ExerciseConstantClass::CST_USER_EMAIL2]);
            $user->setUserPhone($data[ExerciseConstantClass::CST_USER_PHONE]);
            $user->setUserPhone2($data[ExerciseConstantClass::CST_USER_PHONE2]);
            $user->setUserPhone3($data[ExerciseConstantClass::CST_USER_PHONE3]);
            $user->setUserAdmin($data[ExerciseConstantClass::CST_USER_ADMIN]);
            $user->setUserStatus($data[ExerciseConstantClass::CST_USER_STATUS]);
            $user->setUserLang('auto');
            $em->persist($user);
            $em->flush($user);
            if ($subAudience instanceof Subaudience) {
                $subAudience->addSubaudienceUser($user);
                $em->persist($subAudience);
                $em->flush($subAudience);
            }
            return $this->returnSuccess($user);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des utilisateurs');
        }
    }

    /**
     *
     * @param type $em
     * @param type $data
     * @return Organization
     */
    private function createOrUpdateOrganization(&$em, $data, $forceCreate = false)
    {
        try {
            $organization = $em->getRepository('App:Organization')->findOneBy(array('organization_name' => $data[ExerciseConstantClass::CST_USER_ORGANIZATION]));
            if (!$organization || $forceCreate) {
                $organization = new Organization();
            }
            $organization->setOrganizationName($data[ExerciseConstantClass::CST_USER_ORGANIZATION]);
            $em->persist($organization);
            $em->flush($organization);
            return $this->returnSuccess($organization);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des organisations');
        }
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateObjectiveSheet(&$em, $datas, $exercise, $forceCreate = false)
    {
        foreach ($datas as $data) {
            $result = $this->createOrUpdateObjective($em, $data, $exercise, $forceCreate);
            if ($result->success) {
                $objective = $result->return;
            } else {
                return $this->returnErrorMessage($result->errorMessage, $result->errorDetailMessage);
            }

            if ($data[ExerciseConstantClass::CST_SUBOBJECTIVE_TITLE] !== null) {
                $result = $this->createOrUpdateSubObjective($em, $data, $objective, $forceCreate);
                if ($result->success) {
                    $subAudience = $result->return;
                } else {
                    return $this->returnErrorMessage($result->errorMessage, $result->errorDetailMessage);
                }
            }
        }
        return $this->returnSuccess();
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateObjective(&$em, $data, $exercise, $forceCreate = false)
    {
        try {
            $objective = $em->getRepository('App:Objective')->findOneBy(array('objective_title' => $data[ExerciseConstantClass::CST_OBJECTIVE_TITLE], 'objective_exercise' => $exercise));
            if (!$objective || $forceCreate) {
                $objective = new Objective();
            }
            $objective->setObjectiveTitle($data[ExerciseConstantClass::CST_OBJECTIVE_TITLE]);
            $objective->setObjectiveDescription($data[ExerciseConstantClass::CST_OBJECTIVE_DESCRIPTION]);
            $objective->setObjectivePriority($data[ExerciseConstantClass::CST_OBJECTIVE_PRIORITY]);
            $objective->setObjectiveExercise($exercise);
            $em->persist($objective);
            $em->flush($objective);
            return $this->returnSuccess($objective);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des objectifs');
        }
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $objective
     */
    private function createOrUpdateSubObjective(&$em, $data, $objective, $forceCreate = false)
    {
        try {
            $subObjective = $em->getRepository('App:Subobjective')->findOneBy(array('subobjective_title' => $data[ExerciseConstantClass::CST_SUBOBJECTIVE_TITLE], 'subobjective_objective' => $objective));
            if (!$subObjective || $forceCreate) {
                $subObjective = new Subobjective();
            }
            $subObjective->setSubobjectiveTitle($data[ExerciseConstantClass::CST_SUBOBJECTIVE_TITLE]);
            $subObjective->setSubobjectiveDescription($data[ExerciseConstantClass::CST_SUBOBJECTIVE_DESCRIPTION]);
            $subObjective->setSubobjectivePriority($data[ExerciseConstantClass::CST_SUBOBJECTIVE_PRIORITY]);
            $subObjective->setSubobjectiveObjective($objective);
            $em->persist($subObjective);
            $em->flush($subObjective);
            return $this->returnSuccess($subObjective);
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des sous objectifs');
        }
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateEventSheet(&$em, $datas, $exercise, $forceCreate = false)
    {
        try {
            foreach ($datas as $data) {
                $event = $em->getRepository('App:Event')->findOneBy(array('event_title' => $data[ExerciseConstantClass::CST_EVENT_TITLE], 'event_exercise' => $exercise));
                if (!$event || $forceCreate) {
                    $event = new Event();
                    $event->setEventTitle($data[ExerciseConstantClass::CST_EVENT_TITLE]);
                    $event->setEventDescription($data[ExerciseConstantClass::CST_EVENT_DESCRIPTION]);
                    $event->setEventOrder($data[ExerciseConstantClass::CST_EVENT_ORDER]);
                    $event->setEventExercise($exercise);
                    $em->persist($event);
                    $em->flush($event);
                }
            }
            return $this->returnSuccess();
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des scénarios');
        }
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateIncidentSheet(&$em, $datas, $exercise, $forceCreate = false)
    {
        try {
            foreach ($datas as $data) {
                //recherche de l'event
                $event = $em->getRepository('App:Event')->findOneBy(array('event_exercise' => $exercise, 'event_title' => $data[ExerciseConstantClass::CST_INCIDENT_EVENT]));
                $incidentType = $em->getRepository('App:IncidentType')->findOneBy(array('type_name' => $data[ExerciseConstantClass::CST_INCIDENT_TYPE]));
                if ($event && $incidentType) {
                    $incident = $em->getRepository('App:Incident')->findOneBy(array('incident_event' => $event, 'incident_title' => $data[ExerciseConstantClass::CST_INCIDENT_TITLE]));
                    if (!$incident || $forceCreate) {
                        $incident = new Incident();
                    }
                    $incident->setIncidentType($incidentType);
                    $incident->setIncidentEvent($event);
                    $incident->setIncidentTitle($data[ExerciseConstantClass::CST_INCIDENT_TITLE]);
                    $incident->setIncidentStory($data[ExerciseConstantClass::CST_INCIDENT_STORY]);
                    $incident->setIncidentWeight($data[ExerciseConstantClass::CST_INCIDENT_WEIGHT]);
                    $incident->setIncidentOrder($data[ExerciseConstantClass::CST_INCIDENT_ORDER]);
                    $em->persist($incident);
                    $em->flush($incident);

                    $incidentOutcome = $em->getRepository('App:Outcome')->findOneBy(array('outcome_incident' => $incident));
                    if (!$incidentOutcome) {
                        $incidentOutcome = new Outcome();
                    }
                    $incidentOutcome->setOutcomeComment($data[ExerciseConstantClass::CST_INCIDENT_OUTCOME_COMMENT]);
                    $incidentOutcome->setOutComeResult($data[ExerciseConstantClass::CST_INCIDENT_OUTCOME_RESULT]);
                    $incidentOutcome->setOutcomeIncident($incident);
                    $em->persist($incidentOutcome);
                    $em->flush($incidentOutcome);
                }
            }
            return $this->returnSuccess();
        } catch (DBALException $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des incidents');
        }
    }

    /**
     *
     * @param type $em
     * @param type $datas
     * @param type $exercise
     */
    private function createOrUpdateInjectSheet(&$em, $datas, $exercise, $forceCreate = false)
    {
        $repositoryIncident = $em->getRepository('App:Incident');
        $repositoryUser = $em->getRepository('App:User');
        $repositoryInject = $em->getRepository('App:Inject');
        $repositoryInjectStatus = $em->getRepository('App:InjectStatus');
        $repositoryAudience = $em->getRepository('App:Audience');
        $repositorySubAudience = $em->getRepository('App:Subaudience');

        foreach ($datas as $data) {
            $incident = $repositoryIncident->findOneBy(['incident_title' => $data[ExerciseConstantClass::CST_INJECT_INCIDENT_ID]]);
            $user = $repositoryUser->findOneBy(['user_email' => $data[ExerciseConstantClass::CST_INJECT_USER]]);

            if ($incident && $user) {
                // Create/update inject
                try {
                    $inject = $repositoryInject->findOneBy([
                        'inject_incident' => $incident,
                        'inject_user' => $user,
                        'inject_title' => $data[ExerciseConstantClass::CST_INJECT_TITLE]
                    ]);
                    if (!$inject || $forceCreate) {
                        $inject = new Inject();
                    }
                    $inject->setInjectIncident($incident);
                    $inject->setInjectUser($user);
                    $inject->setInjectTitle($data[ExerciseConstantClass::CST_INJECT_TITLE]);
                    $inject->setInjectDescription($data[ExerciseConstantClass::CST_INJECT_DESCRIPTION]);
                    $inject->setInjectContent($data[ExerciseConstantClass::CST_INJECT_CONTENT]);
                    $inject->setInjectDate(new DateTime($data[ExerciseConstantClass::CST_INJECT_DATE]));
                    $inject->setInjectType($data[ExerciseConstantClass::CST_INJECT_TYPE]);
                    $inject->setInjectAllAudiences($data[ExerciseConstantClass::CST_INJECT_ALL_AUDIENCES]);
                    $inject->setInjectEnabled($data[ExerciseConstantClass::CST_INJECT_ENABLED]);
                    $em->persist($inject);
                    $em->flush($inject);
                } catch (DBALException $ex) {
                    return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des injections');
                }

                // Create/update inject-status
                try {
                    $injectStatus = $repositoryInjectStatus->findOneBy(['status_inject' => $inject]);
                    if (!$injectStatus) {
                        $injectStatus = new InjectStatus();
                    }
                    $injectStatus->setStatusName($data[ExerciseConstantClass::CST_INJECT_STATUS_NAME]);
                    $injectStatus->setStatusMessage($data[ExerciseConstantClass::CST_INJECT_STATUS_MESSAGE]);
                    $injectStatus->setStatusExecution($data[ExerciseConstantClass::CST_INJECT_STATUS_EXECUTION]);
                    $injectStatus->setStatusDate(new DateTime($data[ExerciseConstantClass::CST_INJECT_STATUS_DATE]));
                    $injectStatus->setStatusInject($inject);
                    $em->persist($injectStatus);
                    $em->flush($injectStatus);
                } catch (DBALException $ex) {
                    return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des statuts des injections');
                }

                $injectAudiences = [];
                $injectSubAudiences = [];

                $injectAudiencesRawData = $data[ExerciseConstantClass::CST_INJECT_AUDIENCES];
                if ($injectAudiencesRawData) {
                    $injectAudiences = json_decode($injectAudiencesRawData, true);
                    if (!is_array($injectAudiences)) {
                        $injectAudiences = [$injectAudiencesRawData];
                    }
                }

                $injectSubAudiencesRawData = $data[ExerciseConstantClass::CST_INJECT_SUBAUDIENCES];
                if ($injectSubAudiencesRawData) {
                    $injectSubAudiences = json_decode($injectSubAudiencesRawData, true);
                    if (!is_array($injectSubAudiences)) {
                        $injectSubAudiences = [$injectSubAudiencesRawData];
                    }
                }

                // Audiences
                foreach ($injectAudiences as $injectAudience) {
                    try {
                        $audience = $repositoryAudience->findOneBy([
                            'audience_exercise' => $exercise,
                            'audience_name' => $injectAudience
                        ]);
                        if ($audience) {
                            $inject->addInjectAudience($audience);
                            $em->persist($inject);
                            $em->flush($inject);
                        }
                    } catch (DBALException $ex) {
                        return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des liens injection - audience');
                    }
                }

                // Subaudiences
                foreach ($injectSubAudiences as $injectSubAudience) {
                    try {
                        $subAudience = $repositorySubAudience->findOneBy([
                            'subaudience_name' => $injectSubAudience
                        ]);
                        if ($subAudience) {
                            $inject->addInjectSubaudience($subAudience);
                            $em->persist($inject);
                            $em->flush($inject);
                        }
                    } catch (DBALException $ex) {
                        return $this->returnException($ex, 'Une erreur est survenue lors de la mise à jour des liens injection - sous-audience');
                    }
                }

            }
        }

        return $this->returnSuccess();
    }

    private function returnImportSuccess($exercise = null)
    {
        if ($exercise instanceof Exercise) {
            return array('success' => true, 'exercise_id' => $exercise->getExerciseId());
        } else {
            return array('success' => true);
        }
    }
}
