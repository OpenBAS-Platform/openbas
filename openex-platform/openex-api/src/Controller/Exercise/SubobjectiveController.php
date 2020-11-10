<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Exercise;
use App\Entity\Objective;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SubobjectiveController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List subobjectives of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Get("/api/exercises/{exercise_id}/subobjectives")
     */
    public function getExercisesSubobjectivesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objectives = $em->getRepository('App:Objective')->findBy(['objective_exercise' => $exercise]);
        /* @var $objectives Objective[] */

        $subobjectives = array();
        foreach ($objectives as $objective) {
            $subobjectives = array_merge($subobjectives, $em->getRepository('App:Subobjective')->findBy(['subobjective_objective' => $objective]));
        }

        foreach ($subobjectives as &$subobjective) {
            $subobjective->setSubobjectiveExercise($exercise->getExerciseId());
            $subobjective->setUserCanUpdate($this->hasGranted(self::UPDATE, $subobjective));
            $subobjective->setUserCanDelete($this->hasGranted(self::DELETE, $subobjective));
        }
        return $subobjectives;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
