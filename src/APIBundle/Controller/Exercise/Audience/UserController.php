<?php

namespace APIBundle\Controller\Exercise\Audience;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\Audience;
use PHPExcel;

class UserController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List users of an Audience"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}/users")
     */
    public function getExercisesAudiencesUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $users = $audience->getAudienceUsers();

        foreach ($users as &$user) {
            $user->setUserGravatar();
        }

        return $users;
    }

    /**
     * @ApiDoc(
     *    description="List users of an audience (xls)"
     * )
     *
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}/users.xlsx")
     */
    public function getExercisesAudiencesUsersXlsxAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $users = $audience->getAudienceUsers();
        $xlsUsers = $this->get('phpexcel')->createPHPExcelObject();
        /* @var $xlsInjects PHPExcel */

        $xlsUsers->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[{$exercise->getExerciseName()}] [{$audience->getAudienceName()}] Users list");

        $sheet = $xlsUsers->getActiveSheet();
        $sheet->setTitle('Users');

        $sheet->setCellValue('A1', 'Firstname');
        $sheet->setCellValue('B1', 'Lastname');
        $sheet->setCellValue('C1', 'Organization');
        $sheet->setCellValue('D1', 'Email');
        $sheet->setCellValue('E1', 'Phone');

        $i = 2;
        foreach ($users as $user) {
            $user->setUserGravatar();
            $sheet->setCellValue('A' . $i, $user->getUserFirstname());
            $sheet->setCellValue('B' . $i, $user->getUserLastname());
            $sheet->setCellValue('C' . $i, $user->getUserOrganization()->getOrganizationName());
            $sheet->setCellValue('D' . $i, $user->getUserEmail());
            $sheet->setCellValue('E' . $i, $user->getUserPhone());
            $i++;
        }

        $writer = $this->get('phpexcel')->createWriter($xlsUsers, 'Excel2007');
        $response = $this->get('phpexcel')->createStreamedResponse($writer);
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "[{$exercise->getExerciseName()}] [{$audience->getAudienceName()}] Users list.xlsx"
        );

        $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');
        $response->headers->set('Content-Disposition', $dispositionHeader);

        return $response;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function audienceNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Audience not found'], Response::HTTP_NOT_FOUND);
    }
}