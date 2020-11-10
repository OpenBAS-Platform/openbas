<?php

namespace App\Controller\Exercise\Event\Incident;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use App\Entity\InjectStatus;
use App\Form\Type\InjectType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List injects of an incident"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects")
     */
    public function getExercisesEventsIncidentsInjectsAction(Request $request)
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

        $injects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectEvent($event->getEventId());
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $inject->getUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }

        return $injects;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    private function incidentNotFound()
    {
        return View::create(['message' => 'Incident not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Create an inject")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"inject"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects")
     */
    public function postExercisesEventsIncidentsInjectsAction(Request $request)
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

        $inject = new Inject();
        $form = $this->createForm(InjectType::class, $inject);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $connectedUser = $this->get('security.token_storage')->getToken()->getUser();
            $inject->setInjectIncident($incident);
            $inject->setInjectEnabled(true);
            $inject->setInjectUser($connectedUser);
            $em->persist($inject);

            $this->updateExercise($exercise, $inject);

            $em->flush();

            $status = new InjectStatus();
            $status->setStatusInject($inject);
            $em->persist($status);
            $em->flush();

            $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
            /* @var $audiences Audience[] */

            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectStatus($status);
            $inject->setInjectEvent($event->getEventId());
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->setUserCanUpdate(true);
            $inject->setUserCanDelete(true);

            return $inject;
        } else {
            return $form;
        }
    }

    /**
     * Update exercise start and end dates
     *
     * @param Exercise $exercise
     * @param Inject $inject
     * @param String $removedInjectId
     **/
    private function updateExercise($exercise, $inject = null, $removedInjectId = null)
    {
        $em = $this->getDoctrine()->getManager();

        $injects = array();
        if ($inject) {
            $injects[] = $inject;
        }

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            foreach ($incidents as $incident) {
                $foundInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident, 'inject_enabled' => true]);
                foreach ($foundInjects as $inject) {
                    if (!$removedInjectId || $removedInjectId !== $inject->getInjectId()) {
                        $injects[] = $inject;
                    }
                }
            }
        }

        $exercise->computeExerciseStatus($injects);
        $exercise->computeStartEndDates($injects);
        $exercise->computeExerciseOwner();
        $em->persist($exercise);
        $em->flush();
    }

    /**
     * @OA\Property(
     *    description="Delete an inject"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"inject"})
     * @Rest\Delete("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}")
     */
    public function removeExercisesEventsIncidentsInjectAction(Request $request)
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

        $inject = $em->getRepository('App:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject)) {
            return $this->injectNotFound();
        }

        $this->updateExercise($exercise, null, $inject->getInjectId());

        $em->remove($inject);
        $em->flush();
    }

    private function injectNotFound()
    {
        return View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Update an inject")
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}")
     */
    public function updateExercisesEventsIncidentsInjectAction(Request $request)
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

        if (empty($incident)) {
            return $this->incidentNotFound();
        }

        $inject = $em->getRepository('App:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->injectNotFound();
        }

        $form = $this->createForm(InjectType::class, $inject);
        $form->submit($request->request->all(), false);

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        if ($form->isValid()) {
            $em->persist($inject);
            $this->updateExercise($exercise, $inject);

            $em->flush();
            $em->clear();

            $inject = $em->getRepository('App:Inject')->find($request->get('inject_id'));
            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectEvent($event->getEventId());
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->setUserCanUpdate(true);
            $inject->setUserCanDelete(true);

            return $inject;
        } else {
            return $form;
        }
    }
}
