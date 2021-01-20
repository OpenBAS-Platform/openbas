<?php

namespace App\Controller\Exercise\Comcheck;

use App\Entity\Comcheck;
use App\Entity\Exercise;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ComcheckStatusController extends AbstractController
{
    /**
     * @OA\Response(
     *    response=200,
     *    description="List statuses of a comcheck"
     * )
     *
     * @Rest\View(serializerGroups={"comcheckStatus"})
     * @Rest\Get("/api/exercises/{exercise_id}/comchecks/{comcheck_id}/statuses")
     */
    public function getExercisesComchecksStatusesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comcheck = $em->getRepository('App:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise) {
            return $this->comcheckNotFound();
        }

        $statuses = $em->getRepository('App:ComcheckStatus')->findBy(['status_comcheck' => $comcheck]);

        return $statuses;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function comcheckNotFound()
    {
        return View::create(['message' => 'Comcheck not found'], Response::HTTP_NOT_FOUND);
    }
}
