<?php

namespace APIBundle\Controller\Exercise;


use APIBundle\Entity\DryinjectStatus;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\DryrunType;
use APIBundle\Entity\Dryrun;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;
use APIBundle\Entity\Dryinject;

class DryrunController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List dryruns of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"dryrun"})
     * @Rest\Get("/exercises/{exercise_id}/dryruns")
     */
    public function getExercisesDryrunsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $dryruns = $em->getRepository('APIBundle:Dryrun')->findBy(['dryrun_exercise' => $exercise]);

        foreach( $dryruns as &$dryrun) {
            $dryinjects = $em->getRepository('APIBundle:Dryinject')->findBy(['dryinject_dryrun' => $dryrun]);
            $dryrun->computeDryRunFinished($dryinjects);
        }

        return $dryruns;
    }

    /**
     * @ApiDoc(
     *    description="Read a dryrun"
     * )
     *
     * @Rest\View(serializerGroups={"dryrun"})
     * @Rest\Get("/exercises/{exercise_id}/dryruns/{dryrun_id}")
     */
    public function getExerciseDryrunAction(Request $request)
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

        if (empty($dryrun) || $dryrun->getDryrunExercise() !== $exercise ) {
            return $this->dryrunNotFound();
        }

        return $dryrun;
    }

    /**
     * @ApiDoc(
     *    description="Create a dryrun",
     *    input={"class"=DryrunType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"dryrun"})
     * @Rest\Post("/exercises/{exercise_id}/dryruns")
     */
    public function postExercisesDryrunsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $dryrun = new Dryrun();
        $form = $this->createForm(DryrunType::class, $dryrun);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $dryrun->setDryrunExercise($exercise);
            $dryrun->setDryrunDate(new \DateTime());
            $em->persist($dryrun);
            $em->flush();

            // get all injects
            $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            $injects = array();
            /* @var $injects Inject[] */

            foreach ($events as $event) {
                $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
                }
            }

            // sort injects by date
            usort($injects, function($a, $b) {
                return $a->getInjectDate()->getTimestamp() - $b->getInjectDate()->getTimestamp();
            });

            // create new injects
            $dryinjects = array();
            $previousInject = null;
            $previousDryinject = null;
            foreach( $injects as $inject ) {
                $dryinject = new Dryinject();
                $dryinject->setDryinjectTitle($inject->getInjectTitle());
                $dryinject->setDryinjectContent($inject->getInjectContent());
                $dryinject->setDryinjectType($inject->getInjectType());
                $dryinject->setDryinjectDryrun($dryrun);

                // set the first inject to now
                if( $previousInject === null ) {
                    $dryinject->setDryinjectDate(new \DateTime());
                } else {
                    // compute the interval in seconds from the previous inject
                    $previousDate = $previousInject->getInjectDate()->getTimestamp();
                    $currentDate = $inject->getInjectDate()->getTimestamp();
                    $intervalInSeconds = $currentDate-$previousDate;

                    // accelerate the interval and create the interval object
                    $newInterval = new \DateInterval('PT'.round($intervalInSeconds/$dryrun->getDryrunSpeed()).'S');

                    // set the new datetime
                    $dryinject->setDryinjectDate($previousDryinject->getDryinjectDate()->add($newInterval));
                }

                // create the dryinject
                $em->persist($dryinject);
                $em->flush();

                // create the dryinject status
                $status = new DryinjectStatus();
                $status->setStatusName('PENDING');
                $status->setStatusDate(new \DateTime());
                $status->setStatusDryinject($dryinject);
                $em->persist($status);
                $em->flush();

                $previousInject = $inject;
                $previousDryinject = $dryinject;
            }

            $id = $dryrun->getDryrunId();
            $em->clear();
            $dryrun = $em->getRepository('APIBundle:Dryrun')->find($id);
            return $dryrun;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a dryrun"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"audience"})
     * @Rest\Delete("/exercises/{exercise_id}/dryruns/{dryrun_id}")
     */
    public function removeExercisesDryrunAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $dryrun = $em->getRepository('APIBundle:Dryrun')->find($request->get('dryrun_id'));
        /* @var $dryrun Dryrun */

        if ($dryrun) {
            $em->remove($dryrun);
            $em->flush();
        }
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