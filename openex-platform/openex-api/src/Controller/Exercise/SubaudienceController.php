<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Exercise;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SubaudienceController extends BaseController
{

    /**
     * @OA\Response(
     *    response=200,
     *    description="List subaudiences of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Get("/api/exercises/{exercise_id}/subaudiences")
     */
    public function getExercisesSubaudiencesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise]);
        /* @var $audiences Audience[] */

        $subaudiences = array();
        foreach ($audiences as $audience) {
            $subaudiences = array_merge($subaudiences, $em->getRepository('App:Subaudience')->findBy(['subaudience_audience' => $audience]));
        }

        foreach ($subaudiences as &$subaudience) {
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
            $subaudience->setUserCanUpdate($this->hasGranted(self::UPDATE, $subaudience));
            $subaudience->setUserCanDelete($this->hasGranted(self::DELETE, $subaudience));
        }

        return $subaudiences;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
