<?php

namespace App\Controller\Exercise\Event;

use App\Controller\Base\BaseController;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Outcome;
use App\Form\Type\IncidentType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class IncidentController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List incidents of an event"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/api/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function getExercisesEventsIncidentsAction(Request $request)
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

        $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);

        foreach ($incidents as &$incident) {
            $incident->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $incident->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }

        return $incidents;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Read an incident"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function getExercisesEventsIncidentAction(Request $request)
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

        $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $incident->setIncidentExercise($exercise->getExerciseId());
        $incident->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
        $incident->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        return $incident;
    }

    private function incidentNotFound()
    {
        return View::create(['message' => 'Incident not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Create an incident")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"incident"})
     * @Rest\Post("/api/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function postExercisesEventsIncidentsAction(Request $request)
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

        $incident = new Incident();
        $form = $this->createForm(IncidentType::class, $incident);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $incident->setIncidentEvent($event);
            $incident->setIncidentOrder(0);
            $em->persist($incident);
            $em->flush();

            $outcome = new Outcome();
            $outcome->setOutcomeIncident($incident);
            $outcome->setOutComeResult(0);
            $em->persist($outcome);
            $em->flush();

            return $incident;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Property(
     *    description="Delete an incident"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"incident"})
     * @Rest\Delete("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function removeExercisesEventsIncidentAction(Request $request)
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

        $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $em->remove($incident);
        $em->flush();
    }

    /**
     * @OA\Property(description="Update an incident")
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Put("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function updateExercisesEventsIncidentAction(Request $request)
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

        $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $form = $this->createForm(IncidentType::class, $incident);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($incident);
            $em->flush();
            $em->clear();
            $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
            return $incident;
        } else {
            return $form;
        }
    }
}
