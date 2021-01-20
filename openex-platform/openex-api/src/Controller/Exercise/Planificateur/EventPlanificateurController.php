<?php

namespace App\Controller\Exercise\Planificateur;

use App\Controller\Base\BaseController;
use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EventPlanificateurController extends BaseController
{

    /**
     * @OA\Response(
     *    response=200,
     *    description="Update list user planificateur for an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/api/exercises/{exercise_id}/planificateurs/events/{event_id}")
     */
    public function updatePlanificateurUserForEventAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $event = $em->getRepository('App:Event')->FindOneBy(array('event_id' => $request->get('event_id')));
        if ($event) {
            foreach ($request->get('planificateurs') as $planificateur) {
                $user = $em->getRepository('App:User')->findOneBy(array('user_id' => $planificateur['user_id']));
                if ($user) {
                    if ($planificateur['is_planificateur_event'] == true) {
                        $event->addEventPlanificateurUsers($user);
                    } else {
                        $event->removeEventPlanificateurUsers($user);
                    }
                }
                $em->persist($event);
                $em->flush($event);
            }
        } else {
            return $this->audienceNotFound();
        }
    }


    /**
     * @OA\Response(
     *    response=200,
     *    description="List user planificateur for an event"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/exercises/{exercise_id}/planificateurs/events/{event_id}")
     */
    public function getPlanificateurUserForEventAction(Request $request)
    {
        $listPlanificateur = array();
        $em = $this->getDoctrine()->getManager();
        $planificateurs = $em->getRepository('App:User')->FindBy(array('user_planificateur' => true));
        $event = $em->getRepository('App:Event')->FindOneBy(array('event_id' => $request->get('event_id')));
        if ($event) {
            foreach ($planificateurs as $planificateur) {
                $tabPlanificateur = [
                    'user_id' => $planificateur->getUserId(),
                    'user_firstname' => $planificateur->getUserFirstname(),
                    'user_lastname' => $planificateur->getUserLastname(),
                    'user_email' => $planificateur->getUserEmail(),
                    'is_planificateur_event' => $planificateur->isPlanificateurEvent($event)
                ];
                $listPlanificateur[] = $tabPlanificateur;
            }
        } else {
            return $this->eventNotFound();
        }
        return $listPlanificateur;
    }


    private function eventNotFound()
    {
        return View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }
}
