<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Audience;

class SubaudienceController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List subaudiences of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Get("/exercises/{exercise_id}/subaudiences")
     */
    public function getExercisesSubaudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise]);
        /* @var $audiences Audience[] */

        $subaudiences = array();
        foreach ($audiences as $audience) {
            $subaudiences = array_merge($subaudiences, $em->getRepository('APIBundle:Subaudience')->findBy(['subaudience_audience' => $audience]));
        }

        foreach( $subaudiences as &$subaudience) {
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
        }

        return $subaudiences;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}