<?php

namespace App\Controller\Exercise\Event;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Exercise;
use App\Form\Type\IncidentType;
use App\Entity\Event;
use App\Entity\Incident;
use App\Entity\Outcome;

class IncidentController extends BaseController
{
    /**
     * @SWG\Property(
     *    description="List incidents of an event"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function getExercisesEventsIncidentsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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

    /**
     * @SWG\Property(
     *    description="Read an incident"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function getExercisesEventsIncidentAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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

    /**
     * @SWG\Property(description="Create an incident")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"incident"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function postExercisesEventsIncidentsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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
     * @SWG\Property(
     *    description="Delete an incident"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"incident"})
     * @Rest\Delete("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function removeExercisesEventsIncidentAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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
     * @SWG\Property(description="Update an incident")
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function updateExercisesEventsIncidentAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    private function incidentNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Incident not found'], Response::HTTP_NOT_FOUND);
    }
}
