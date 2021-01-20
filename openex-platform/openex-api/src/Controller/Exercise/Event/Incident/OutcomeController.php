<?php

namespace App\Controller\Exercise\Event\Incident;

use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Outcome;
use App\Form\Type\OutcomeType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class OutcomeController extends AbstractController
{
    /**
     * @OA\Response(
     *    response=200,description="Update an outcome")
     *
     * @Rest\View(serializerGroups={"incident"})
     * @Rest\Put("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/outcome/{outcome_id}")
     */
    public function updateExercisesEventsIncidentsOutcomeAction(Request $request)
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

        if (empty($event)) {
            return $this->eventNotFound();
        }

        $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $outcome = $em->getRepository('App:Outcome')->find($request->get('outcome_id'));
        /* @var $outcome Outcome */

        if (empty($outcome) || $outcome->getOutcomeIncident() !== $incident) {
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

    private function outcomeNotFound()
    {
        return View::create(['message' => 'Outcome not found'], Response::HTTP_NOT_FOUND);
    }
}
