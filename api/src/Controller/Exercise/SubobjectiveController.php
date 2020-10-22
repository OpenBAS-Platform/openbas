<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Exercise;
use App\Entity\Objective;

class SubobjectiveController extends BaseController
{
    /**
     * @SWG\Property(
     *    description="List subobjectives of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Get("/exercises/{exercise_id}/subobjectives")
     */
    public function getExercisesSubobjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
