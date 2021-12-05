<?php

namespace App\Controller\Group;

use App\Entity\Group;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController extends AbstractController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    
    /**
     * @OA\Response(
     *    response=200,
     *    description="List users of a group"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/api/groups/{group_id}/users")
     */
    public function getGroupsUsersAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('select', $group);

        return $group->getGroupUsers();
    }

    private function groupNotFound()
    {
        return View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Add a user to a group")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/api/groups/{group_id}/users")
     */
    public function postGroupsUsersAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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

    private function userNotFound()
    {
        return View::create(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Remove a user from a group",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"role"})
     * @Rest\Delete("/api/groups/{group_id}/users/{user_id}")
     */
    public function removeGroupsUserAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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
}
