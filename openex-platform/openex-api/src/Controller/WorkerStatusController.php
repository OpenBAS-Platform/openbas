<?php

namespace App\Controller;

use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class WorkerStatusController extends AbstractController
{
    /**
     * @OA\Property(
     *    description="Get the worker status"
     * )
     * @Rest\Get("/api/worker_status")
     */
    public function getWorkerStatusAction(Request $request)
    {
        $url = $this->getParameter('player_url') . '/cxf/heartbeat';
        /** @var \Httpful\Response $response */
        $response = \Httpful\Request::get($url)->send();
        return new Response(json_encode($response->body), $response->code, $response->headers->toArray());
    }
}
