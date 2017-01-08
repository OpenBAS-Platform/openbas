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

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber();
            $inject->setInjectExercise($exercise->getExerciseId());
        }

        $xlsInjects = $this->get('phpexcel')->createPHPExcelObject();
        /* @var $xlsInjects PHPExcel */

        $xlsInjects->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("Injects list")
            ->setSubject("Injects list")
            ->setDescription("The injects of an exercise");

        $xlsInjects->setActiveSheetIndex(0);
        $xlsInjects->getActiveSheet()->setTitle('Injects');

        $xlsInjects->getActiveSheet()->setCellValue('A1', 'Title');
        $xlsInjects->getActiveSheet()->setCellValue('A2', 'Description');
        $xlsInjects->getActiveSheet()->setCellValue('A3', 'Author');
        $xlsInjects->getActiveSheet()->setCellValue('A4', 'Content');

        foreach ($injects as $inject) {
            $xlsInjects->getActiveSheet()->setCellValue('B1', $inject->getInjectTitle());
            $xlsInjects->getActiveSheet()->setCellValue('B2', $inject->getInjectDescription());
            $xlsInjects->getActiveSheet()->setCellValue('B3', $inject->getInjectUser());
            $xlsInjects->getActiveSheet()->setCellValue('B4', $inject->getInjectContent());
        }

        $writer = $this->get('phpexcel')->createWriter($xlsInjects, 'Excel2007');
        $response = $this->get('phpexcel')->createStreamedResponse($writer);
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'Injects.xlsx'
        );

        $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');
        $response->headers->set('Content-Disposition', $dispositionHeader);

        return $response;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}