<?php

namespace App\Controller\Exercise\Audience;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Exercise;
use App\Entity\Subaudience;
use App\Form\Type\SubaudienceType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SubaudienceController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List subaudiences of an audience"
     * )
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Get("/api/exercises/{exercise_id}/audiences/{audience_id}/subaudiences")
     */
    public function getExercisesAudiencesSubaudiencesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }
        $this->denyAccessUnlessGranted('select', $exercise);
        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }
        $subaudiences = $em->getRepository('App:Subaudience')->findBy(['subaudience_audience' => $audience]);
        /* @var $subaudiences Subaudience[] */
        foreach ($subaudiences as &$subaudience) {
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
            $subaudience->setUserCanUpdate($this->hasGranted(self::UPDATE, $subaudience));
            $subaudience->setUserCanDelete($this->hasGranted(self::DELETE, $subaudience));
        }
        return $subaudiences;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function audienceNotFound()
    {
        return View::create(['message' => 'Audience not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Create a subaudience")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"subaudience"})
     * @Rest\Post("/api/exercises/{exercise_id}/audiences/{audience_id}/subaudiences")
     */
    public function postExercisesAudiencesSubaudiencesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }
        $this->denyAccessUnlessGranted('update', $exercise);
        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }
        $subaudience = new Subaudience();
        $subaudience->setSubaudienceName($request->get('subaudience_name'));
        $subaudience->setSubaudienceAudience($audience);
        $subaudience->setSubaudienceEnabled(true);
        $subaudience->setUserCanUpdate($this->hasGranted(self::UPDATE, $subaudience));
        $subaudience->setUserCanDelete($this->hasGranted(self::DELETE, $subaudience));
        $em->persist($subaudience);
        $em->flush();
        $subaudience->setSubaudienceExercise($exercise->getExerciseId());
        return $subaudience;
    }

    /**
     * @OA\Property(
     *    description="Delete a subaudience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"subaudience"})
     * @Rest\Delete("/api/exercises/{exercise_id}/audiences/{audience_id}/subaudiences/{subaudience_id}")
     */
    public function removeExercisesAudiencesSubaudienceAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }
        $this->denyAccessUnlessGranted('update', $exercise);
        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */
        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }
        $subaudience = $em->getRepository('App:Subaudience')->find($request->get('subaudience_id'));
        /* @var $subaudience Subaudience */

        if (empty($subaudience) || $subaudience->getSubaudienceAudience() != $audience) {
            return $this->subaudienceNotFound();
        }
        $em->remove($subaudience);
        $em->flush();
    }

    private function subaudienceNotFound()
    {
        return View::create(['message' => 'Subaudience not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Update a subaudience")
     *
     * @Rest\View(serializerGroups={"subaudience"})
     * @Rest\Put("/api/exercises/{exercise_id}/audiences/{audience_id}/subaudiences/{subaudience_id}")
     */
    public function updateExercisesAudiencesSubaudienceAction(Request $request)
    {
        $subAudienceUsersData = array();
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }
        $this->denyAccessUnlessGranted('update', $exercise);
        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() != $exercise) {
            return $this->audienceNotFound();
        }
        $subaudience = $em->getRepository('App:Subaudience')->find($request->get('subaudience_id'));
        /* @var $subaudience Subaudience */

        if (empty($subaudience) || $subaudience->getSubaudienceAudience() != $audience) {
            return $this->subaudienceNotFound();
        }
        $form = $this->createForm(SubaudienceType::class, $subaudience);
        $subAudienceData = $request->request->all();
        $usersHasBeenUpdated = false;
        if (isset($subAudienceData['subaudience_users'])) {
            $usersHasBeenUpdated = true;
            $subAudienceUsersData = $subAudienceData['subaudience_users'];
            unset($subAudienceData['subaudience_users']);
        }
        $form->submit($subAudienceData, false);
        if ($form->isValid()) {
            if( $usersHasBeenUpdated ) {
                foreach ($subaudience->getSubaudienceUsers() as $subaudienceUser) {
                    $isUserFoundInSubaudience = false;
                    foreach ($subAudienceUsersData as $key => $userId) {
                        if ($userId === $subaudienceUser->getUserId()) {
                            $isUserFoundInSubaudience = true;
                        }
                    }
                    if (!$isUserFoundInSubaudience) {
                        $subaudience->removeSubaudienceUser($subaudienceUser);
                    }
                }
                if (count($subAudienceUsersData) > 0) {
                    foreach ($subAudienceUsersData as $key => $userId) {
                        $oUser = $em->getRepository('App:User')->find($userId);
                        if ($oUser) {
                            $subaudience->addSubaudienceUser($oUser);
                        }
                    }
                }
            }
            $em->persist($subaudience);
            $em->flush();
            $em->clear();
            $subaudience = $em->getRepository('App:Subaudience')->find($request->get('subaudience_id'));
            $subaudience->setSubaudienceExercise($exercise->getExerciseId());
            $subaudience->setUserCanUpdate($this->hasGranted(self::UPDATE, $audience));
            $subaudience->setUserCanDelete($this->hasGranted(self::UPDATE, $audience));
            return $subaudience;
        } else {
            return $form;
        }
    }
}
