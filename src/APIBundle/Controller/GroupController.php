<?php

namespace APIBundle\Controller;

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
use APIBundle\Entity\Group;
use APIBundle\Entity\User;
use APIBundle\Form\Type\GroupType;

class GroupController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List groups"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/groups")
     */
    public function getGroupsAction(Request $request)
    {
        if( !$this->get('security.token_storage')->getToken()->getUser()->isAdmin() )
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();

        $groups = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->findAll();
        /* @var $groups Group[] */

        return $groups;
    }

    /**
     * @ApiDoc(
     *    description="Read a group"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/groups/{group_id}")
     */
    public function getGroupAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('select', $group);
        return $group;
    }

    /**
     * @ApiDoc(
     *    description="Create a new group",
     *   input={"class"=GroupType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"group"})
     * @Rest\Post("/groups")
     */
    public function postGroupsAction(Request $request)
    {
        $group = new Group();
        $form = $this->createForm(GroupType::class, $group);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($group);
            $em->flush();
            return $group;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a group"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"group"})
     * @Rest\Delete("/groups/{group_id}")
     */
    public function removeGroupAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')
            ->find($request->get('user_id'));
        /* @var $user User */

        if ($user) {
            $em->remove($user);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Replace a group",
     *   input={"class"=GroupType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Put("/groups/{group_id}")
     */
    public function updateGroupAction(Request $request)
    {
        return $this->updateGroup($request, true);
    }

    /**
     * @ApiDoc(
     *    description="Update a group",
     *   input={"class"=GroupType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Patch("/groups/{group_id}")
     */
    public function patchGroupAction(Request $request)
    {
        return $this->updateGroup($request, false);
    }

    private function updateGroup(Request $request, $clearMissing)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $form = $this->createForm(GroupType::class, $group);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($group);
            $em->flush();
            return $group;
        } else {
            return $form;
        }
    }

    private function groupNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }
}