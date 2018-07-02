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
     *    description="List users of an audience"
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

        $users = [];
        foreach( $audience->getAudienceSubaudiences() as $subaudience) {
            $users = array_merge($users, $subaudience->getSubaudienceUsers());
        }

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

        $users = array();
        foreach( $audience->getAudienceSubaudiences() as $subaudience) {
            $subaudienceUsers = array();
            foreach( $subaudience->getSubaudienceUsers() as $user) {
                $user->setUserSubaudience($subaudience->getSubaudienceName());
                $subaudienceUsers[] = $user;
            }
            $users = array_merge($users, $subaudienceUsers);
        }

        $xlsUsers = $this->get('phpexcel')->createPHPExcelObject();
        /* @var $xlsInjects PHPExcel */

        $xlsUsers->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[" . $this->str_to_noaccent($exercise->getExerciseName()) . "] [" . $this->str_to_noaccent($audience->getAudienceName()) . "] Users list");

        $sheet = $xlsUsers->getActiveSheet();
        $sheet->setTitle('Users');

        $sheet->setCellValue('A1', 'Subaudience');
        $sheet->setCellValue('B1', 'Firstname');
        $sheet->setCellValue('C1', 'Lastname');
        $sheet->setCellValue('D1', 'Organization');
        $sheet->setCellValue('E1', 'Email');
        $sheet->setCellValue('F1', 'Email (secured)');
        $sheet->setCellValue('G1', 'Phone number (fix)');
        $sheet->setCellValue('H1', 'Phone number (mobile)');
        $sheet->setCellValue('I1', 'Phone number (secured)');
        $sheet->setCellValue('J1', 'PGP Key');

        $i = 2;
        foreach ($users as $user) {
            $user->setUserGravatar();
            $sheet->setCellValue('A' . $i, $user->getUserSubaudience());
            $sheet->setCellValue('B' . $i, $user->getUserFirstname());
            $sheet->setCellValue('C' . $i, $user->getUserLastname());
            $sheet->setCellValue('D' . $i, $user->getUserOrganization()->getOrganizationName());
            $sheet->setCellValue('E' . $i, $user->getUserEmail());
            $sheet->setCellValue('F' . $i, $user->getUserEmail2());
            $sheet->setCellValue('G' . $i, $user->getUserPhone2());
            $sheet->setCellValue('H' . $i, $user->getUserPhone());
            $sheet->setCellValue('I' . $i, $user->getUserPhone3());
            $sheet->setCellValue('J' . $i, (strlen($user->getUserPgpKey()) > 5? 'YES':'NO'));
            $i++;
        }

        $writer = $this->get('phpexcel')->createWriter($xlsUsers, 'Excel2007');
        $response = $this->get('phpexcel')->createStreamedResponse($writer);
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "[" . $this->str_to_noaccent($exercise->getExerciseName()) . "] [" . $this->str_to_noaccent($audience->getAudienceName()) . "] Users list.xlsx"
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

    private function str_to_noaccent($str)
    {
        $url = $str;
        $url = preg_replace('#Ç#', 'C', $url);
        $url = preg_replace('#ç#', 'c', $url);
        $url = preg_replace('#è|é|ê|ë#', 'e', $url);
        $url = preg_replace('#È|É|Ê|Ë#', 'E', $url);
        $url = preg_replace('#à|á|â|ã|ä|å#', 'a', $url);
        $url = preg_replace('#@|À|Á|Â|Ã|Ä|Å#', 'A', $url);
        $url = preg_replace('#ì|í|î|ï#', 'i', $url);
        $url = preg_replace('#Ì|Í|Î|Ï#', 'I', $url);
        $url = preg_replace('#ð|ò|ó|ô|õ|ö#', 'o', $url);
        $url = preg_replace('#Ò|Ó|Ô|Õ|Ö#', 'O', $url);
        $url = preg_replace('#ù|ú|û|ü#', 'u', $url);
        $url = preg_replace('#Ù|Ú|Û|Ü#', 'U', $url);
        $url = preg_replace('#ý|ÿ#', 'y', $url);
        $url = preg_replace('#Ý#', 'Y', $url);

        return ($url);
    }
}