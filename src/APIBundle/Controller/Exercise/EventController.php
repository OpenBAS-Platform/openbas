<?php

namespace APIBundle\Controller\Exercise;

use APIBundle\Entity\InjectStatus;
use APIBundle\Entity\Outcome;
use FOS\RestBundle\View\View;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\EventType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;
use PHPExcel_IOFactory;

class EventController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List events of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/exercises/{exercise_id}/events")
     */
    public function getExercisesEventsAction(Request $request)
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
        return $events;
    }

    /**
     * @ApiDoc(
     *    description="Read an event"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}")
     */
    public function getExerciseEventAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }
        return $event;
    }

    /**
     * @ApiDoc(
     *    description="Create an event",
     *    input={"class"=EventType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"event"})
     * @Rest\Post("/exercises/{exercise_id}/events")
     */
    public function postExercisesEventsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = new Event();
        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $file = $em->getRepository('APIBundle:File')->findOneBy(['file_name' => 'Event default']);
            $event->setEventExercise($exercise);
            $event->setEventImage($file);
            $event->setEventOrder(0);
            $em->persist($event);
            $em->flush();
            return $event;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an event"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"event"})
     * @Rest\Delete("/exercises/{exercise_id}/events/{event_id}")
     */
    public function removeExercisesEventAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $em->remove($event);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update an event",
     *    input={"class"=EventType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}")
     */
    public function updateExercisesEventAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($event);
            $em->flush();
            $em->clear();
            return $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Import incidents and injects"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/import")
     */
    public function importExerciseEventAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $filePath = '';
        if (count($_FILES) == 0) {
            return View::create(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        } else {
            foreach ($_FILES as $f) {
                $uploadedFile = new UploadedFile($f['tmp_name'], $f['name']);
                $filePath = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $uploadedFile->move($this->get('kernel')->getRootDir() . '/files', $filePath);
                break;
            }
        }

        $incidentType = $em->getRepository('APIBundle:IncidentType')->findBy(['type_name' => 'STRATEGIC']);
        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        $objReader = PHPExcel_IOFactory::createReader('Excel2007');
        $objPHPExcel = $objReader->load($this->get('kernel')->getRootDir() . '/files' . $filePath);

        $i = 0;
        foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
            $incident = new Incident();
            $incident->setIncidentExercise($exercise);
            $incident->setIncidentEvent($event);
            $incident->setIncidentOrder($i);
            $incident->setIncidentType($incidentType);
            $incident->setIncidentTitle($worksheet->getTitle());
            $em->persist($incident);

            $outcome = new Outcome();
            $outcome->setOutcomeIncident($incident);
            $outcome->setOutComeResult(0);
            $em->persist($outcome);
            $em->flush();

            $j = 0;
            foreach ($worksheet->getRowIterator() as $row) {
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);

                $inject = new Inject();
                $inject->setInjectIncident($incident);
                $inject->setInjectEnabled(true);
                $inject->setInjectUser($connectedUser);
                $em->persist($inject);
                $em->flush();

                $status = new InjectStatus();
                $status->setStatusInject($inject);
                $em->persist($status);
                $em->flush();

                foreach ($cellIterator as $cell) {

                }

                $j++;
            }

            $i++;
        }
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }
}