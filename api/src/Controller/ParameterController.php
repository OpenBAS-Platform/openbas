<?php

namespace App\Controller;

use App\Entity\Exercise;
use App\Entity\Grant;
use App\Form\Type\ExerciseType;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ParameterController extends Controller
{
    /**
     * @SWG\Property(
     *    description="List parameters"
     * )
     *
     * @Rest\View(serializerGroups={"parameter"})
     * @Rest\Get("/parameters")
     */
    public function getParametersAction(Request $request)
    {
    }

    /**
     * @SWG\Property(description="Update a parameter")
     *
     * @Rest\View(serializerGroups={"parameter"})
     * @Rest\Put("/parameters/{parameter_id}")
     */
    public function updateExerciseAction(Request $request)
    {
    }

    private function parameterNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Parameter not found'], Response::HTTP_NOT_FOUND);
    }
}
