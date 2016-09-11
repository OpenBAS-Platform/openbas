<?php

namespace APIBundle\Controller\Group;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Group;
use APIBundle\Entity\Role;
use APIBundle\Form\Type\RoleType;

class RoleController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List roles of a group"
     * )
     *
     * @Rest\View(serializerGroups={"role"})
     * @Rest\Get("/groups/{group_id}/roles")
     */
    public function getGroupsRolesAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        return $group->getGroupRoles();
    }

    /**
     * @ApiDoc(
     *    description="Add a role to a group",
     *   input={"class"=RoleType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"role"})
     * @Rest\Post("/groups/{group_id}/roles")
     */
    public function postGroupsRolesAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $role = new Role();
        $role->setRoleGroup($group);
        $form = $this->createForm(RoleType::class, $role);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($role);
            $em->flush();
            return $role;
        } else {
            return $form;
        }
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"role"})
     * @Rest\Delete("/groups/{group_id}/roles/{role_id}")
     */
    public function removeGroupsRoleAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $role = $em->getRepository('APIBundle:Role')
            ->find($request->get('role_id'));
        /* @var $role Role */

        if ($role) {
            $em->remove($role);
            $em->flush();
        }
    }

    private function groupNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }
}