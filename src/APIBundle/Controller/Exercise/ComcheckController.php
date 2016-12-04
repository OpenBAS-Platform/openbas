<?php

namespace APIBundle\Controller\Exercise;

use APIBundle\Entity\DryinjectStatus;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\ComcheckType;
use APIBundle\Entity\Comcheck;
use APIBundle\Entity\ComcheckStatus;

class ComcheckController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List comchecks of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"comcheck"})
     * @Rest\Get("/exercises/{exercise_id}/comchecks")
     */
    public function getExercisesComchecksAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comchecks = $em->getRepository('APIBundle:Comcheck')->findBy(['comcheck_exercise' => $exercise]);

        foreach( $comchecks as &$comcheck ) {
            $comcheck->computeComcheckFinished();
        }
        return $comchecks;
    }

    /**
     * @ApiDoc(
     *    description="Read a comcheck"
     * )
     *
     * @Rest\View(serializerGroups={"comcheck"})
     * @Rest\Get("/exercises/{exercise_id}/comchecks/{comcheck_id}")
     */
    public function getExerciseComcheckAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comcheck = $em->getRepository('APIBundle:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise ) {
            return $this->comcheckNotFound();
        }

        $comcheck->computeComcheckFinished();

        return $comcheck;
    }

    /**
     * @ApiDoc(
     *    description="Create a comcheck",
     *    input={"class"=ComcheckType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"comcheck"})
     * @Rest\Post("/exercises/{exercise_id}/comchecks")
     */
    public function postExercisesComchecksAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $comcheck = new Comcheck();
        $form = $this->createForm(ComcheckType::class, $comcheck);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $comcheck->setComcheckExercise($exercise);
            $comcheck->setComcheckStartDate(new \DateTime());
            $em->persist($comcheck);
            $em->flush();

            // create individual statuses for all user of the audience
            $users = $comcheck->getComcheckAudience()->getAudienceUsers();

            $link = $this->getParameter('protocol') . '://' . $request->getHost() . '/comcheck/' . '${user_comcheck_id}';
            $data = array();
            $data['data'] = array();
            $data['data']['sender'] = $this->getParameter('mail_sender');
            $data['data']['subject'] = '[' . strtoupper($exercise->getExerciseName()) . '] ' . $comcheck->getComcheckSubject();
            $data['data']['body'] = $comcheck->getComcheckMessage() . '<br /><br /><a href="' . $link . '">' . $link . '</a><br /><br />' . $comcheck->getComcheckFooter();
            $data['data']['users'] = array();
            foreach( $users as $user ) {
                $status = new ComcheckStatus();
                $status->setStatusComcheck($comcheck);
                $status->setStatusUser($user);
                $status->setStatusLastUpdate(new \DateTime());
                $em->persist($status);
                $em->flush();

                $userData = array();
                $userData['user_comcheck_id'] = $status->getStatusId();
                $userData['user_firstname'] = $user->getUserFirstname();
                $userData['user_lastname'] = $user->getUserLastname();
                $userData['user_email'] = $user->getUserEmail();
                $userData['user_phone'] = $user->getUserPhone();
                $userData['user_organization'] = array();
                $userData['user_organization']['organization_name']= $user->getUserOrganization()->getOrganizationName();
                $data['data']['users'][] = $userData;
            }

            $url = $this->getParameter('worker_url') . '/cxf/worker/email';
            $response = \Httpful\Request::post($url)->sendsJson()->body($data)->send();

            return $comcheck;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a comcheck"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"comcheck"})
     * @Rest\Delete("/exercises/{exercise_id}/comchecks/{comcheck_id}")
     */
    public function removeExercisesComcheckAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $comcheck = $em->getRepository('APIBundle:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise ) {
            return $this->comcheckNotFound();
        }

        $em->remove($comcheck);
        $em->flush();
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function comcheckNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Comcheck not found'], Response::HTTP_NOT_FOUND);
    }
}