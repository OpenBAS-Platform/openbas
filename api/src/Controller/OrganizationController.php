<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Form\Type\OrganizationType;
use App\Entity\Organization;

class OrganizationController extends Controller
{
    /**
     * @SWG\Property(
     *    description="List organizations"
     * )
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Get("/organizations")
     */
    public function getOrganizationsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $organizations = $em->getRepository('App:Organization')->findAll();
        /* @var $organizations Organization[] */

        return $organizations;
    }

    /**
     * @SWG\Property(
     *    description="Read an organization"
     * )
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Get("/organizations/{organization_id}")
     */
    public function getOrganizationAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
        /* @var $organization Organization */

        if (empty($organization)) {
            return $this->organizationNotFound();
        }

        return $organization;
    }

    /**
     * @SWG\Property(description="Create an organization")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"organization"})
     * @Rest\Post("/organizations")
     */
    public function postOrganizationsAction(Request $request)
    {
        $organization = new Organization();
        $form = $this->createForm(OrganizationType::class, $organization);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($organization);
            $em->flush();
            return $organization;
        } else {
            return $form;
        }
    }

    /**
     * @SWG\Property(
     *    description="Delete an organization"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"organization"})
     * @Rest\Delete("/organizations/{organization_id}")
     */
    public function removeOrganizationAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->get('doctrine.orm.entity_manager');
        $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
        /* @var $organization Organization */

        if ($organization) {
            $em->remove($organization);
            $em->flush();
        }
    }

    /**
     * @SWG\Property(description="Update an organization")
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Put("/organizations/{organization_id}")
     */
    public function updateOrganizationAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->get('doctrine.orm.entity_manager');
        $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
        /* @var $organization Organization */

        if (empty($organization)) {
            return $this->organizationNotFound();
        }

        $form = $this->createForm(OrganizationType::class, $organization);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($organization);
            $em->flush();
            $em->clear();
            $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
            return $organization;
        } else {
            return $form;
        }
    }

    private function organizationNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Organization not found'], Response::HTTP_NOT_FOUND);
    }
}
