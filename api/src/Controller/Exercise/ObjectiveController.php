<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Exercise;
use App\Form\Type\ObjectiveType;
use App\Entity\Objective;

class ObjectiveController extends BaseController
{
    /**
     * @SWG\Property(
     *    description="List objectives"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/exercises/{exercise_id}/objectives")
     */
    public function getExercisesObjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objectives = $em->getRepository('App:Objective')->findBy(['objective_exercise' => $exercise]);
        /* @var $objectives Objective[] */

        foreach ($objectives as &$objective) {
            $objective->setUserCanUpdate($this->hasGranted(self::UPDATE, $objective));
            $objective->setUserCanDelete($this->hasGranted(self::DELETE, $objective));
        }

        return $objectives;
    }

    /**
     * @SWG\Property(
     *    description="Read an objective"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function getExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() !== $exercise) {
            return $this->objectiveNotFound();
        }

        $objective->setUserCanUpdate($this->hasGranted(self::UPDATE, $objective));
        $objective->setUserCanDelete($this->hasGranted(self::DELETE, $objective));

        return $objective;
    }

    /**
     * @SWG\Property(description="Create an objective")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"objective"})
     * @Rest\Post("/exercises/{exercise_id}/objectives")
     */
    public function postExercisesObjectivesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
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
     * @SWG\Property(
     *    description="Delete an objective"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"objective"})
     * @Rest\Delete("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function removeExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() !== $exercise) {
            return $this->objectiveNotFound();
        }

        $em->remove($objective);
        $em->flush();
    }

    /**
     * @SWG\Property(description="Update an objective")
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Put("/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function updateExercisesObjectiveAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
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
            $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
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
