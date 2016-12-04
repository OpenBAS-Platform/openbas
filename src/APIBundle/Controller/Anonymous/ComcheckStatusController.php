<?php

namespace APIBundle\Controller\Anonymous;

use APIBundle\Entity\Dryinject;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\ComcheckStatus;

class ComcheckStatusController extends Controller
{
    /**
     * @ApiDoc(
     *    description="Update the status of a comcheck user",
     * )
     * @Rest\View(serializerGroups={"comcheckStatus"})
     * @Rest\Get("/comcheck/{comcheckstatus_id}")
     */
    public function updateComcheckStatusAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $status = $em->getRepository('APIBundle:ComcheckStatus')->find($request->get('comcheckstatus_id'));
        /* @var $status ComcheckStatus */

        if (empty($status)) {
            return $this->statusNotFound();
        }

        $status->setStatusLastUpdate(new \DateTime());
        $status->setStatusState(true);

        $em->persist($status);
        $em->flush();

        return $status;
    }

    private function statusNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Status not found'], Response::HTTP_NOT_FOUND);
    }
}