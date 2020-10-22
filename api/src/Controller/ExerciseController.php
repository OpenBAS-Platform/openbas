<?php

namespace App\Controller;

use App\Entity\Exercise;
use App\Entity\Grant;
use App\Form\Type\ExerciseType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use PHPExcel;
use App\Utils\Transform;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Bridge\Twig\TwigEngine;

class ExerciseController extends BaseController
{

    /**
     * @SWG\Property(description="List exercises")
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises")
     */
    public function getExercisesAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');
        $repositoryEvent = $entityManager->getRepository('App:Event');
        $repositoryIncident = $entityManager->getRepository('App:Incident');
        $repositoryInject = $entityManager->getRepository('App:Inject');

        $user = $this->get('security.token_storage')->getToken()->getUser();

        if ($user->isAdmin()) {
            $exercises = $repositoryExercise->findAll();
        } else {
            $grants = $user->getUserGrants();
            /* @var $grants Grant[] */
            $exercises = [];
            /* @var $exercises Exercise[] */
            foreach ($grants as $grant) {
                $exercises[] = $grant->getGrantExercise();
            }
        }

        foreach ($exercises as &$exercise) {
            $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            $injects = array();
            foreach ($events as $event) {
                $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $repositoryInject->findBy(['inject_incident' => $incident, 'inject_enabled' => true]));
                }
            }

            $exercise->computeExerciseStatus($injects);
            $exercise->computeStartEndDates($injects);
            $exercise->computeExerciseOwner();

            $exercise->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
            $exercise->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        }
        return $exercises;
    }

    /**
     * @SWG\Property(description="Read an exercise")
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises/{exercise_id}")
     */
    public function getExerciseAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');
        $repositoryEvent = $entityManager->getRepository('App:Event');
        $repositoryIncident = $entityManager->getRepository('App:Incident');
        $repositoryInject = $entityManager->getRepository('App:Inject');

        $exercise = $repositoryExercise->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $injects = array_merge($injects, $repositoryInject->findBy(['inject_incident' => $incident, 'inject_enabled' => true]));
            }
        }

        $exercise->computeExerciseStatus($injects);
        $exercise->computeStartEndDates($injects);
        $exercise->computeExerciseOwner();

        $exercise->setUserCanUpdate($this->hasGranted(self::UPDATE, $exercise));
        $exercise->setUserCanDelete($this->hasGranted(self::DELETE, $exercise));
        return $exercise;
    }

    /**
     * @SWG\Property(description="Create an exercise")
     * @SWG\Parameter(in={"class"=ExerciseType::class, "name"=""})
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"exercise"})
     * @Rest\Post("/exercises")
     */
    public function postExercisesAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryFile = $entityManager->getRepository('App:File');

        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
        }

        $exercise = new Exercise();
        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $file = $repositoryFile->findOneBy(['file_name' => 'Exercise default']);
            $exercise->setExerciseCanceled(false);
            $exercise->setExerciseOwner($user);
            $exercise->setExerciseImage($file);
            $exercise->setExerciseMessageHeader('EXERCISE - EXERCISE - EXERCISE');
            $exercise->setExerciseMessageFooter('EXERCISE - EXERCISE - EXERCISE');

            $entityManager->persist($exercise);
            $entityManager->flush();
            return $exercise;
        } else {
            return $form;
        }
    }

    /**
     * @SWG\Property(description="Delete an exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"exercise"})
     * @Rest\Delete("/exercises/{exercise_id}")
     */
    public function removeExerciseAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');

        $exercise = $repositoryExercise->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if ($exercise) {
            $this->denyAccessUnlessGranted('delete', $exercise);
            $entityManager->remove($exercise);
            $entityManager->flush();
        }
    }

    /**
     * @SWG\Property(description="Copy one audience to an exercise")
     *
     * @Rest\View(serializerGroups={"audience"})
     * @Rest\Put("/exercises/{exercise_id}/copy-audience/{audience_id}")
     */
    public function copyAudienceToExerciseAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryAudience = $entityManager->getRepository('App:Audience');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');

        $oAudience = $repositoryAudience->find($request->get('audience_id'));
        $oExercice = $repositoryExercise->find($request->get('exercise_id'));

        // copy audience
        if ($oAudience && $oExercice) {
            $oNewAudience = new \App\Entity\Audience();
            $oNewAudience->setAudienceExercise($oExercice);
            $oNewAudience->setAudienceName($oAudience->getAudienceName());
            $oNewAudience->setAudienceEnabled($oAudience->getAudienceEnabled());
            $entityManager->persist($oNewAudience);
            // copy subaudiences list
            foreach ($oAudience->getAudienceSubaudiences() as $subAudience) {
                $oNewSubAudience = new \App\Entity\Subaudience();
                $oNewSubAudience->setSubaudienceName($subAudience->getSubaudienceName());
                $oNewSubAudience->setSubaudienceEnabled($subAudience->getSubaudienceEnabled());
                $oNewSubAudience->setSubaudienceAudience($oNewAudience);
                $entityManager->persist($oNewSubAudience);

                //copy users list
                foreach ($subAudience->getSubaudienceUsers() as $oUser) {
                    $oNewSubAudience->addSubaudienceUser($oUser);
                }
                $entityManager->persist($oNewSubAudience);
            }
        }
        $entityManager->flush();
        return $oNewAudience;
    }


    /**
     * @SWG\Property(description="Update an exercise")
     * @SWG\Parameter(in={"class"=ExerciseType::class, "name"=""})
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Put("/exercises/{exercise_id}")
     */
    public function updateExerciseAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');
        $repositoryEvent = $entityManager->getRepository('App:Event');
        $repositoryIncident = $entityManager->getRepository('App:Incident');
        $repositoryInject = $entityManager->getRepository('App:Inject');

        $exercise = $repositoryExercise->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $entityManager->persist($exercise);
            $entityManager->flush();
            $entityManager->clear();
            $exercise = $repositoryExercise->find($request->get('exercise_id'));
            $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            $injects = array();
            foreach ($events as $event) {
                $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $repositoryInject->findBy(['inject_incident' => $incident, 'inject_enabled' => true]));
                }
            }

            $exercise->computeExerciseStatus($injects);
            $exercise->computeStartEndDates($injects);
            $exercise->computeExerciseOwner();

            return $exercise;
        } else {
            return $form;
        }
    }

    /**
     * @SWG\Property(description="Export inject to EML files")
     * @SWG\Parameter(in={"class"=ExerciseType::class, "name"=""})
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises/{exercise_id}/export/inject/eml")
     */
    public function exportExerciseEMLAction(Request $request)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryExercise = $entityManager->getRepository('App:Exercise');
        $repositoryEvent = $entityManager->getRepository('App:Event');
        $repositoryIncident = $entityManager->getRepository('App:Incident');
        $repositoryInject = $entityManager->getRepository('App:Inject');

        $exercise = $repositoryExercise->find($request->get('exercise_id'));
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $zipTempFile = 'openex_export_messages_eml_' . md5(uniqid() . date('Y-m-d H:i:s:u')) . '.zip';
        $zipEngine = new \ZipArchive();
        $zipEngine->open($zipTempFile, \ZipArchive::CREATE);

        $scenarios = $repositoryEvent->findBy(['event_exercise' => $exercise]);
        foreach ($scenarios as $scenario) {
            $incidents = $repositoryIncident->findBy(['incident_event' => $scenario]);
            foreach ($incidents as $incident) {
                $injects = $repositoryInject->findBy(['inject_incident' => $incident, 'inject_type' => 'openex_email']);
                foreach ($injects as $inject) {
                    $users = $inject->getInjectRecipients();
                    foreach ($users as $user) {
                        $injectContent = $this->getMailContent($inject, $user);
                        if ($injectContent) {
                            $zipEngine->addFromString(
                                $this->sanitizeFilename($this->getInjectMailTitle($inject, $user).'.eml'),
                                $injectContent
                            );
                        }
                    }
                }
            }
        }
        $zipEngine->close();

        $fsEngine = new FileSystem();
        if ($fsEngine->exists($zipTempFile)) {
            $response = new Response(file_get_contents($zipTempFile));

            $disposition = $response->headers->makeDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                $zipTempFile
            );

            $response->headers->set('Content-Type', 'application/zip');
            $response->headers->set('Content-Length', filesize($zipTempFile));
            $response->headers->set('Content-Disposition', $disposition);

            unlink($zipTempFile);

            return $response;
        }

        // Nothing to return
        $response = new Response();
        $response->setStatusCode(Response::HTTP_NO_CONTENT);
        return $response;
    }

    /**
     * Get real base folder where files are stored
     *
     * @return string real base folder
    **/
    private function getProjectFilePath()
    {
        return join([
            $this->get('kernel')->getProjectDir(),
            'var',
            'files'
        ], DIRECTORY_SEPARATOR);
    }

    /**
     * Get Mail Content
     *
     * @param type $inject
     * @param type $user
     * @return type
     */
    private function getMailContent($inject, $user)
    {
        $entityManager = $this->get('doctrine.orm.entity_manager');
        $repositoryDocument = $entityManager->getRepository('App:Document');

        $mailContent = [];

        $injectContent = json_decode($inject->getInjectContent());
        if ($injectContent) {
            // MIME Multipart boundaty
            $uniqueBoundaryString = '------------' . strtoupper(substr(md5($inject->getInjectId() . uniqid(rand(), true)), 0, 24));

            // To
            $mailContent[] = "To: ".$user->getUserLogin();

            // From
            $exercise = $inject->getInjectIncident()->getIncidentEvent()->getEventExercise();
            if (property_exists($injectContent, 'sender')) {
                $mailContent[] = "From: " . $injectContent->sender;
            } else {
                $mailContent[] = "From: " . $exercise->getExerciseMailExpediteur();
            }

            // Reply-to
            $mailContent[] = "Reply-To: " .$exercise->getExerciseMailExpediteur();

            // Subject
            if (property_exists($injectContent, 'subject')) {
                $mailContent[] = "Subject: " . $injectContent->subject;
            } else {
                $mailContent[] = "Subject: ";
            }

            // Technical data
            $mailContent[] = "Date: " . $inject->getInjectDate()->format("D, j M Y H:i:s O");
            $mailContent[] = "Content-Type: multipart/mixed; boundary=\"" . $uniqueBoundaryString . "\"";
            $mailContent[] = "Content-Language: fr";
            $mailContent[] = "MIME-Version: 1.0";

            // Body
            $mailContent[] = '';
            $mailContent[] = '--' . $uniqueBoundaryString;
            $mailContent[] = 'Content-Type: text/html; charset=utf-8';
            $mailContent[] = 'Content-Transfer-Encoding: 8bit';
            $mailContent[] = '';
            if (property_exists($injectContent, 'body')) {
                $mailContent[] = '<html><head>';
                $mailContent[] = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>';
                $mailContent[] = '<body>';
                $mailContent[] = $this->getPersonalInjectContent($injectContent->body, $user);
                $mailContent[] = '</body>';
                $mailContent[] = '</html>';
            }
            $mailContent[] = '';

            // Attachments
            if (property_exists($injectContent, 'attachments') && is_array($injectContent->attachments)) {
                foreach ($injectContent->attachments as $attachment) {
                    // Get App\Entity\Document from attachment
                    $document = $repositoryDocument->findOneBy(['document_id' => $attachment->document_id]);

                    $documentFullPath = $this->getProjectFilePath() . DIRECTORY_SEPARATOR . $document->getDocumentPath();
                    $documentName = $document->getDocumentName();

                    $fileEncodedContent = '';
                    $fileContentType = '';
                    if (file_exists($documentFullPath)) {
                        // Get file content, encode and split base64 encoded string in 76 char length strings (RFC 2045)
                        $fileEncodedContent = chunk_split(base64_encode(file_get_contents($documentFullPath)));

                        $fileContentType = mime_content_type($documentFullPath);
                    }

                    $mailContent[] = '--' . $uniqueBoundaryString;
                    $mailContent[] = 'Content-Type: ' . $fileContentType . '; name="' . $documentName . '"';
                    $mailContent[] = 'Content-Transfer-Encoding: base64';
                    $mailContent[] = 'Content-Disposition: attachment; filename="' . $documentName . '"';
                    $mailContent[] = '';
                    $mailContent[] = $fileEncodedContent;
                }
            }

            // End of "multipart"
            $mailContent[] = '--' . $uniqueBoundaryString . '--';
        }

        return join("\n", $mailContent);
    }

    /**
     * Get Personal Inject Content
     *
     * @param type $content
     * @param type $user
     * @return type
     */
    public function getPersonalInjectContent($content, $user)
    {
        $searchArray = [
            '{{PRENOM}}',
            '{{NOM}}',
            '{{ORGANISATION}}'
        ];
        $replaceArray = [
            $user->getUserFirstname(),
            $user->getUserLastname(),
            $user->getUserOrganization()->getOrganizationName()
        ];
        return str_replace($searchArray, $replaceArray, $content);
    }

    /**
     * Generate Inject Mail Title
     *
     * @param type $inject
     * @param type $user
     * @return type
     */
    private function getInjectMailTitle($inject, $user)
    {
        $titleParts = [
            $inject->getInjectDate()->format('Y-m-d H:i:s'),
            $inject->getInjectTitle(),
            $user->getUserLogin()
        ];

        return join(' - ', $titleParts);
    }

    /**
     * Sanitize text for filename
     *
     * @param string $filename
     * @return string
     */
    private function sanitizeFilename(string $filename)
    {
        return mb_ereg_replace("([\.]{2,})", '', mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '', $filename));
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }
}
