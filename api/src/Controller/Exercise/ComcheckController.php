<?php

namespace App\Controller\Exercise;

use App\Entity\DryinjectStatus;
use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Exercise;
use App\Form\Type\ComcheckType;
use App\Entity\Comcheck;
use App\Entity\ComcheckStatus;

class ComcheckController extends BaseController
{

    /**
     * @SWG\Property(
     *    description="List comchecks of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"comcheck"})
     * @Rest\Get("/exercises/{exercise_id}/comchecks")
     */
    public function getExercisesComchecksAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comchecks = $em->getRepository('App:Comcheck')->findBy(['comcheck_exercise' => $exercise]);
        /* @var $comchecks Comcheck[] */

        foreach ($comchecks as &$comcheck) {
            $comcheck->computeComcheckFinished();
            $comcheck->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $comcheck->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }
        return $comchecks;
    }

    /**
     * @SWG\Property(
     *    description="Read a comcheck"
     * )
     *
     * @Rest\View(serializerGroups={"comcheck"})
     * @Rest\Get("/exercises/{exercise_id}/comchecks/{comcheck_id}")
     */
    public function getExerciseComcheckAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comcheck = $em->getRepository('App:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise) {
            return $this->comcheckNotFound();
        }

        $comcheck->computeComcheckFinished();
        $comcheck->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
        $comcheck->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));

        return $comcheck;
    }

    /**
     * @SWG\Property(description="Create a comcheck")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"comcheck"})
     * @Rest\Post("/exercises/{exercise_id}/comchecks")
     */
    public function postExercisesComchecksAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
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
            $users = [];
            foreach ($comcheck->getComcheckAudience()->getAudienceSubaudiences() as $subaudience) {
                $subaudienceUsers = $subaudience->getSubaudienceUsers();
                foreach ($subaudienceUsers as $user) {
                    $user->setUserSubaudience($subaudience->getSubaudienceName());
                    $users[$user->getUserId()] = $user;
                }
            }

            $link = $this->getParameter('protocol') . '://' . $request->getHost() . '/comcheck/' . '${user_comcheck_id}';
            $data = array();
            $data['data'] = array();
            $data['data']['sender'] = $this->getParameter('mail_sender');
            $data['data']['subject'] = '[' . strtoupper($exercise->getExerciseName()) . '] ' . $comcheck->getComcheckSubject();
            $data['data']['body'] = $comcheck->getComcheckMessage() . '<br /><br /><a href="' . $link . '">' . $link . '</a><br /><br />' . $comcheck->getComcheckFooter();
            $data['data']['users'] = array();

            foreach ($users as $key => $user) {
                $status = new ComcheckStatus();
                $status->setStatusComcheck($comcheck);
                $status->setStatusUser($user);
                $status->setStatusLastUpdate(new \DateTime());
                $status->setStatusState(0);
                $em->persist($status);
                $em->flush();

                $userData = array();
                $userData['user_comcheck_id'] = $status->getStatusId();
                $userData['user_firstname'] = $user->getUserFirstname();
                $userData['user_lastname'] = $user->getUserLastname();
                $userData['user_email'] = $user->getUserEmail();
                $userData['user_email2'] = $user->getUserEmail2();
                $userData['user_phone'] = $user->getUserPhone();
                $userData['user_phone2'] = $user->getUserPhone2();
                $userData['user_phone3'] = $user->getUserPhone3();
                $userData['user_organization'] = array();
                $userData['user_organization']['organization_name']= $user->getUserOrganization()->getOrganizationName();
                $data['data']['users'][] = $userData;
            }

            $url = $this->getParameter('worker_url') . '/cxf/worker/openex_email';
            $response = \Httpful\Request::post($url)->sendsJson()->body($data)->send();

            return $comcheck;
        } else {
            return $form;
        }
    }

    /**
     * @SWG\Property(
     *    description="Delete a comcheck"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"comcheck"})
     * @Rest\Delete("/exercises/{exercise_id}/comchecks/{comcheck_id}")
     */
    public function removeExercisesComcheckAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $comcheck = $em->getRepository('App:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise) {
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
