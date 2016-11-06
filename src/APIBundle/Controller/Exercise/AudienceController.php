<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\AudienceType;
use APIBundle\Entity\Audience;

class AudienceController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List audiences"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/exercises/{exercise_id}/audiences")
     */
    public function getExercisesAudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise]);

        return $audiences;
    }

    /**
     * @ApiDoc(
     *    description="Read an audience"
     * )
     *
     * @Rest\View(serializerGroups={"event"})
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function getExerciseAudienceAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience)) {
            return $this->audienceNotFound();
        }

        return $audience;
    }

    /**
     * @ApiDoc(
     *    description="Create an audience",
     *    input={"class"=AudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"audience"})
     * @Rest\Post("/exercises/{exercise_id}/audiences")
     */
    public function postExercisesAudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = new Audience();
        $form = $this->createForm(AudienceType::class, $audience);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $audience->setAudienceExercise($exercise);
            $em->persist($audience);
            $em->flush();
            return $audience;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"audience"})
     * @Rest\Delete("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function removeExercisesAudienceAction(Request $request)
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

        if ($audience) {
            $em->remove($audience);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Update an audience",
     *   input={"class"=AudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Put("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function updateExercisesAudienceAction(Request $request)
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

        if (empty($audience)) {
            return $this->audienceNotFound();
        }

        $form = $this->createForm(AudienceType::class, $audience);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($audience);
            $em->flush();
            return $audience;
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
}