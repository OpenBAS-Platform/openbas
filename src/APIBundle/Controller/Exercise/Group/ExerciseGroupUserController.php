<?php

namespace APIBundle\Controller\Exercise\Group;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Form\Type\UserType;
use APIBundle\Entity\User;

class ExerciseGroupUserController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List users of a group involved in an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/exercises/{exercise_id}/groups/{group_id}/users")
     */
    public function getUsersAction(Request $request)
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