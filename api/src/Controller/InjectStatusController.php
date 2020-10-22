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

class InjectStatusController extends Controller
{
    /**
     * @SWG\Property(
     *    description="List inject statuses"
     * )
     * @Rest\View(serializerGroups={"injectStatus"})
     * @Rest\Get("/inject_statuses")
     */
    public function getInjectStatusesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $statuses = $em->getRepository('App:InjectStatus')->findAll();

        return $statuses;
    }
}
