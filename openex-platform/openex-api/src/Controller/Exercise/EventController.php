<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use App\Entity\InjectStatus;
use App\Entity\Outcome;
use App\Form\Type\EventType;
use DateTime;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PHPExcel_IOFactory;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EventController extends BaseController
{

    /**
     * @OA\Property(
     *    description="List events of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/api/exercises/{exercise_id}/events")
     */
    public function getExercisesEventsAction(Request $request)
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
        foreach ($events as &$event) {
            $event->setUserCanUpdate($this->hasGranted(self::UPDATE, $event));
            $event->setUserCanDelete($this->hasGranted(self::DELETE, $event));
        }

        return $events;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Read an event"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/api/exercises/{exercise_id}/events/{event_id}")
     */
    public function getExerciseEventAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        /* @var $event Event */
        $event = $em->getRepository('App:Event')->find($request->get('event_id'));
        $event->setUserCanUpdate($this->hasGranted(self::UPDATE, $event));
        $event->setUserCanDelete($this->hasGranted(self::DELETE, $event));


        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }
        return $event;
    }

    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Create an event")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"event"})
     * @Rest\Post("/api/exercises/{exercise_id}/events")
     */
    public function postExercisesEventsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = new Event();
        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $file = $em->getRepository('App:File')->findOneBy(['file_name' => 'Event default']);
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
     * @OA\Property(
     *    description="Delete an event"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"event"})
     * @Rest\Delete("/api/exercises/{exercise_id}/events/{event_id}")
     */
    public function removeExercisesEventAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('App:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $em->remove($event);
        $em->flush();
    }

    /**
     * @OA\Property(description="Update an event")
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Put("/api/exercises/{exercise_id}/events/{event_id}")
     */
    public function updateExercisesEventAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('App:Event')->find($request->get('event_id'));
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
            return $em->getRepository('App:Event')->find($request->get('event_id'));
        } else {
            return $form;
        }
    }

    /**
     * @OA\Property(
     *    description="Import incidents and injects"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Post("/api/exercises/{exercise_id}/events/{event_id}/import")
     */
    public function importExerciseEventAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $event = $em->getRepository('App:Event')->find($request->get('event_id'));
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

        $incidentType = $em->getRepository('App:IncidentType')->findOneBy(['type_name' => 'STRATEGIC']);
        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        $objReader = PHPExcel_IOFactory::createReader('Excel2007');
        $objPHPExcel = $objReader->load($this->get('kernel')->getRootDir() . '/files/' . $filePath);

        foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
            $incident = new Incident();
            $incident->setIncidentExercise($exercise);
            $incident->setIncidentEvent($event);
            $incident->setIncidentOrder(0);
            $incident->setIncidentType($incidentType);
            $incident->setIncidentTitle($worksheet->getTitle());
            $incident->setIncidentStory('Imported');
            $incident->setIncidentWeight(1);
            $em->persist($incident);

            $outcome = new Outcome();
            $outcome->setOutcomeIncident($incident);
            $outcome->setOutComeResult(0);
            $em->persist($outcome);

            foreach ($worksheet->getRowIterator() as $row) {
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);

                $inject = new Inject();
                $inject->setInjectIncident($incident);
                $inject->setInjectEnabled(true);
                $inject->setInjectUser($connectedUser);
                $inject->setInjectType('openex_manual');

                $i = 0;
                foreach ($cellIterator as $cell) {
                    switch ($i) {
                        case 0:
                            $inject->setInjectTitle($cell->getValue());
                            break;
                        case 1:
                            $inject->setInjectDescription($cell->getValue());
                            break;
                        case 3:
                            $timestamp = strtotime($cell->getValue());
                            $date = new DateTime();
                            $date->setTimestamp($timestamp);
                            $inject->setInjectDate($date);
                            break;
                        case 4:
                            if (strlen($cell->getValue()) > 0) {
                                $inject->setInjectType($cell->getValue());
                            }
                            break;
                        case 5:
                            if (strlen($cell->getValue()) > 0) {
                                $inject->setInjectContent($cell->getValue());
                            }
                            break;
                    }
                    $i++;
                }
                $em->persist($inject);
                $em->flush();

                $status = new InjectStatus();
                $status->setStatusInject($inject);
                $em->persist($status);
            }
        }

        return $event;
    }
}
