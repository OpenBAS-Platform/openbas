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

class InjectTypeController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List inject types"
     * )
     * @Rest\Get("/inject_types")
     */
    public function getInjectTypesAction(Request $request)
    {
        $url = $this->getParameter('worker_url') . '/cxf/contracts';
        $content = json_decode(file_get_contents($url), true);
        $contracts = $content['contracts'];

        $output = array();
        foreach( $contracts as $contract ) {
            $definition = json_decode($contract['definition'], true);
            $output[] = array(
                'type' => $contract['type'],
                'definition' => $definition
            );
        }

        $output = json_encode($output);
        return new Response($output);
    }
}