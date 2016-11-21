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
                        // get pending id
                        $status = $em->getRepository('APIBundle:InjectStatus')->findOneBy(['status_name' => 'PENDING']);
                        /* @var $status InjectStatus */
                        $dateStart = new \DateTime();
                        $dateStart->modify('-60 minutes');
                        $dateEnd = new \DateTime();

                        $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->createQueryBuilder('i')
                            ->orderBy('i.inject_date', 'ASC')
                            ->where('i.inject_incident = :incident')
                            ->andWhere('i.inject_status = :status')
                            ->andWhere('i.inject_date BETWEEN :start AND :end')
                            ->setParameter('incident', $incident->getIncidentId())
                            ->setParameter('status', $status->getStatusId())
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
                $data['data'] = json_decode($inject->getInjectContent(), true);
                $data['context']['users'] = array();
                foreach ($inject->getInjectAudiences() as $audience) {
                    /* @var $audience Audience */
                    foreach(  $audience->getAudienceUsers() as $user ) {
                        $data['context']['users'][] = $user;
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
     *    description="Update an inject",
     *    input={"class"=InjectType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Put("/injects/{inject_id}")
     */
    public function updateInjectAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");

        $em = $this->get('doctrine.orm.entity_manager');
        $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject)) {
            return $this->injectNotFound();
        }

        $form = $this->createForm(InjectType::class, $inject);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($inject);
            $em->flush();
            return $inject;
        } else {
            return $form;
        }
    }

    private function injectNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }
}