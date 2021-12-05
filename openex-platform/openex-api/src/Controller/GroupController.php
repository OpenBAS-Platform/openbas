<?php

namespace App\Controller;

use App\Controller\Base\BaseController;
use App\Entity\Grant;
use App\Entity\Group;
use App\Form\Type\GroupType;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use JetBrains\PhpStorm\Pure;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class GroupController extends BaseController
{
    private ManagerRegistry $doctrine;
    private TokenStorageInterface $tokenStorage;

    public function __construct(ManagerRegistry $doctrine, TokenStorageInterface $tokenStorage)
    {
        $this->doctrine = $doctrine;
        $this->tokenStorage = $tokenStorage;
        parent::__construct($tokenStorage);
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="List groups"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/api/groups")
     */
    public function getGroupsAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        if ($this->tokenStorage->getToken()->getUser()->isAdmin()) {
            $groups = $em->getRepository('App:Group')->findAll();
        } else {
            $grants = $this->tokenStorage->getToken()->getUser()->getUserGrants();
            /* @var $grants Grant[] */
            $groups = [];
            foreach ($grants as $grant) {
                $groups[] = $grant->getGrantGroup();
            }
        }

        return $groups;
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Read a group"
     * )
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Get("/api/groups/{group_id}")
     */
    public function getGroupAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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

    private function groupNotFound()
    {
        return View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Create a group")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"group"})
     * @Rest\Post("/api/groups")
     */
    public function postGroupsAction(Request $request)
    {
        $group = new Group();
        $form = $this->createForm(GroupType::class, $group);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->doctrine->getManager();
            $em->persist($group);
            $em->flush();
            return $group;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Delete a group"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"group"})
     * @Rest\Delete("/groups/{group_id}")
     */
    public function removeGroupAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if ($group) {
            $this->denyAccessUnlessGranted('delete', $group);
            $em->remove($group);
            $em->flush();
        }
    }

    /**
     * @OA\Response(
     *    response=200,description="Update a group")
     *
     * @Rest\View(serializerGroups={"group"})
     * @Rest\Put("/api/groups/{group_id}")
     */
    public function updateGroupAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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
}
