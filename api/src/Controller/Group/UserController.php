<?php

namespace App\Controller\Group;

use App\Entity\User;
use App\Form\Type\UserType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Group;

class UserController extends Controller
{
    /**
     * @SWG\Property(
     *    description="List users of a group"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/groups/{group_id}/users")
     */
    public function getGroupsUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('select', $group);

        return $group->getGroupUsers();
    }

    /**
     * @SWG\Property(description="Add a user to a group")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/groups/{group_id}/users")
     */
    public function postGroupsUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('update', $group);

        $user = $em->getRepository('App:User')->find($request->request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $user->joinGroup($group);
        $em->persist($user);
        $em->flush();

        return $user;
    }

    /**
     * @SWG\Property(
     *    description="Remove a user from a group",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"role"})
     * @Rest\Delete("/groups/{group_id}/users/{user_id}")
     */
    public function removeGroupsUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('update', $group);

        $user = $em->getRepository('App:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $user->leaveGroup($group);
        $em->persist($user);
        $em->flush();

        return $user;
    }

    private function groupNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }

    private function userNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
    }
}
