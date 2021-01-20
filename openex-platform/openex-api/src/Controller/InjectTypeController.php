<?php

namespace App\Controller;

use Exception;
use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectTypeController extends AbstractController
{
    public static $INJECT_TYPE_MANUAL = 'openex_manual';

    /**
     * @OA\Response(
     *    response=200,
     *    description="List inject types"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/api/inject_types")
     */
    public function getInjectTypesAction(LoggerInterface $logger)
    {
        $contracts = array();
        try {
            $url = $this->getParameter('player_url') . '/contracts';
            $contracts = json_decode(file_get_contents($url), true);
        } catch (Exception $e) {
            $logger->error('Contracts can not be retrieved from worker: ' . $e->getMessage());
        }

        $other = array();
        $other['type'] = self::$INJECT_TYPE_MANUAL;
        $other['fields'] = array();
        $other['fields'][] = array(
            'name' => 'content',
            'type' => 'textarea',
            'cardinality' => '1',
            'mandatory' => true,
        );

        $contracts[] = $other;

        //$output = json_encode($contracts);
        return $contracts;
    }
}
