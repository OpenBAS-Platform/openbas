<?php

namespace APIBundle\Controller\Exercise\Audience;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Audience;
use APIBundle\Entity\Subaudience;
use APIBundle\Form\Type\SubaudienceType;

class SubaudienceController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List subaudiences of an audience"
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}/subaudiences")
     */
    public function getExercisesAudienceSubaudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $objective = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }

        $subaudiences = $em->getRepository('APIBundle:Subaudience')->findBy(['subaudience_audience' => $audience]);
        /* @var $subaudiences Subaudience[] */

        foreach( $subaudiences as &$subaudience) {
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
        }

        return $subaudiences;
    }

    /**
     * @ApiDoc(
     *    description="Create a subaudience",
     *    input={"class"=SubaudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"subaudience"})
     * @Rest\Post("/exercises/{exercise_id}/audiences/{audience_id}/subaudiences")
     */
    public function postExercisesAudienceSubaudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }

        $subaudience = new Subaudience();
        $form = $this->createForm(SubaudienceType::class, $subaudience);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $subaudience->setSubaudienceAudience($audience);
            $subaudience->setSubaudienceEnabled(true);
            $em->persist($subaudience);
            $em->flush();
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
            return $subaudience;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a subaudience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"subaudience"})
     * @Rest\Delete("/exercises/{exercise_id}/audiences/{audience_id}/subaudience/{subaudience_id}")
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

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }

        $subaudience = $em->getRepository('APIBundle:Subaudience')->find($request->get('subaudience_id'));
        /* @var $subaudience Subaudience */

        if (empty($subaudience) || $subaudience->getSubaudienceAudience() != $audience) {
            return $this->subaudienceNotFound();
        }

        $em->remove($subaudience);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update a subaudience",
     *   input={"class"=SubaudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Put("/exercises/{exercise_id}/audiences/{audience_id}/subaudiences/{subaudience_id}")
     */
    public function updateExercisesAudienceSubaudienceAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }

        $subaudience = $em->getRepository('APIBundle:Subaudience')->find($request->get('subaudience_id'));
        /* @var $subaudience Subaudience */

        if (empty($subaudience) || $subaudience->getSubaudienceAudience() != $audience) {
            return $this->subaudienceNotFound();
        }

        $form = $this->createForm(SubaudienceType::class, $subaudience);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($subaudience);
            $em->flush();
            $em->clear();
            $subaudience = $em->getRepository('APIBundle:Subaudience')->find($request->get('subaudience_id'));
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
            return $subaudience;
        } else {
            return $form;
        }
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function audienceNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Audience not found'], Response::HTTP_NOT_FOUND);
    }

    private function subaudienceNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Subaudience not found'], Response::HTTP_NOT_FOUND);
    }
}