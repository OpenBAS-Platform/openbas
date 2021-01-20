<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Exercise;
use App\Entity\Grant;
use App\Entity\Group;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class GroupController extends BaseController
{

    /**
     * @OA\Response(
     *    response=200,
     *    description="List groups involved in an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/api/exercises/{exercise_id}/groups")
     */
    public function getExercisesGroupsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $groups = [];
        /* @var $groups Group[] */
        $grants = $exercise->getExerciseGrants();
        /* @var $grants Grant[] */
        foreach ($grants as $grant) {
            $group = $grant->getGrantGroup();
            /* @var $group Group */
            $group->setGroupGrantInExercise($grant->getGrantName());
            $group->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $group->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
            $groups[] = $group;
        }

        return $groups;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
