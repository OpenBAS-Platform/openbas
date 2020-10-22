<?php
namespace App\Controller\Exercise\Planificateur;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

class AudiencePlanificateurController extends BaseController
{

    /**
     * @SWG\Property(
     *    description="Update list user planificateur for an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/exercises/{exercise_id}/planificateurs/audiences/{audience_id}")
     */
    public function updatePlanificateurUserForAudienceAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $audience = $em->getRepository('App:Audience')->FindOneBy(array('audience_id' => $request->get('audience_id')));
        if ($audience) {
            foreach ($request->get('planificateurs') as $planificateur) {
                $user = $em->getRepository('App:User')->findOneBy(array('user_id' => $planificateur['user_id']));
                if ($user) {
                    if ($planificateur['is_user_planificateur_audience'] == true) {
                        $audience->addPlanificateurUser($user);
                    } else {
                        $audience->removePlanificateurUser($user);
                    }
                }
                $em->persist($audience);
                $em->flush($audience);
            }
        } else {
            return $this->audienceNotFound();
        }
    }



    /**
     * @SWG\Property(
     *    description="List user planificateur for an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/exercises/{exercise_id}/planificateurs/audiences/{audience_id}")
     */
    public function getPlanificateurUserForAudienceAction(Request $request)
    {
        $listPlanificateur = array();
        $em = $this->get('doctrine.orm.entity_manager');
        $planificateurs = $em->getRepository('App:User')->FindBy(array('user_planificateur' => true));
        $audience = $em->getRepository('App:Audience')->FindOneBy(array('audience_id' => $request->get('audience_id')));
        if ($audience) {
            foreach ($planificateurs as $planificateur) {
                $tabPlanificateur = [
                    'user_id' => $planificateur->getUserId(),
                    'user_firstname' => $planificateur->getUserFirstname(),
                    'user_lastname' => $planificateur->getUserLastname(),
                    'user_email' => $planificateur->getUserEmail(),
                    'is_user_planificateur_audience' => $planificateur->isUserPlanificateurAudiences($audience)
                ];
                $listPlanificateur[] = $tabPlanificateur;
            }
        } else {
            return $this->audienceNotFound();
        }
        return $listPlanificateur;
    }

    private function audienceNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Audience not found'], Response::HTTP_NOT_FOUND);
    }
}
