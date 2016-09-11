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
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcher;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Form\Type\ExerciseType;
use APIBundle\Entity\Exercise;

class ExerciseController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List exercises"
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises")
     * @QueryParam(name="offset", requirements="\d+", default="", description="Start index")
     * @QueryParam(name="limit", requirements="\d+", default="", description="End index")
     */
    public function getExercisesAction(Request $request, ParamFetcher $paramFetcher)
    {
        $this->denyAccessUnlessGranted('select_all', new Exercise());

        $exercises = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->findAll();
        /* @var $exercises Exercise[] */

        return $exercises;
    }

    /**
     * @ApiDoc(
     *    description="Read an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises/{exercise_id}")
     */
    public function getExerciseAction(Request $request)
    {
        $exercise = $this->get('doctrine.orm.entity_manager')
            ->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);
        return $exercise;
    }

    /**
     * @ApiDoc(
     *    description="Create a new exercise",
     *    input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"exercise"})
     * @Rest\Post("/exercises")
     */
    public function postExercisesAction(Request $request)
    {
        $exercise = new Exercise();
        $this->denyAccessUnlessGranted('insert', $exercise);

        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $user_id = $this->get('security.token_storage')->getToken()->getUser()->getUserId();
            $exercise->setExerciseOwner($user_id);
            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($exercise);
            $em->flush();

            return $exercise;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an exercise"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"exercise"})
     * @Rest\Delete("/exercises/{exercise_id}")
     */
    public function removeExerciseAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')
            ->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if ($exercise) {
            $this->denyAccessUnlessGranted('delete', $exercise);
            $em->remove($exercise);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Replace an exercise",
     *   input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Put("/exercises/{exercise_id}")
     */
    public function updateExerciseAction(Request $request)
    {
        return $this->updateExercise($request, true);
    }

    /**
     * @ApiDoc(
     *    description="Update an exercise",
     *    input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
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
            return $this->exerciseNotFound();
        }
        $this->denyAccessUnlessGranted('update', $exercise);

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

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}