<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\ObjectiveType;
use APIBundle\Entity\Objective;

class ObjectiveController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List objectives"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/exercises/{exercise_id}/objectives")
     */
    public function getExercisesObjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objectives = $em->getRepository('APIBundle:Objective')->findBy(['objective_exercise' => $exercise]);
        /* @var $objectives Objective[] */

        return $objectives;
    }

    /**
     * @ApiDoc(
     *    description="Read an objective"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function getExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objective = $em->getRepository('APIBundle:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() !== $exercise) {
            return $this->objectiveNotFound();
        }

        return $objective;
    }

    /**
     * @ApiDoc(
     *    description="Create an objective",
     *    input={"class"=ObjectiveType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"objective"})
     * @Rest\Post("/exercises/{exercise_id}/objectives")
     */
    public function postExercisesObjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = new Objective();
        $objective->setObjectiveExercise($exercise);
        $form = $this->createForm(ObjectiveType::class, $objective);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $em->persist($objective);
            $em->flush();
            return $objective;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an objective"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"objective"})
     * @Rest\Delete("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function removeExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('APIBundle:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() !== $exercise) {
            return $this->objectiveNotFound();
        }

        $em->remove($objective);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update an objective",
     *   input={"class"=ObjectiveType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Put("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function updateExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('APIBundle:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() !== $exercise) {
            return $this->objectiveNotFound();
        }

        $form = $this->createForm(ObjectiveType::class, $objective);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $em->persist($objective);
            $em->flush();
            $em->clear();
            $objective = $em->getRepository('APIBundle:Objective')->find($request->get('objective_id'));
            return $objective;
        } else {
            return $form;
        }
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function objectiveNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Objective not found'], Response::HTTP_NOT_FOUND);
    }
}