<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\EventType;
use APIBundle\Entity\Event;

class ExerciseStatusController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List exercise statuses"
     * )
     * @Rest\View(serializerGroups={"ExerciseStatus"})
     * @Rest\Get("/exercise_statuses")
     */
    public function getExerciseStatusesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $statuses = $em->getRepository('APIBundle:ExerciseStatus')->findAll();

        return $statuses;
    }
}