<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use DateTime;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PHPExcel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InjectController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List injects of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/api/exercises/{exercise_id}/injects")
     */
    public function getExercisesInjectsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                    $incidentInject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
                    $incidentInject->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectExercise($exercise->getExerciseId());
        }
        return $injects;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="List injects of an exercise (xls)"
     * )
     *
     * @Rest\Get("/api/exercises/{exercise_id}/injects.xlsx")
     */
    public function getExercisesInjectsXlsxAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        $xlsInjects = new Spreadsheet();
        /* @var $xlsInjects PHPExcel */

        $xlsInjects->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[" . $this->str_to_noaccent($exercise->getExerciseName()) . "] Injects list");

        $sheet = $xlsInjects->getActiveSheet();
        $sheet->setTitle('Injects');

        $sheet->setCellValue('A1', 'Title');
        $sheet->setCellValue('B1', 'Description');
        $sheet->setCellValue('C1', 'Author');
        $sheet->setCellValue('D1', 'Date');
        $sheet->setCellValue('E1', 'Type');
        $sheet->setCellValue('F1', 'Content');

        $i = 2;
        foreach ($injects as $inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber();
            $inject->setInjectExercise($exercise->getExerciseId());

            $sheet->setCellValue('A' . $i, $inject->getInjectTitle());
            $sheet->setCellValue('B' . $i, $inject->getInjectDescription());
            $sheet->setCellValue('C' . $i, $inject->getInjectUser());
            $sheet->setCellValue('D' . $i, $inject->getInjectDate());
            $sheet->setCellValue('E' . $i, $inject->getInjectType());
            $sheet->setCellValue('F' . $i, $inject->getInjectContent());
            $i++;
        }

        $writer = new Xlsx($xlsInjects);
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "[" . $this->str_to_noaccent($exercise->getExerciseName()) . "] Injects list.xlsx"
        );

        $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');
        $response->headers->set('Content-Disposition', $dispositionHeader);

        return $response;
    }

    private function str_to_noaccent($str)
    {
        $url = $str;
        $url = preg_replace('#Ç#', 'C', $url);
        $url = preg_replace('#ç#', 'c', $url);
        $url = preg_replace('#è|é|ê|ë#', 'e', $url);
        $url = preg_replace('#È|É|Ê|Ë#', 'E', $url);
        $url = preg_replace('#à|á|â|ã|ä|å#', 'a', $url);
        $url = preg_replace('#@|À|Á|Â|Ã|Ä|Å#', 'A', $url);
        $url = preg_replace('#ì|í|î|ï#', 'i', $url);
        $url = preg_replace('#Ì|Í|Î|Ï#', 'I', $url);
        $url = preg_replace('#ð|ò|ó|ô|õ|ö#', 'o', $url);
        $url = preg_replace('#Ò|Ó|Ô|Õ|Ö#', 'O', $url);
        $url = preg_replace('#ù|ú|û|ü#', 'u', $url);
        $url = preg_replace('#Ù|Ú|Û|Ü#', 'U', $url);
        $url = preg_replace('#ý|ÿ#', 'y', $url);
        $url = preg_replace('#Ý#', 'Y', $url);

        return ($url);
    }

    /**
     * @OA\Property(
     *    description="Shift injects of an exercise",
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Put("/api/exercises/{exercise_id}/injects")
     */
    public function shiftExercisesInjectsAction(Request $request)
    {
        if (!$request->request->get('shift_day') && !$request->request->get('shift_hour') && !$request->request->get('shift_minute')) {
            return View::create(['message' => 'Missing day/hour/minute value'], Response::HTTP_BAD_REQUEST);
        }

        /* Shift inject with interval */
        $old_date = new DateTime($request->request->get('old_date'));


        $value_days = intval($request->request->get('shift_day'));
        $value_hours = intval($request->request->get('shift_hour'));
        $value_minutes = intval($request->request->get('shift_minute'));

        $string_modify = '';
        if ($value_days) {
            $string_modify .= sprintf("%+d", $value_days) . 'days';
        }
        if ($value_hours) {
            $string_modify .= sprintf("%+d", $value_hours) . 'hours';
        }
        if ($value_minutes) {
            $string_modify .= sprintf("%+d", $value_minutes) . 'minutes';
        }

        $new_date_with_shift = new DateTime($request->request->get('old_date'));
        $new_date_with_shift->modify($string_modify);

        $interval = $old_date->diff($new_date_with_shift);

        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        /* New date for exercise */
        $newStartDateExercise = new DateTime($exercise->getExerciseStartDate()->add($interval)->format('Y-m-d H:i:s'));
        $newEndDateExercise = new DateTime($exercise->getExerciseEndDate()->add($interval)->format('Y-m-d H:i:s'));
        $exercise->setExerciseStartDate($newStartDateExercise);
        $exercise->setExerciseEndDate($newEndDateExercise);
        $em->persist($exercise);
        $em->flush();

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        /* @var $injects Inject[] */

        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        foreach ($injects as &$inject) {
            $newDate = new DateTime($inject->getInjectDate()->add($interval)->format('Y-m-d H:i:s'));
            $inject->setInjectDate($newDate);
            $em->persist($inject);
            $em->flush();
        }

        // Update exercise
        $exercise->computeExerciseStatus($injects);
        $exercise->computeStartEndDates($injects);
        $exercise->computeExerciseOwner();
        $em->persist($exercise);
        $em->flush();

        foreach ($injects as &$inject) {
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $inject->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
            $inject->computeUsersNumber();
            $inject->sanitizeUser();
        }

        return $injects;
    }
}
