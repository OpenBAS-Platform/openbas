<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\EventType;
use APIBundle\Entity\Event;

class AudienceController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List audiences"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/exercises/{exercise_id}/audiences")
     */
    public function getExercisesAudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise]);

        return $audiences;
    }

    /**
     * @ApiDoc(
     *    description="Read an audience"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function getExerciseAudienceAction(Request $request)
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

        return $event;
    }

    /**
     * @ApiDoc(
     *    description="Create an audience",
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
        $event->setEventExercise($exercise);
        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all());

        if ($form->isValid()) {
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $em->remove($event);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Replace an event",
     *   input={"class"=EventType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}")
     */
    public function updateExercisesEventAction(Request $request)
    {
        return $this->updateEvent($request, true);
    }

    /**
     * @ApiDoc(
     *    description="Update an event",
     *    input={"class"=EventType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Patch("/exercises/{exercise_id}/events/{event_id}")
     */
    public function patchExercisesEventAction(Request $request)
    {
        return $this->updateEvent($request, false);
    }

    private function updateEvent(Request $request, $clearMissing)
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

        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all(), $clearMissing);

        if ($form->isValid()) {
            $em->persist($event);
            $em->flush();
            return $event;
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
}