<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Exercise;
use App\Entity\Objective;
use App\Form\Type\ObjectiveType;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use JetBrains\PhpStorm\Pure;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ObjectiveController extends BaseController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine, TokenStorageInterface $tokenStorage)
    {
        $this->doctrine = $doctrine;
        parent::__construct($tokenStorage);
    }
    
    /**
     * @OA\Response(
     *    response=200,
     *    description="List objectives"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/api/exercises/{exercise_id}/objectives")
     */
    public function getExercisesObjectivesAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Read an objective"
     * )
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Get("/api/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function getExercisesObjectiveAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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

    private function objectiveNotFound()
    {
        return View::create(['message' => 'Objective not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Create an objective")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"objective"})
     * @Rest\Post("/api/exercises/{exercise_id}/objectives")
     */
    public function postExercisesObjectivesAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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
     * @OA\Response(
     *    response=200,
     *    description="Delete an objective"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"objective"})
     * @Rest\Delete("/api/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function removeExercisesObjectiveAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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
     * @OA\Response(
     *    response=200,description="Update an objective")
     *
     * @Rest\View(serializerGroups={"objective"})
     * @Rest\Put("/api/exercises/{exercise_id}/objectives/{objective_id}")
     */
    public function updateExercisesObjectiveAction(Request $request)
    {
        $em = $this->doctrine->getManager();
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
}
