<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Exercise;
use App\Form\Type\AudienceType;
use App\Utils\Transform;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PHPExcel;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AudienceController extends BaseController
{
    /**
     * @OA\Property(
     *    description="List audiences of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/api/exercises/{exercise_id}/audiences")
     */
    public function getExercisesAudiencesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise]);

        foreach ($audiences as &$audience) {
            $audience->computeUsersNumber();
            $audience->setUserCanUpdate($this->hasGranted(self::UPDATE, $audience));
            $audience->setUserCanDelete($this->hasGranted(self::UPDATE, $audience));
        }

        return $audiences;
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="List users of audiences (xls)"
     * )
     *
     * @Rest\Get("/api/exercises/{exercise_id}/audiences.xlsx")
     */
    public function getExercisesUsersXlsxAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);


        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        $xlsUsers = new Spreadsheet();
        /* @var $xlsInjects PHPExcel */

        $xlsUsers->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[" . Transform::strToNoAccent($exercise->getExerciseName()) . "] Users list");

        $i = 0;
        foreach ($audiences as $audience) {
            $users = array();
            foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                $subaudienceUsers = array();
                foreach ($subaudience->getSubaudienceUsers() as $user) {
                    $user->setUserSubaudience($subaudience->getSubaudienceName());
                    $subaudienceUsers[] = $user;
                }
                $users = array_merge($users, $subaudienceUsers);
            }

            if ($i !== 0) {
                $sheet = $xlsUsers->createSheet($i);
            } else {
                $sheet = $xlsUsers->getActiveSheet();
            }
            $sheet->setTitle(substr($audience->getAudienceName(), 0, 30));
            $sheet->setCellValue('A1', 'Subaudience');
            $sheet->setCellValue('B1', 'Firstname');
            $sheet->setCellValue('C1', 'Lastname');
            $sheet->setCellValue('D1', 'Organization');
            $sheet->setCellValue('E1', 'Email');
            $sheet->setCellValue('F1', 'Email (secondary)');
            $sheet->setCellValue('G1', 'Phone number (fix)');
            $sheet->setCellValue('H1', 'Phone number (mobile)');
            $sheet->setCellValue('I1', 'Phone number (secondary)');
            $sheet->setCellValue('J1', 'PGP Key');

            $j = 2;
            foreach ($users as $user) {
                $user->setUserGravatar();
                $sheet->setCellValue('A' . $j, $user->getUserSubaudience());
                $sheet->setCellValue('B' . $j, $user->getUserFirstname());
                $sheet->setCellValue('C' . $j, $user->getUserLastname());
                $sheet->setCellValue('D' . $j, $user->getUserOrganization()->getOrganizationName());
                $sheet->setCellValue('E' . $j, $user->getUserEmail());
                $sheet->setCellValue('F' . $j, $user->getUserEmail2());
                $sheet->setCellValue('G' . $j, $user->getUserPhone2());
                $sheet->setCellValue('H' . $j, $user->getUserPhone());
                $sheet->setCellValue('I' . $j, $user->getUserPhone3());
                $sheet->setCellValue('J' . $j, (strlen($user->getUserPgpKey()) > 5 ? 'YES' : 'NO'));
                $j++;
            }
            $i++;
        }

        $writer = new Xlsx($xlsUsers);
        $response = new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        });
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "[" . Transform::strToNoAccent($exercise->getExerciseName()) . "] Users list.xlsx"
        );

        $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');
        $response->headers->set('Content-Disposition', $dispositionHeader);

        return $response;
    }

    /**
     * @OA\Property(
     *    description="Read an audience"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/api/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function getExercisesAudienceAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $audience->computeUsersNumber();
        $audience->setUserCanUpdate($this->hasGranted(self::UPDATE, $audience));
        $audience->setUserCanDelete($this->hasGranted(self::DELETE, $audience));
        return $audience;
    }

    private function audienceNotFound()
    {
        return View::create(['message' => 'Audience not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(description="Create an audience")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"audience"})
     * @Rest\Post("/api/exercises/{exercise_id}/audiences")
     */
    public function postExercisesAudiencesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = new Audience();
        $form = $this->createForm(AudienceType::class, $audience);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $audience->setAudienceExercise($exercise);
            $audience->setAudienceEnabled(true);
            $em->persist($audience);
            $em->flush();
            $audience->computeUsersNumber();
            return $audience;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Property(
     *    description="Delete an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"audience"})
     * @Rest\Delete("/api/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function removeExercisesAudienceAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $em->remove($audience);
        $em->flush();
    }

    /**
     * @OA\Property(description="Update an audience")
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Put("/api/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function updateExercisesAudienceAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $em2 = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $form = $this->createForm(AudienceType::class, $audience);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($audience);
            $em->flush();
            $em->clear();
            $audience = $em->getRepository('App:Audience')->find($request->get('audience_id'));
            $audience->computeUsersNumber();
            return $audience;
        } else {
            return $form;
        }
    }
}
