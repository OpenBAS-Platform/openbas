<?php

namespace APIBundle\Controller\Exercise\Dryrun;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Dryrun;
use APIBundle\Entity\Dryinject;

class DryinjectController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List dryinjects of a dryrun"
     * )
     *
     * @Rest\View(serializerGroups={"dryinject"})
     * @Rest\Get("/exercises/{exercise_id}/dryruns/{dryrun_id}/dryinjects")
     */
    public function getExercisesDryrunsDryinjectsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $dryrun = $em->getRepository('APIBundle:Dryrun')->find($request->get('dryrun_id'));
        /* @var $dryrun Dryrun */

        if (empty($dryrun) || $dryrun->getDryrunExercise() !== $exercise) {
            return $this->dryrunNotFound();
        }

        $dryinjects = $em->getRepository('APIBundle:Dryinject')->findBy(['dryinject_dryrun' => $dryrun]);

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