<?php

namespace App\Controller\Exercise\Event;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List injects of an event"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/api/exercises/{exercise_id}/events/{event_id}/injects")
     */
    public function getExercisesEventsInjectsAction(Request $request)
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
        /* @var $incidents Incident[] */

        $injects = array();
        foreach ($incidents as $incident) {
            $incidentInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);
            foreach ($incidentInjects as &$incidentInject) {
                $incidentInject->setInjectEvent($event->getEventId());
            }
            $injects = array_merge($injects, $incidentInjects);
        }

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectExercise($exercise->getExerciseId());
            $inject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $inject->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
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
}
