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
use App\Entity\Exercise;
use App\Form\Type\EventType;
use App\Entity\Event;

class InjectTypeController extends Controller
{
    public static $INJECT_TYPE_MANUAL = 'openex_manual';

    /**
     * @SWG\Property(
     *    description="List inject types"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/inject_types")
     */
    public function getInjectTypesAction(Request $request)
    {
        $logger = $this->get('mylogger.db');

        $contracts = array();
        try {
            $url = $this->getParameter('worker_url') . '/cxf/contracts';
            $contracts = json_decode(file_get_contents($url), true);
        } catch (\Exception $e) {
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
