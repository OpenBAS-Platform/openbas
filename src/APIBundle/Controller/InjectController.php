<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\InjectType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;

class InjectController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List injects"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/injects")
     */
    public function getInjectsAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");

        $em = $this->get('doctrine.orm.entity_manager');

        $injects = array();
        $exercises = $em->getRepository('APIBundle:Exercise')->findAll();
        /* @var $exercises Exercise[] */
        foreach($exercises as $exercise) {
            $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */
            foreach ($events as $event) {
                $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
                }
            }
        }

        return $injects;
    }
}