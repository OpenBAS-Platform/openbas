<?php

namespace APIBundle\Controller\Exercise\Event\Incident;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\InjectType;
use APIBundle\Entity\InjectStatus;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;

class InjectController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List injects of an incident"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects")
     */
    public function getExercisesEventsIncidentsInjectsAction(Request $request)
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

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $injects = $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]);

        foreach( $injects as &$inject ) {
            $inject->sanitizeUser();
            $inject->setInjectExercise($exercise->getExerciseId());
        }

        return $injects;
    }

    /**
     * @ApiDoc(
     *    description="Create an inject",
     *    input={"class"=InjectType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"inject"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects")
     */
    public function postExercisesEventsIncidentsInjectsAction(Request $request)
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

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $inject = new Inject();
        $form = $this->createForm(InjectType::class, $inject);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $connectedUser = $this->get('security.token_storage')->getToken()->getUser();
            $inject->setInjectIncident($incident);
            $inject->setInjectAutomatic(true);
            $inject->setInjectUser($connectedUser);
            $em->persist($inject);
            $em->flush();

            $status = new InjectStatus();
            $status->setStatusName('PENDING');
            $status->setStatusDate(new \DateTime());
            $status->setStatusInject($inject);
            $em->persist($status);
            $em->flush();

            $inject->sanitizeUser();
            return $inject;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an inject"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"inject"})
     * @Rest\Delete("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}")
     */
    public function removeExercisesEventsIncidentsInjectAction(Request $request)
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

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject)) {
            return $this->injectNotFound();
        }

        $em->remove($inject);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update an inject",
     *    input={"class"=InjectType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}")
     */
    public function updateExercisesEventsIncidentsInjectAction(Request $request)
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

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident)) {
            return $this->incidentNotFound();
        }

        $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->injectNotFound();
        }

        $form = $this->createForm(InjectType::class, $inject);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($inject);
            $em->flush();
            $em->clear();
            $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
            $inject->sanitizeUser();
            return $inject;
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

    private function injectNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }
}