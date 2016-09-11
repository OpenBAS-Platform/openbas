<?php

namespace APIBundle\Controller\Exercise;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Group;
use APIBundle\Entity\User;
use APIBundle\Form\Type\GroupType;

class ExerciseGroupController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List groups involved in an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/exercise/{exercise_id}/groups")
     */
    public function getGroupsAction(Request $request)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $groups = [];
        $grants = $exercise->getExerciseGrants();
        foreach( $grants as $grant ) {
            $groups[] = $grant->getGrantGroup();
        }

        return $groups;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}