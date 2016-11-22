<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Audience;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\InjectType;
use APIBundle\Entity\InjectStatus;
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
        foreach ($exercises as $exercise) {
            $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */
            foreach ($events as $event) {
                $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    if ($request->get('worker')) {
                        $dateStart = new \DateTime();
                        $dateStart->modify('-60 minutes');
                        $dateEnd = new \DateTime();

                        $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->createQueryBuilder('i')
                            ->leftJoin('i.inject_status', 's')
                            ->where('s.status_inject = i.inject_id')
                            ->andWhere('s.status_name = \'PENDING\'')
                            ->andWhere('i.inject_incident = :incident')
                            ->andWhere('i.inject_date BETWEEN :start AND :end')
                            ->orderBy('i.inject_date', 'ASC')
                            ->setParameter('incident', $incident->getIncidentId())
                            ->setParameter('start', $dateStart)
                            ->setParameter('end', $dateEnd)
                            ->getQuery()
                            ->getResult());
                    } else {
                        $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
                    }
                }
            }
        }

        if ($request->get('worker')) {
            $output = array();
            foreach ($injects as $inject) {
                $data = array();
                $data['context']['id'] = $inject->getInjectId();
                $data['context']['type'] = $inject->getInjectType();
                $data['context']['callback_url'] = $this->getParameter('protocol') . '://' . $request->getHost() . '/api/injects/' . $inject->getInjectId() . '/status';
                $data['data'] = json_decode($inject->getInjectContent(), true);
                $data['data']['users'] = array();
                foreach ($inject->getInjectAudiences() as $audience) {
                    /* @var $audience Audience */
                    foreach(  $audience->getAudienceUsers() as $user ) {
                        $data['data']['users'][] = $user;
                    }
                }
                $output[] = $data;
            }

            return $output;
        } else {
            return $injects;
        }
    }

    /**
     * @ApiDoc(
     *    description="Update the status of an inject",
     * )

     * @Rest\View(serializerGroups={"injectStatus"})
     * @Rest\Post("/injects/{inject_id}/status")
     */
    public function updateInjectStatusAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");

        $em = $this->get('doctrine.orm.entity_manager');
        $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject)) {
            return $this->injectNotFound();
        }

        $status = $inject->getInjectStatus();
        $status->setStatusName($request->request->get('status'));
        $status->setStatusMessage($request->request->get('message'));
        $status->setStatusDate(new \DateTime());

        $em->persist($status);
        $em->flush();

        return $status;
    }

    private function injectNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }
}