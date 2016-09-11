<?php

namespace APIBundle\Controller\Group;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Group;
use APIBundle\Entity\Grant;
use APIBundle\Form\Type\GrantType;

class GrantController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List grants of a group"
     * )
     *
     * @Rest\View(serializerGroups={"grant"})
     * @Rest\Get("/groups/{group_id}/grants")
     */
    public function getGroupsGrantsAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        return $group->getGroupGrants();
    }

    /**
     * @ApiDoc(
     *    description="Add a grant to a group",
     *   input={"class"=GrantType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"grant"})
     * @Rest\Post("/groups/{group_id}/grants")
     */
    public function postGroupsGrantsAction(Request $request)
    {
        $group = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Group')
            ->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $grant = new Grant();
        $grant->setGrantGroup($group);
        $form = $this->createForm(GrantType::class, $grant);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($grant);
            $em->flush();
            return $grant;
        } else {
            return $form;
        }
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"grant"})
     * @Rest\Delete("/groups/{group_id}/grants/{grant_id}")
     */
    public function removeGroupsGrantAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $grant = $em->getRepository('Grant.php')
            ->find($request->get('grant_id'));
        /* @var $grant Grant */

        if ($grant) {
            $em->remove($grant);
            $em->flush();
        }
    }

    private function groupNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }
}