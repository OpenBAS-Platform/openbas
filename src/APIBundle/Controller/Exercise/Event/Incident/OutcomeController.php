<?php

namespace APIBundle\Controller\Exercise\Event\Incident;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\OutcomeType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Outcome;

class OutcomeController extends Controller
{
    /**
     * @ApiDoc(
     *    description="Update an outcome",
     *    input={"class"=OutcomeType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Put("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/outcome/{outcome_id}")
     */
    public function updateExercisesEventsIncidentsOutcomeAction(Request $request)
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

        if (empty($incident) || $incident->getIncidentEvent() !== $event ) {
            return $this->incidentNotFound();
        }

        $outcome = $em->getRepository('APIBundle:Outcome')->find($request->get('outcome_id'));
        /* @var $outcome Outcome */

        if (empty($outcome) || $outcome->getOutcomeIncident() !== $incident ) {
            return $this->outcomeNotFound();
        }

        $form = $this->createForm(OutcomeType::class, $outcome);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($outcome);
            $em->flush();
            $incident->setIncidentExercise($exercise->getExerciseId());
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

    private function outcomeNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Outcome not found'], Response::HTTP_NOT_FOUND);
    }
}