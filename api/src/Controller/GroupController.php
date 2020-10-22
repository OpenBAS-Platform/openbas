<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Group;
use App\Entity\User;
use App\Form\Type\GroupType;
use App\Entity\Grant;

class GroupController extends BaseController
{

    /**
     * @SWG\Property(
     *    description="List groups"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/groups")
     */
    public function getGroupsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        if ($this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            $groups = $em->getRepository('App:Group')->findAll();
        } else {
            $grants = $this->get('security.token_storage')->getToken()->getUser()->getUserGrants();
            /* @var $grants Grant[] */
            $groups = [];
            foreach ($grants as $grant) {
                $groups[] = $grant->getGrantGroup();
            }
        }

        return $groups;
    }

    /**
     * @SWG\Property(
     *    description="Read a group"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/groups/{group_id}")
     */
    public function getGroupAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('select', $group);
        $group->setUserCanUpdate($this->hasGranted(self::UPDATE, $group));
        $group->setUserCanDelete($this->hasGranted(self::DELETE, $group));
        return $group;
    }

    /**
     * @SWG\Property(description="Create a group")
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
     * @SWG\Property(
     *    description="Delete a group"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"group"})
     * @Rest\Delete("/groups/{group_id}")
     */
    public function removeGroupAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if ($group) {
            $this->denyAccessUnlessGranted('delete', $group);
            $em->remove($group);
            $em->flush();
        }
    }

    /**
     * @SWG\Property(description="Update a group")
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Put("/groups/{group_id}")
     */
    public function updateGroupAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('update', $group);

        $form = $this->createForm(GroupType::class, $group);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($group);
            $em->flush();
            $em->clear();
            $group = $em->getRepository('App:Group')->find($request->get('group_id'));
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
