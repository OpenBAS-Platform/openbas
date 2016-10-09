<?php

namespace APIBundle\Controller;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\Grant;
use APIBundle\Form\Type\ExerciseType;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ExerciseController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List exercises"
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises")
     */
    public function getExercisesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if ($user->isAdmin()) {
            $exercises = $em->getRepository('APIBundle:Exercise')->findAll();
        } else {
            $grants = $user->getUserGrants();
            /* @var $grants Grant[] */
            $exercises = [];
            foreach ($grants as $grant) {
                $exercises[] = $grant->getGrantExercise();
            }
        }

        foreach( $exercises as &$exercise ) {

            if( file_exists($this->get('kernel')->getRootDir().'/../web/images/exercises/' . $exercise->getExerciseId() . '.png') ) {
                $exercise->setExerciseImage($this->getParameter('protocol') . '://' . $this->getParameter('hostname') . '/images/exercises/' . $exercise->getExerciseId() . '.png');
            } else {
                $exercise->setExerciseImage($this->getParameter('protocol') . '://' . $this->getParameter('hostname') . '/images/exercises/default.png');
            }
        }

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
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        if( file_exists($this->get('kernel')->getRootDir().'/../web/images/exercises/' . $exercise->getExerciseId() . '.png') ) {
            $exercise->setExerciseImage($this->getParameter('protocol') . '://' . $this->getParameter('hostname') . '/images/exercises/' . $exercise->getExerciseId() . '.png');
        } else {
            $exercise->setExerciseImage($this->getParameter('protocol') . '://' . $this->getParameter('hostname') . '/images/exercises/default.png');
        }

        return $exercise;
    }

    /**
     * @ApiDoc(
     *    description="Create an exercise",
     *    input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"exercise"})
     * @Rest\Post("/exercises")
     */
    public function postExercisesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();

        $status = $em->getRepository('APIBundle:Status')->findOneBy(['status_name' => 'draft']);

        $exercise = new Exercise();
        $exercise->setExerciseStatus($status);
        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $exercise->setExerciseOwner($user);
            $exercise->setExerciseStartDate(date('c', strtotime($exercise->getExerciseStartDate())));
            $exercise->setExerciseEndDate(date('c', strtotime($exercise->getExerciseEndDate())));
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
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
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
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all(), $clearMissing);

        if ($form->isValid()) {
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