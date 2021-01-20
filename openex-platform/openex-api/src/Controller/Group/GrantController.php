<?php

namespace App\Controller\Group;

use App\Controller\Base\BaseController;
use App\Entity\Grant;
use App\Entity\Group;
use App\Form\Type\GrantType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class GrantController extends BaseController
{
    /**
     * @OA\Response(
     *    response=200,
     *    description="List grants of a group"
     * )
     *
     * @Rest\View(serializerGroups={"grant"})
     * @Rest\Get("/api/groups/{group_id}/grants")
     */
    public function getGroupsGrantsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $this->denyAccessUnlessGranted('select', $group);

        $groups = $group->getGroupGrants();
        foreach ($groups as &$group) {
            $group->setUserCanUpdate($this->hasGranted(self::UPDATE, $group));
            $group->setUserCanDelete($this->hasGranted(self::DELETE, $group));
        }
        return $groups;
    }

    private function groupNotFound()
    {
        return View::create(['message' => 'Group not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Add a grant to a group")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"grant"})
     * @Rest\Post("/api/groups/{group_id}/grants")
     */
    public function postGroupsGrantsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new AccessDeniedHttpException();
        }

        $group = $em->getRepository('App:Group')->find($request->get('group_id'));
        /* @var $group Group */

        if (empty($group)) {
            return $this->groupNotFound();
        }

        $grant = new Grant();
        $grant->setGrantGroup($group);
        $form = $this->createForm(GrantType::class, $grant);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em->persist($grant);
            $em->flush();
            return $grant;
        } else {
            return $form;
        }
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"grant"})
     * @Rest\Delete("/api/groups/{group_id}/grants/{grant_id}")
     */
    public function removeGroupsGrantAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new AccessDeniedHttpException();
        }

        $grant = $em->getRepository('App:Grant')->find($request->get('grant_id'));
        /* @var $grant Grant */

        if ($grant) {
            $em->remove($grant);
            $em->flush();
        }
    }
}
