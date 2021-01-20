<?php

namespace App\Controller\Exercise;

use App\Entity\Exercise;
use App\Entity\Log;
use App\Form\Type\LogType;
use DateTime;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LogController extends AbstractController
{
    /**
     * @OA\Response(
     *    response=200,
     *    description="List logs"
     * )
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Get("/api/exercises/{exercise_id}/logs")
     */
    public function getExercisesLogsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $logs = $em->getRepository('App:Log')->findBy(['log_exercise' => $exercise]);
        /* @var $logs Log[] */

        foreach ($logs as &$log) {
            $log->sanitizeUser();
        }

        return $logs;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Read a log"
     * )
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Get("/api/exercises/{exercise_id}/logs/{log_id}")
     */
    public function getExercisesLogAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $log = $em->getRepository('App:Log')->find($request->get('log_id'));
        /* @var $log Log */

        if (empty($log) || $log->getLogExercise() !== $exercise) {
            return $this->logNotFound();
        }

        $log->sanitizeUser();
        return $log;
    }

    private function logNotFound()
    {
        return View::create(['message' => 'Log not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Create a log")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"log"})
     * @Rest\Post("/api/exercises/{exercise_id}/logs")
     */
    public function postExercisesLogsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = new Log();
        $form = $this->createForm(LogType::class, $log);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $connectedUser = $this->get('security.token_storage')->getToken()->getUser();
            $log->setLogUser($connectedUser);
            $log->setLogExercise($exercise);
            $log->setLogDate(new DateTime());
            $em->persist($log);
            $em->flush();
            $log->sanitizeUser();
            return $log;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Delete a log"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"log"})
     * @Rest\Delete("/api/exercises/{exercise_id}/logs/{log_id}")
     */
    public function removeExercisesLogAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = $em->getRepository('App:Log')->find($request->get('log_id'));
        /* @var $log Log */

        if (empty($log) || $log->getLogExercise() !== $exercise) {
            return $this->logNotFound();
        }

        $em->remove($log);
        $em->flush();
    }

    /**
     * @OA\Response(
     *    response=200,description="Update a log")
     *
     * @Rest\View(serializerGroups={"log"})
     * @Rest\Put("/api/exercises/{exercise_id}/logs/{log_id}")
     */
    public function updateExercisesLogAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $log = $em->getRepository('App:Log')->find($request->get('log_id'));
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
            $log = $em->getRepository('App:Log')->find($request->get('log_id'));
            $log->sanitizeUser();
            return $log;
        } else {
            return $form;
        }
    }
}
