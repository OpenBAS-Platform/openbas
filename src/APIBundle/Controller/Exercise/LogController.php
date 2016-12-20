<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\LogType;
use APIBundle\Entity\Log;

class LogController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List logs"
     * )
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Get("/exercises/{exercise_id}/logs")
     */
    public function getExercisesLogsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $logs = $em->getRepository('APIBundle:Log')->findBy(['log_exercise' => $exercise]);
        /* @var $logs Log[] */

        return $logs;
    }

    /**
     * @ApiDoc(
     *    description="Read a log"
     * )
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Get("/exercises/{exercise_id}/logs/{log_id}")
     */
    public function getExercisesLogAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $log = $em->getRepository('APIBundle:Log')->find($request->get('log_id'));
        /* @var $log Log */

        if (empty($log) || $log->getLogExercise() !== $exercise) {
            return $this->logNotFound();
        }

        return $log;
    }

    /**
     * @ApiDoc(
     *    description="Create a log",
     *    input={"class"=LogType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"log"})
     * @Rest\Post("/exercises/{exercise_id}/logs")
     */
    public function postExercisesLogsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = new Log();
        $log->setLogExercise($exercise);
        $form = $this->createForm(LogType::class, $log);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $connectedUser = $this->get('security.token_storage')->getToken()->getUser();
            $log->setLogUser($connectedUser);
            $em->persist($log);
            $em->flush();
            return $log;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a log"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"log"})
     * @Rest\Delete("/exercises/{exercise_id}/logs/{log_id}")
     */
    public function removeExercisesLogAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = $em->getRepository('APIBundle:Log')->find($request->get('log_id'));
        /* @var $log Log */

        if (empty($log) || $log->getLogExercise() !== $exercise) {
            return $this->logNotFound();
        }

        $em->remove($log);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update a log",
     *   input={"class"=LogType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Put("/exercises/{exercise_id}/logs/{log_id}")
     */
    public function updateExercisesLogAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = $em->getRepository('APIBundle:Log')->find($request->get('log_id'));
        /* @var $log Log */

        if (empty($log) || $log->getLogExercise() !== $exercise) {
            return $this->logNotFound();
        }

        $form = $this->createForm(LogType::class, $log);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($log);
            $em->flush();
            $em->clear();
            $log = $em->getRepository('APIBundle:Log')->find($request->get('log_id'));
            return $log;
        } else {
            return $form;
        }
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function logNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Log not found'], Response::HTTP_NOT_FOUND);
    }
}