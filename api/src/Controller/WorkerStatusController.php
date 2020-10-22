<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkerStatusController extends Controller
{
    /**
     * @SWG\Property(
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
