<?php

namespace App\Controller;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Dryinject;
use App\Entity\DryinjectStatus;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use App\Entity\InjectStatus;
use App\Entity\Subaudience;
use App\Entity\User;
use DateTime;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use function json_encode;

class InjectController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List injects for the worker"
     * )
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/api/injects_all")
     */
    public function getAllInjectsAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->getDoctrine()->getManager();
        $exercises = $em->getRepository('App:Exercise')->findAll();
        /* @var $exercises Exercise[] */

        $injects = array();
        foreach ($exercises as $exercise) {
            $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            foreach ($events as $event) {
                $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $incidentInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident]);
                    foreach ($incidentInjects as &$incidentInject) {
                        $incidentInject->setInjectEvent($event->getEventId());
                        $incidentInject->setInjectExercise($exercise->getExerciseId());
                        $incidentInject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
                        $incidentInject->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
                    }
                    $injects = array_merge($injects, $incidentInjects);
                }
            }
        }

        foreach ($injects as &$inject) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber();
        }

        return $injects;
    }

    /**
     * @OA\Property(
     *    description="List injects for the worker"
     * )
     *
     * @Rest\Get("/api/injects")
     */
    public function getInjectsAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->getDoctrine()->getManager();

        $injects = array();
        $dateStart = new DateTime();
        $dateStart->modify('-60 minutes');
        $dateEnd = new DateTime();

        $exercises = $em->getRepository('App:Exercise')->findBy(['exercise_canceled' => 0]);
        /* @var $exercises Exercise[] */
        foreach ($exercises as $exercise) {
            $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */
            foreach ($events as $event) {
                $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */
                foreach ($incidents as $incident) {
                    $incidentInjects = $em->getRepository('App:Inject')->createQueryBuilder('i')
                        ->leftJoin('i.inject_status', 's')
                        ->where('s.status_inject = i.inject_id')
                        ->andWhere('s.status_name is NULL')
                        ->andWhere('i.inject_enabled = true')
                        ->andWhere('i.inject_type != \'manual\'')
                        ->andWhere('i.inject_incident = :incident')
                        ->andWhere('i.inject_date BETWEEN :start AND :end')
                        ->orderBy('i.inject_date', 'ASC')
                        ->setParameter('incident', $incident->getIncidentId())
                        ->setParameter('start', $dateStart)
                        ->setParameter('end', $dateEnd)
                        ->getQuery()
                        ->getResult();
                    // enrich injects
                    foreach ($incidentInjects as &$incidentInject) {
                        /* @var $incidentInject Inject */
                        $incidentInject->setInjectExercise($exercise);
                        $incidentInject->setInjectHeader($exercise->getExerciseMessageHeader());
                        $incidentInject->setInjectFooter($exercise->getExerciseMessageFooter());
                    }
                    $injects = array_merge($injects, $incidentInjects);
                }
            }
        }

        $output = array();
        foreach ($injects as $inject) {
            // list all audiences
            if ($inject->getInjectAllAudiences() == true) {
                foreach ($inject->getInjectExercise()->getExerciseAudiences() as $audience) {
                    if ($audience->getAudienceEnabled() == true) {
                        // list subaudiences of the audience
                        foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                            if ($subaudience->getSubaudienceEnabled() == true) {
                                // list all users of the subaudience
                                foreach ($subaudience->getSubaudienceUsers() as $user) {
                                    $output[] = $this->getInjectData($request, $inject, $user);
                                }
                            }
                        }
                    }
                }
            } else {
                foreach ($inject->getInjectAudiences() as $audience) {
                    /* @var $audience Audience */
                    if ($audience->getAudienceEnabled() == true) {
                        // list subaudiences of the audience
                        foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                            if ($subaudience->getSubaudienceEnabled() == true) {
                                // list all users of the subaudience
                                foreach ($subaudience->getSubaudienceUsers() as $user) {
                                    $output[] = $this->getInjectData($request, $inject, $user);
                                }
                            }
                        }
                    }
                }
            }

            // list subaudiences
            foreach ($inject->getInjectSubaudiences() as $subaudience) {
                /* @var $subaudience Subaudience */
                if ($subaudience->getSubaudienceEnabled() == true) {
                    // list all users of the subaudience
                    foreach ($subaudience->getSubaudienceUsers() as $user) {
                        $output[] = $this->getInjectData($request, $inject, $user);
                    }
                }
            }

            if ($inject->getInjectExercise()->getExerciseAnimationGroup() != null) {
                foreach ($inject->getInjectExercise()->getExerciseAnimationGroup()->getGroupUsers() as $user) {
                    $output[] = $this->getInjectData($request, $inject, $user);
                }
            }
        }

        $dryinjects = $em->getRepository('App:Dryinject')->createQueryBuilder('i')
            ->leftJoin('i.dryinject_status', 's')
            ->where('s.status_dryinject = i.dryinject_id')
            ->andWhere('s.status_name is NULL')
            ->andWhere('i.dryinject_type != \'other\'')
            ->andWhere('i.dryinject_date BETWEEN :start AND :end')
            ->orderBy('i.dryinject_date', 'ASC')
            ->setParameter('start', $dateStart)
            ->setParameter('end', $dateEnd)
            ->getQuery()
            ->getResult();

        foreach ($dryinjects as $dryinject) {
            /* @var $dryinject Dryinject */

            if ($dryinject->getDryinjectDryrun()->getDryrunExercise()->getExerciseAnimationGroup() != null) {
                foreach ($dryinject->getDryinjectDryrun()->getDryrunExercise()->getExerciseAnimationGroup()->getGroupUsers() as $user) {
                    $output[] = $this->getDryInjectData($request, $dryinject, $user);
                }
            }
        }

        return new Response(json_encode($output));
    }

    /**
     * Get Inject Data
     * @param Request $request
     * @param Inject $inject
     * @param User $user
     */
    public function getInjectData($request, $inject, $user)
    {
        $data = array();
        $data['id'] = $inject->getInjectId();
        $data['type'] = $inject->getInjectType();
        $data['callback_url'] = $request->getSchemeAndHttpHost() . '/api/injects/' . $inject->getInjectId() . '/status';
        $data['data'] = $this->getPersonalInjectContent(json_decode($inject->getInjectContent(), true), $user);
        $data['data']['content_header'] = $inject->getInjectHeader();
        $data['data']['content_footer'] = $inject->getInjectFooter();
        $data['data']['users'] = array();
        $data['data']['users'][] = $this->getUserData($user);
        $data['data']['replyto'] = $inject->getInjectIncident()->getIncidentEvent()->getEventExercise()->getExerciseMailExpediteur();
        return $data;
    }

    /**
     * Personnalisation du contenu de l'inject
     * @param mixed $content
     * @param User $user
     * @return mixed
     */
    public function getPersonalInjectContent($content, $user)
    {
        $searchArray = [
            '{{PRENOM}}',
            '{{NOM}}',
            '{{ORGANISATION}}'
        ];
        $replaceArray = [
            $user->getUserFirstname(),
            $user->getUserLastname(),
            $user->getUserOrganization()->getOrganizationName()
        ];
        return str_replace($searchArray, $replaceArray, $content);
    }

    /**
     * Get DryInject Data
     * @param Request $request
     * @param Dryinject $dryinject
     * @param User $user
     * @return mixed
     */
    public function getDryInjectData($request, $dryinject, $user)
    {
        $data = array();
        $data['id'] = $dryinject->getDryinjectId();
        $data['type'] = $dryinject->getDryinjectType();
        $data['callback_url'] = $request->getSchemeAndHttpHost() . '/api/dryinjects/' . $dryinject->getDryinjectId() . '/status';
        $data['data'] = $this->getPersonalInjectContent(json_decode($dryinject->getDryinjectContent(), true), $user);
        $data['data']['content_header'] = $dryinject->getDryinjectDryrun()->getDryrunExercise()->getExerciseMessageHeader();
        $data['data']['content_footer'] = $dryinject->getDryinjectDryrun()->getDryrunExercise()->getExerciseMessageFooter();
        $data['data']['users'] = array();
        $data['data']['users'][] = $this->getUserData($user);
        $data['data']['replyto'] = $dryinject->getDryinjectDryrun()->getDryrunExercise()->getExerciseMailExpediteur();
        return $data;
    }

    /**
     * Get User Data
     * @param User $user
     * @return mixed
     */
    public function getUserData($user)
    {
        $userData = array();
        $userData['user_firstname'] = $user->getUserFirstname();
        $userData['user_lastname'] = $user->getUserLastname();
        $userData['user_email'] = $user->getUserEmail();
        $userData['user_email2'] = $user->getUserEmail2();
        $userData['user_phone'] = $user->getUserPhone();
        $userData['user_phone2'] = $user->getUserPhone2();
        $userData['user_phone3'] = $user->getUserPhone3();
        $userData['user_pgp_key'] = base64_encode($user->getUserPgpKey());
        $userData['user_organization'] = array();
        $userData['user_organization']['organization_name'] = $user->getUserOrganization()->getOrganizationName();
        return $userData;
    }

    /**
     * @OA\Property(
     *    description="Update the status of an inject",
     * )
     * @Rest\View(serializerGroups={"injectStatus"})
     * @Rest\Post("/api/injects/{inject_id}/status")
     */
    public function updateInjectStatusAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->getDoctrine()->getManager();
        $inject = $em->getRepository('App:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject)) {
            return $this->injectNotFound();
        }

        /** @var InjectStatus $status */
        $status = $inject->getInjectStatus();
        $status->setStatusName($request->request->get('status'));
        $status->setStatusMessage(json_encode($request->request->get('message')));
        $status->setStatusExecution($request->request->get('execution'));
        $status->setStatusDate(new DateTime());

        $em->persist($status);
        $em->flush();

        return $status;
    }

    /**
     * @OA\Property(
     *    description="Update the status of an dryinject",
     * )
     * @Rest\View(serializerGroups={"dryinjectStatus"})
     * @Rest\Post("/api/dryinjects/{dryinject_id}/status")
     */
    public function updateDryinjectStatusAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->getDoctrine()->getManager();
        $dryinject = $em->getRepository('App:Dryinject')->find($request->get('dryinject_id'));
        /* @var $dryinject Dryinject */

        if (empty($dryinject)) {
            return $this->dryinjectNotFound();
        }

        /** @var DryinjectStatus $status */
        $status = $dryinject->getDryinjectStatus();
        $status->setStatusName($request->request->get('status'));
        $status->setStatusMessage(json_encode($request->request->get('message')));
        $status->setStatusExecution($request->request->get('execution'));
        $status->setStatusDate(new DateTime());

        $em->persist($status);
        $em->flush();

        return $status;
    }

    private function dryinjectNotFound()
    {
        return View::create(['message' => 'Dryinject not found'], Response::HTTP_NOT_FOUND);
    }
}
