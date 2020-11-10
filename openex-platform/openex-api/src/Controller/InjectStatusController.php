<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class InjectStatusController extends AbstractController
{
    /**
     * @OA\Property(
     *    description="List inject statuses"
     * )
     * @Rest\View(serializerGroups={"injectStatus"})
     * @Rest\Get("/api/inject_statuses")
     */
    public function getInjectStatusesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $statuses = $em->getRepository('App:InjectStatus')->findAll();

        return $statuses;
    }
}
