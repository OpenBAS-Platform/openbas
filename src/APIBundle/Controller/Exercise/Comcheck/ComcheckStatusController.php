<?php

namespace APIBundle\Controller\Exercise\Comcheck;

use APIBundle\Entity\Dryinject;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Comcheck;
use APIBundle\Entity\ComcheckStatus;

class ComcheckStatusController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List statuses of a comcheck"
     * )
     *
     * @Rest\View(serializerGroups={"comcheckStatus"})
     * @Rest\Get("/exercises/{exercise_id}/comchecks/{comcheck_id}/statuses")
     */
    public function getExercisesComchecksStatusesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $comcheck = $em->getRepository('APIBundle:Comcheck')->find($request->get('comcheck_id'));
        /* @var $comcheck Comcheck */

        if (empty($comcheck) || $comcheck->getComcheckExercise() !== $exercise) {
            return $this->comcheckNotFound();
        }

        $statuses = $em->getRepository('APIBundle:ComcheckStatus')->findBy(['status_comcheck' => $comcheck]);

        return $statuses;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function comcheckNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Comcheck not found'], Response::HTTP_NOT_FOUND);
    }
}