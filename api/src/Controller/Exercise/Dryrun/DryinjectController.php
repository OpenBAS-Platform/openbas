<?php

namespace App\Controller\Exercise\Dryrun;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Exercise;
use App\Entity\Dryrun;
use App\Entity\Dryinject;

class DryinjectController extends BaseController
{
    /**
     * @SWG\Property(
     *    description="List dryinjects of a dryrun"
     * )
     *
     * @Rest\View(serializerGroups={"dryinject"})
     * @Rest\Get("/exercises/{exercise_id}/dryruns/{dryrun_id}/dryinjects")
     */
    public function getExercisesDryrunsDryinjectsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
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
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function dryrunNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Dryrun not found'], Response::HTTP_NOT_FOUND);
    }
}
