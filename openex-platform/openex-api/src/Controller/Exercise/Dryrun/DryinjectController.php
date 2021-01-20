<?php

namespace App\Controller\Exercise\Dryrun;

use App\Controller\Base\BaseController;
use App\Entity\Dryrun;
use App\Entity\Exercise;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DryinjectController extends BaseController
{
    /**
     * @OA\Response(
     *    response=200,
     *    description="List dryinjects of a dryrun"
     * )
     *
     * @Rest\View(serializerGroups={"dryinject"})
     * @Rest\Get("/api/exercises/{exercise_id}/dryruns/{dryrun_id}/dryinjects")
     */
    public function getExercisesDryrunsDryinjectsAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $dryrun = $em->getRepository('App:Dryrun')->find($request->get('dryrun_id'));
        /* @var $dryrun Dryrun */

        if (empty($dryrun) || $dryrun->getDryrunExercise() !== $exercise) {
            return $this->dryrunNotFound();
        }

        $dryinjects = $em->getRepository('App:Dryinject')->findBy(['dryinject_dryrun' => $dryrun]);
        foreach ($dryinjects as &$dryinject) {
            $dryinject->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $dryinject->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }

        return $dryinjects;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function dryrunNotFound()
    {
        return View::create(['message' => 'Dryrun not found'], Response::HTTP_NOT_FOUND);
    }
}
