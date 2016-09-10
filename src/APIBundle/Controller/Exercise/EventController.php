<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\EventType;
use APIBundle\Entity\Event;

class EventController extends Controller
{
    /**
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/exercises/{exercise_id}/events")
     */
    public function getEventsAction(Request $request)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        return $exercise->getExerciseEvents();
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"event"})
     * @Rest\Post("/exercises/{exercise_id}/events")
     */
    public function postEventsAction(Request $request)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $event = new Event();
        $event->setEventExercise($exercise);
        $form = $this->createForm(EventType::class, $event);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
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
}