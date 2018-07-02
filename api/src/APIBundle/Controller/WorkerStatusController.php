<?php

namespace APIBundle\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

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
        /** @var \Httpful\Response $response */
        $response = \Httpful\Request::get($url)->send();
        return new Response(json_encode($response->body), $response->code, $response->headers->toArray());
    }
}