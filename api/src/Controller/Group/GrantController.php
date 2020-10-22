<?php

namespace App\Controller\Group;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Group;
use App\Entity\Grant;
use App\Form\Type\GrantType;

class GrantController extends BaseController
{
    /**
     * @SWG\Property(
     *    description="List grants of a group"
     * )
     *
     * @Rest\View(serializerGroups={"grant"})
     * @Rest\Get("/groups/{group_id}/grants")
     */
    public function getGroupsGrantsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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

    /**
     * @SWG\Property(description="Add a grant to a group")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"grant"})
     * @Rest\Post("/groups/{group_id}/grants")
     */
    public function postGroupsGrantsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
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
     * @Rest\Delete("/groups/{group_id}/grants/{grant_id}")
     */
    public function removeGroupsGrantAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
        }

        $grant = $em->getRepository('App:Grant')->find($request->get('grant_id'));
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
