<?php

namespace App\Controller;

use App\Entity\Organization;
use App\Form\Type\OrganizationType;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OrganizationController extends AbstractController
{
    private ManagerRegistry $doctrine;
    private TokenStorageInterface $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage, ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
        $this->tokenStorage = $tokenStorage;
    }
    
    /**
     * @OA\Response(
     *    response=200,
     *    description="List organizations"
     * )
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Get("/api/organizations")
     */
    public function getOrganizationsAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $organizations = $em->getRepository('App:Organization')->findAll();
        /* @var $organizations Organization[] */

        return $organizations;
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Read an organization"
     * )
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Get("/api/organizations/{organization_id}")
     */
    public function getOrganizationAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
        /* @var $organization Organization */

        if (empty($organization)) {
            return $this->organizationNotFound();
        }

        return $organization;
    }

    private function organizationNotFound()
    {
        return View::create(['message' => 'Organization not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Create an organization")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"organization"})
     * @Rest\Post("/api/organizations")
     */
    public function postOrganizationsAction(Request $request)
    {
        $organization = new Organization();
        $form = $this->createForm(OrganizationType::class, $organization);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $em = $this->doctrine->getManager();
            $em->persist($organization);
            $em->flush();
            return $organization;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Delete an organization"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"organization"})
     * @Rest\Delete("/api/organizations/{organization_id}")
     */
    public function removeOrganizationAction(Request $request)
    {
        if (!$this->tokenStorage->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->doctrine->getManager();
        $organization = $em->getRepository('App:Organization')->find($request->get('organization_id'));
        /* @var $organization Organization */

        if ($organization) {
            $em->remove($organization);
            $em->flush();
        }
    }

    /**
     * @OA\Response(
     *    response=200,description="Update an organization")
     *
     * @Rest\View(serializerGroups={"organization"})
     * @Rest\Put("/api/organizations/{organization_id}")
     */
    public function updateOrganizationAction(Request $request)
    {
        if (!$this->tokenStorage->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->doctrine->getManager();
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
}
