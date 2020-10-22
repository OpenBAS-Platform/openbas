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
use App\Entity\Audience;

class SubaudienceController extends BaseController
{

    /**
     * @SWG\Property(
     *    description="List subaudiences of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Get("/exercises/{exercise_id}/subaudiences")
     */
    public function getExercisesSubaudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
