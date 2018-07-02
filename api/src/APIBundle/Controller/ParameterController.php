<?php

namespace APIBundle\Controller;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\Grant;
use APIBundle\Form\Type\ExerciseType;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ParameterController extends Controller
{
    /**
     * @ApiDoc(
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
     * @ApiDoc(
     *    description="Update a parameter",
     *   input={"class"=Parameter::class, "name"=""}
     * )
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