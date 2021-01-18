<?php

namespace App\Controller\Exercise\Event\Incident\Inject;

use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use App\Entity\Inject;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TryController extends AbstractController
{

    /**
     * @OA\Property(
     *    description="Try an inject"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"injectStatus"})
     * @Rest\Post("/api/exercises/{exercise_id}/events/{event_id}/incidents/{incident_id}/injects/{inject_id}/try")
     */
    public function postExercisesEventsIncidentsInjectsTriesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $event = $em->getRepository('App:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $incident = $em->getRepository('App:Incident')->find($request->get('incident_id'));
        /* @var $incident Incident */

        if (empty($incident) || $incident->getIncidentEvent() !== $event) {
            return $this->incidentNotFound();
        }

        $inject = $em->getRepository('App:Inject')->find($request->get('inject_id'));
        /* @var $inject Inject */

        if (empty($inject) || $inject->getInjectIncident() !== $incident) {
            return $this->injectNotFound();
        }

        $inject->setInjectExercise($exercise);
        $inject->setInjectHeader($exercise->getExerciseMessageHeader());
        $inject->setInjectFooter($exercise->getExerciseMessageFooter());

        if ($exercise->getExerciseAnimationGroup() != null) {
            $data = array();
            $data['context']['id'] = $inject->getInjectId();
            $data['context']['type'] = $inject->getInjectType();
            //$data['context']['callback_url'] = $this->getParameter('protocol') . '://' . $request->getHost() . '/api/injects/' . $inject->getInjectId() . '/status';
            $data['data'] = json_decode($inject->getInjectContent(), true);
            $data['data']['content_header'] = $inject->getInjectHeader();
            $data['data']['content_footer'] = $inject->getInjectFooter();
            $data['data']['replyto'] = $inject->getInjectIncident()->getIncidentEvent()->getEventExercise()->getExerciseMailExpediteur();
            $data['data']['users'] = array();
            foreach ($exercise->getExerciseAnimationGroup()->getGroupUsers() as $user) {
                $userData = array();
                $userData['user_firstname'] = $user->getUserFirstname();
                $userData['user_lastname'] = $user->getUserLastname();
                $userData['user_email'] = $user->getUserEmail();
                $userData['user_email2'] = $user->getUserEmail2();
                $userData['user_phone'] = $user->getUserPhone();
                $userData['user_phone2'] = $user->getUserPhone2();
                $userData['user_phone3'] = $user->getUserPhone3();
                $userData['user_pgp_key'] = base64_encode($user->getUserPgpKey());
                $userData['user_organization'] = array();
                $userData['user_organization']['organization_name'] = $user->getUserOrganization()->getOrganizationName();
                $data['data']['users'][] = $userData;
            }

            $url = $this->getParameter('player_url') . '/player/' . $data['context']['type'];
            $response = \Httpful\Request::post($url)->sendsJson()->body($data)->send();
            $response = json_decode($response->raw_body, true);
            return ["result" => $response];
        }

        return ["result" => 'Error, no exercise planners group is defined is the exercise settings'];
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }

    private function incidentNotFound()
    {
        return View::create(['message' => 'Incident not found'], Response::HTTP_NOT_FOUND);
    }

    private function injectNotFound()
    {
        return View::create(['message' => 'Inject not found'], Response::HTTP_NOT_FOUND);
    }
}
