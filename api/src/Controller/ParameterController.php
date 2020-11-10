<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

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
    }

    /**
     * @OA\Property(description="Update a parameter")
     *
     * @Rest\View(serializerGroups={"parameter"})
     * @Rest\Put("/parameters/{parameter_id}")
     */
    public function updateExerciseAction(Request $request)
    {
    }

    private function parameterNotFound()
    {
        return View::create(['message' => 'Parameter not found'], Response::HTTP_NOT_FOUND);
    }
}
