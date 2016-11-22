<?php

namespace APIBundle\Controller\Exercise\Objective;

use APIBundle\Entity\Subobjective;
use APIBundle\Form\Type\SubobjectiveType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\ObjectiveType;
use APIBundle\Entity\Objective;

class SubobjectiveController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List subobjectives of objective"
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Get("/exercises/{exercise_id}/objectives/{objective_id}/subobjectives")
     */
    public function getExercisesObjectiveSubobjectivesAction(Request $request)
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

        if (empty($objective)) {
            return $this->objectiveNotFound();
        }

        $subobjectives = $em->getRepository('APIBundle:Subobjective')->findBy(['subobjective_objective' => $objective]);

        return $subobjectives;
    }

    /**
     * @ApiDoc(
     *    description="Create a subobjective",
     *    input={"class"=SubobjectiveType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"subobjective"})
     * @Rest\Post("/exercises/{exercise_id}/objectives/{objective_id}/subobjectives")
     */
    public function postExercisesObjectiveSubobjectivesAction(Request $request)
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

        if (empty($objective)) {
            return $this->objectiveNotFound();
        }

        $subobjective = new Subobjective();
        $form = $this->createForm(SubobjectiveType::class, $subobjective);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $subobjective->setSubobjectiveObjective($objective);
            $em->persist($subobjective);
            $em->flush();
            return $subobjective;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a subobjective"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"subobjective"})
     * @Rest\Delete("/exercises/{exercise_id}/objectives/{objective_id}/subobjectives/{subobjective_id}")
     */
    public function removeExercisesObjectiveSubobjectiveAction(Request $request)
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

        if (empty($objective)) {
            return $this->objectiveNotFound();
        }

        $subobjective = $em->getRepository('APIBundle:Subobjective')->find($request->get('subobjective_id'));
        /* @var $objective Subobjective */

        if (empty($subobjective)) {
            return $this->subobjectiveNotFound();
        }

        $em->remove($subobjective);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update a subobjective",
     *   input={"class"=SubobjectiveType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"subobjective"})
     * @Rest\Put("/exercises/{exercise_id}/objectives/{objective_id}/subobjectives/{subobjective_id}")
     */
    public function updateExercisesObjectiveSubobjectiveAction(Request $request)
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

        if (empty($objective)) {
            return $this->objectiveNotFound();
        }

        $subobjective = $em->getRepository('APIBundle:Subobjective')->find($request->get('subobjective_id'));
        /* @var $objective Subobjective */

        if (empty($subobjective)) {
            return $this->subobjectiveNotFound();
        }

        $form = $this->createForm(SubobjectiveType::class, $subobjective);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($subobjective);
            $em->flush();
            return $subobjective;
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

    private function subobjectiveNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Subobjective not found'], Response::HTTP_NOT_FOUND);
    }
}