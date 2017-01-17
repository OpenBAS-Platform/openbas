<?php

namespace APIBundle\Controller\Exercise\Event\Incident\Inject;

use APIBundle\Entity\DryinjectStatus;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;

class TryController extends Controller
{
    /**
     * @ApiDoc(
     *    description="Try an inject"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"injectStatus"})
     * @Rest\Post("/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}/try")
     */
    public function postExercisesEventsIncidentsInjectsTriesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $incident = $em->getRepository('APIBundle:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $inject = $em->getRepository('APIBundle:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject) || $inject->getInjectIncident() !== $incident) {
            return $this->injectNotFound();
        }

        $data = array();
        $data['context']['id'] = $inject->getInjectId();
        $data['context']['type'] = $inject->getInjectType();
        //$data['context']['callback_url'] = $this->getParameter('protocol') . '://' . $request->getHost() . '/api/injects/' . $inject->getInjectId() . '/status';
        $data['data'] = json_decode($inject->getInjectContent(), true);
        $data['data']['content_header'] = $inject->getInjectHeader();
        $data['data']['content_footer'] = $inject->getInjectFooter();
        $data['data']['users'] = array();
        foreach( $exercise->getExerciseAnimationGroup()->getGroupUsers() as $user ) {
            $userData = array();
            $userData['user_firstname'] = $user->getUserFirstname();
            $userData['user_lastname'] = $user->getUserLastname();
            $userData['user_email'] = $user->getUserEmail();
            $userData['user_phone'] = $user->getUserPhone();
            $userData['user_organization'] = array();
            $userData['user_organization']['organization_name']= $user->getUserOrganization()->getOrganizationName();
            $data['data']['users'][] = $userData;
        }

        $url = $this->getParameter('worker_url') . '/cxf/worker/' . $data['context']['type'];
        $response = \Httpful\Request::post($url)->sendsJson()->body($data)->send();

        return "OK";
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    private function incidentNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Incident not found'], Response::HTTP_NOT_FOUND);
    }

    private function injectNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }
}