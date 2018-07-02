<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Objective;

class SubobjectiveController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List subobjectives of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Get("/exercises/{exercise_id}/subobjectives")
     */
    public function getExercisesSubobjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objectives = $em->getRepository('APIBundle:Objective')->findBy(['objective_exercise' => $exercise]);
        /* @var $objectives Objective[] */

        $subobjectives = array();
        foreach ($objectives as $objective) {
            $subobjectives = array_merge($subobjectives, $em->getRepository('APIBundle:Subobjective')->findBy(['subobjective_objective' => $objective]));
        }

        foreach( $subobjectives as &$subobjective) {
            $subobjective->setSubobjectiveExercise($exercise->getExerciseId());
        }
        return $subobjectives;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}