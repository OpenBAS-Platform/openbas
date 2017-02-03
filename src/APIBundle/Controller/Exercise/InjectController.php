<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\InjectType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;
use PHPExcel;

class InjectController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List injects of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/exercises/{exercise_id}/injects")
     */
    public function getExercisesInjectsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber();
            $inject->setInjectExercise($exercise->getExerciseId());
        }
        return $injects;
    }

    /**
     * @ApiDoc(
     *    description="List injects of an exercise (xls)"
     * )
     *
     * @Rest\Get("/exercises/{exercise_id}/injects.xlsx")
     */
    public function getExercisesInjectsXlsxAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        $xlsInjects = $this->get('phpexcel')->createPHPExcelObject();
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

        $writer = $this->get('phpexcel')->createWriter($xlsInjects, 'Excel2007');
        $response = $this->get('phpexcel')->createStreamedResponse($writer);
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

    /**
     * @ApiDoc(
     *    description="Shift injects of an exercise",
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Put("/exercises/{exercise_id}/injects")
     */
    public function shiftExercisesInjectsAction(Request $request)
    {
        if ($request->request->get('old_date') === null || $request->request->get('new_date') === null) {
            return \FOS\RestBundle\View\View::create(['message' => 'Missing the dates'], Response::HTTP_BAD_REQUEST);
        }

        $old_date = new \DateTime($request->request->get('old_date'));
        $new_date = new \DateTime($request->request->get('new_date'));
        $interval = $old_date->diff($new_date);

        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        /* @var $injects Inject[] */

        foreach ($events as $event) {
            $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $incidentInjects = $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]);
                foreach ($incidentInjects as &$incidentInject) {
                    $incidentInject->setInjectEvent($event->getEventId());
                }
                $injects = array_merge($injects, $incidentInjects);
            }
        }

        foreach ($injects as &$inject) {
            $newDate = new \DateTime($inject->getInjectDate()->add($interval)->format('Y-m-d H:i:s'));
            $inject->setInjectDate($newDate);
            $em->persist($inject);
            $em->flush();
        }

        foreach ($injects as &$inject) {
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->computeUsersNumber();
            $inject->sanitizeUser();
        }

        return $injects;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
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
}