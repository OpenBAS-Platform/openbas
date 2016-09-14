<?php

namespace APIBundle\Controller\Exercise\Event;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\IncidentType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;

class IncidentController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List incidents"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function getExercisesEventsIncidentsAction(Request $request)
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);

        return $incidents;
    }

    /**
     * @ApiDoc(
     *    description="Create an incident",
     *    input={"class"=IncidentType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"incident"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/incidents")
     */
    public function postExercisesEventsIncidentsAction(Request $request)
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $incident = new Incident();
        $incident->setIncidentEvent($event);
        $form = $this->createForm(IncidentType::class, $incident);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em->persist($incident);
            $em->flush();
            return $incident;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an incident"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"incident"})
     * @Rest\Delete("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function removeExercisesEventsIncidentAction(Request $request)
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident)) {
            return $this->incidentNotFound();
        }

        $em->remove($incident);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Replace an incident",
     *   input={"class"=IncidentType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function updateExercisesEventsIncidentAction(Request $request)
    {
        return $this->updateIncident($request, true);
    }

    /**
     * @ApiDoc(
     *    description="Update an incident",
     *    input={"class"=IncidentType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Patch("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}")
     */
    public function patchExercisesEventsIncidentAction(Request $request)
    {
        return $this->updateIncident($request, false);
    }

    private function updateIncident(Request $request, $clearMissing)
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident)) {
            return $this->incidentNotFound();
        }

        $form = $this->createForm(IncidentType::class, $incident);
        $form->submit($request->request->all(), $clearMissing);

        if ($form->isValid()) {
            $em->persist($incident);
            $em->flush();
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