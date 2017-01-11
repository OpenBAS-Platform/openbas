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

        foreach( $events as &$event) {
            if( $event->getEventImage() !== null ) {
                $event->getEventImage()->buildUrl($this->getParameter('protocol'), $request->getHost());
            }
        }

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

        if (empty($event) || $event->getEventExercise() !== $exercise ) {
            return $this->eventNotFound();
        }

        if( $event->getEventImage() !== null ) {
            $event->getEventImage()->buildUrl($this->getParameter('protocol'), $request->getHost());
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

            if( $event->getEventImage() !== null ) {
                $event->getEventImage()->buildUrl($this->getParameter('protocol'), $request->getHost());
            }
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

        if (empty($event) || $event->getEventExercise() !== $exercise ) {
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

        if (empty($event) || $event->getEventExercise() !== $exercise ) {
            return $this->eventNotFound();
        }

        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($event);
            $em->flush();
            $em->clear();
            $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
            if( $event->getEventImage() !== null ) {
                $event->getEventImage()->buildUrl($this->getParameter('protocol'), $request->getHost());
            }
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