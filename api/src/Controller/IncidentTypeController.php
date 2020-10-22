<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

class IncidentTypeController extends Controller
{
    /**
     * @SWG\Property(
     *    description="List incident types"
     * )
     * @Rest\View(serializerGroups={"IncidentType"})
     * @Rest\Get("/incident_types")
     */
    public function getIncidentTypesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $types = $em->getRepository('App:IncidentType')->findAll();

        return $types;
    }
}
