<?php

namespace APIBundle\Controller\Exercise;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\AudienceType;
use APIBundle\Entity\Audience;
use PHPExcel;
use APIBundle\Utils\Transform;

class AudienceController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List audiences of an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/exercises/{exercise_id}/audiences")
     */
    public function getExercisesAudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise]);

        foreach( $audiences as &$audience ) {
            $audience->computeUsersNumber();
        }

        return $audiences;
    }

    /**
     * @ApiDoc(
     *    description="List users of audiences (xls)"
     * )
     *
     * @Rest\Get("/exercises/{exercise_id}/audiences.xlsx")
     */
    public function getExercisesUsersXlsxAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);


        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        $xlsUsers = $this->get('phpexcel')->createPHPExcelObject();
        /* @var $xlsInjects PHPExcel */

        $xlsUsers->getProperties()
            ->setCreator("OpenEx")
            ->setLastModifiedBy("OpenEx")
            ->setTitle("[" . Transform::strToNoAccent($exercise->getExerciseName()) . "] Users list");

        $i = 0;
        foreach( $audiences as $audience ) {
            $users = array();
            foreach( $audience->getAudienceSubaudiences() as $subaudience) {
                $subaudienceUsers = array();
                foreach( $subaudience->getSubaudienceUsers() as $user) {
                    $user->setUserSubaudience($subaudience->getSubaudienceName());
                    $subaudienceUsers[] = $user;
                }
                $users = array_merge($users, $subaudienceUsers);
            }

            if( $i !== 0 ) {
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
                $sheet->setCellValue('J' . $j, (strlen($user->getUserPgpKey()) > 5? 'YES':'NO'));
                $j++;
            }
            $i++;
        }

        $writer = $this->get('phpexcel')->createWriter($xlsUsers, 'Excel2007');
        $response = $this->get('phpexcel')->createStreamedResponse($writer);
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
     * @ApiDoc(
     *    description="Read an audience"
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Get("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function getExercisesAudienceAction(Request $request)
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

        $audience->computeUsersNumber();
        return $audience;
    }

    /**
     * @ApiDoc(
     *    description="Create an audience",
     *    input={"class"=AudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"audience"})
     * @Rest\Post("/exercises/{exercise_id}/audiences")
     */
    public function postExercisesAudiencesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
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
     * @ApiDoc(
     *    description="Delete an audience"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"audience"})
     * @Rest\Delete("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function removeExercisesAudienceAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
        /* @var $audience Audience */

        if (empty($audience) || $audience->getAudienceExercise() !== $exercise) {
            return $this->audienceNotFound();
        }

        $em->remove($audience);
        $em->flush();
    }

    /**
     * @ApiDoc(
     *    description="Update an audience",
     *   input={"class"=AudienceType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Put("/exercises/{exercise_id}/audiences/{audience_id}")
     */
    public function updateExercisesAudienceAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $em2 = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
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
            $audience = $em->getRepository('APIBundle:Audience')->find($request->get('audience_id'));
            $audience->computeUsersNumber();
            return $audience;
        } else {
            return $form;
        }
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