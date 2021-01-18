<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class ParameterController extends AbstractController
{
    /**
     * @OA\Property(
     *    description="List parameters"
     * )
     *
     * @Rest\View(serializerGroups={"parameter"})
     * @Rest\Get("/api/parameters")
     */
    public function getParametersAction(Request $request)
    {
        return ["test" => "test"];
    }
}
