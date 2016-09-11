<?php

namespace APIBundle\Controller\Group;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use APIBundle\Entity\Group;
use APIBundle\Entity\Role;
use APIBundle\Form\Type\RoleType;

class UserController extends Controller
{
    /**
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
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/groups/{group_id}/users")
     */
    public function postGroupsUsersAction(Request $request)
    {

    }

    /**
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"role"})
     * @Rest\Delete("/groups/{group_id}/users/{user_id}")
     */
    public function removeGroupsUserAction(Request $request)
    {

    }

    private function groupNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }
}