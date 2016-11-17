<?php

namespace APIBundle\Controller\Exercise;

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
     *    description="List incidents of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Get("/exercises/{exercise_id}/incidents")
     */
    public function getExercisesIncidentsAction(Request $request)
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

        $incidents = array();
        foreach( $events as $event ) {
            $incidents = array_merge($incidents, $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]));
        }

        return $incidents;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}