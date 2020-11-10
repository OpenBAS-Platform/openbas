<?php

namespace App\Controller\Exercise\Objective;

use App\Controller\Base\BaseController;
use App\Entity\Exercise;
use App\Entity\Objective;
use App\Entity\Subobjective;
use App\Form\Type\SubobjectiveType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SubobjectiveController extends BaseController
{

    /**
     * @OA\Property(
     *    description="List subobjectives of an objective"
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Get("/api/exercises/{exercise_id}/objectives/{objective_id}/subobjectives")
     */
    public function getExercisesObjectiveSubobjectivesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() != $exercise) {
            return $this->objectiveNotFound();
        }

        $subobjectives = $em->getRepository('App:Subobjective')->findBy(['subobjective_objective' => $objective]);
        /* @var $subobjectives Subobjective[] */

        foreach ($subobjectives as &$subobjective) {
            $subobjective->setSubobjectiveExercise($exercise->getExerciseId());
            $subobjective->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $subobjective->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }

        return $subobjectives;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function objectiveNotFound()
    {
        return View::create(['message' => 'Objective not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Create a subobjective")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"subobjective"})
     * @Rest\Post("/api/exercises/{exercise_id}/objectives/{objective_id}/subobjectives")
     */
    public function postExercisesObjectiveSubobjectivesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() != $exercise) {
            return $this->objectiveNotFound();
        }

        $subobjective = new Subobjective();
        $form = $this->createForm(SubobjectiveType::class, $subobjective);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $subobjective->setSubobjectiveObjective($objective);
            $em->persist($subobjective);
            $em->flush();
            $subobjective->setSubobjectiveExercise($exercise->getExerciseId());
            return $subobjective;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Property(
     *    description="Delete a subobjective"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"subobjective"})
     * @Rest\Delete("/api/exercises/{exercise_id}/objectives/{objective_id}/subobjectives/{subobjective_id}")
     */
    public function removeExercisesObjectiveSubobjectiveAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() != $exercise) {
            return $this->objectiveNotFound();
        }

        $subobjective = $em->getRepository('App:Subobjective')->find($request->get('subobjective_id'));
        /* @var $subobjective Subobjective */

        if (empty($subobjective) || $subobjective->getSubobjectiveObjective() != $objective) {
            return $this->subobjectiveNotFound();
        }

        $em->remove($subobjective);
        $em->flush();
    }

    private function subobjectiveNotFound()
    {
        return View::create(['message' => 'Subobjective not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Update a subobjective")
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Put("/api/exercises/{exercise_id}/objectives/{objective_id}/subobjectives/{subobjective_id}")
     */
    public function updateExercisesObjectiveSubobjectiveAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $objective = $em->getRepository('App:Objective')->find($request->get('objective_id'));
        /* @var $objective Objective */

        if (empty($objective) || $objective->getObjectiveExercise() != $exercise) {
            return $this->objectiveNotFound();
        }

        $subobjective = $em->getRepository('App:Subobjective')->find($request->get('subobjective_id'));
        /* @var $subobjective Subobjective */

        if (empty($subobjective) || $subobjective->getSubobjectiveObjective() != $objective) {
            return $this->subobjectiveNotFound();
        }

        $form = $this->createForm(SubobjectiveType::class, $subobjective);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($subobjective);
            $em->flush();
            $subobjective->setSubobjectiveExercise($exercise->getExerciseId());
            return $subobjective;
        } else {
            return $form;
        }
    }
}
