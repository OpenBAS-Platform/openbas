<?php

namespace APIBundle\Controller\Group;

use APIBundle\Entity\User;
use APIBundle\Form\Type\UserType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Group;

class UserController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List users of a group"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/groups/{group_id}/users")
     */
    public function getGroupsUsersAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        return $group->getGroupUsers();
    }

    /**
     * @ApiDoc(
     *    description="Add a user to a group",
     *    parameters={
     *      {"name"="user_id", "dataType"="integer", "required"=true, "description"=""}
     *    }
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/groups/{group_id}/users")
     */
    public function postGroupsUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('APIBundle:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $user = $em->getRepository('APIBundle:User')->find($request->request->get('user_id'));
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
     * @ApiDoc(
     *    description="Remove a user from a group",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"role"})
     * @Rest\Delete("/groups/{group_id}/users/{user_id}")
     */
    public function removeGroupsUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('APIBundle:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
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