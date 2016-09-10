<?php

namespace APIBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use APIBundle\Form\Type\ExerciseType;
use APIBundle\Entity\Exercise;

class ExerciseController extends Controller
{
    /**
     * @Rest\View()
     * @Rest\Get("/exercises")
     */
    public function getExercisesAction(Request $request)
    {
        $exercises = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->findAll();
        /* @var $exercises Exercise[] */

        return $exercises;
    }

    /**
     * @Rest\View()
     * @Rest\Get("/exercises/{exercise_id}")
     */
    public function getExerciseAction(Request $request)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
        }

        return $exercise;
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_CREATED)
     * @Rest\Post("/exercises")
     */
    public function postExercisesAction(Request $request)
    {
        $exercise = new Exercise();
        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($exercise);
            $em->flush();
            return $exercise;
        } else {
            return $form;
        }
    }

    /**
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT)
     * @Rest\Delete("/exercises/{exercise_id}")
     */
    public function removeExerciseAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if ($exercise) {
            $em->remove($exercise);
            $em->flush();
        }
    }

    /**
     * @Rest\View()
     * @Rest\Put("/exercises/{exercise_id}")
     */
    public function updateExerciseAction(Request $request)
    {
        return $this->updateExercise($request, true);
    }

    /**
     * @Rest\View()
     * @Rest\Patch("/exercises/{exercise_id}")
     */
    public function patchExerciseAction(Request $request)
    {
        return $this->updateExercise($request, false);
    }

    private function updateExercise(Request $request, $clearMissing)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
        }

        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all(), $clearMissing);

        if ($form->isValid()) {
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($exercise);
            $em->flush();
            return $exercise;
        } else {
            return $form;
        }
    }
}