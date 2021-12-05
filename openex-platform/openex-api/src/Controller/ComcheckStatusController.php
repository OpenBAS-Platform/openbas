<?php

namespace App\Controller;

use App\Entity\ComcheckStatus;
use DateTime;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ComcheckStatusController extends AbstractFOSRestController
{

    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    /**
     * @OA\Response(
     *    response=200,description="Update the status of a comcheck user")
     * @Rest\View(serializerGroups={"comcheckStatus"})
     * @Rest\Get("/api/comcheck/{comcheckstatus_id}")
     */
    public function updateComcheckStatusAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $status = $em->getRepository('App:ComcheckStatus')->find($request->get('comcheckstatus_id'));
        /* @var $status ComcheckStatus */

        if (empty($status)) {
            return $this->statusNotFound();
        }

        $status->setStatusLastUpdate(new DateTime());
        $status->setStatusState(1);

        $em->persist($status);
        $em->flush();

        return $status;
    }

    private function statusNotFound()
    {
        return View::create(['message' => 'Status not found'], Response::HTTP_NOT_FOUND);
    }
}
