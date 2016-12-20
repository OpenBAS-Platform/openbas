<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;

class WorkerStatusController extends Controller
{
    /**
     * @ApiDoc(
     *    description="Get the worker status"
     * )
     * @Rest\Get("/worker_status")
     */
    public function getWorkerStatusAction(Request $request)
    {
        $url = $this->getParameter('worker_url') . '/cxf/heartbeat';
        $status = json_decode(file_get_contents($url), true);
        $output = json_encode($status);
        return new Response($output);
    }
}