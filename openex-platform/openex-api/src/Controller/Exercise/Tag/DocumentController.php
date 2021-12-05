<?php

namespace App\Controller\Exercise\Tag;

use App\Controller\Base\BaseController;
use App\Entity\Document;
use App\Form\Type\DocumentType;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use JetBrains\PhpStorm\Pure;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class DocumentController extends BaseController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine, TokenStorageInterface $tokenStorage)
    {
        $this->doctrine = $doctrine;
        parent::__construct($tokenStorage);
    }
    
    /**
     * @OA\Response(
     *    response=200,description="Download a file")
     *
     * @Rest\Get("/api/document/download/{document_id}")
     */
    public function downloadDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->find($request->get('document_id'));
        /* @var $file File */

        if (empty($document)) {
            return $this->fileNotFound();
        }

        return $this->file(
            $this->getProjectFilePath() . '/' . $document->getDocumentPath(),
            $document->getDocumentName()
        );
    }

    /**
     * Get Project File Path
     **/
    private function getProjectFilePath()
    {
        return $this->getParameter('kernel.project_dir') . '/var/files';
    }

    /**
     * @OA\Response(
     *    response=200,description="Get Document Tags by ID")
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"tag"})
     * @Rest\Get("/api/document/{document_id}/tags")
     */
    public function getDocumentTagsAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->findOneBy(array('document_id' => $request->get('document_id')));
        if (empty($document)) {
            return $this->documentNotFound();
        }
        return $document->getDocumentTags();
    }

    private function documentNotFound()
    {
        return View::create(['message' => 'Document not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Response(
     *    response=200,description="Get Document Tags 'exercise' by ID")
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"exercise"})
     * @Rest\Get("/api/document/{document_id}/tags/exercise")
     */
    public function getDocumentTagsExerciseAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->findOneBy(array('document_id' => $request->get('document_id')));
        if (empty($document)) {
            return $this->documentNotFound();
        }
        return $document->getDocumentTagsExercise();
    }

    /**
     * @OA\Response(
     *    response=200,description="Get Document by ID")
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"document"})
     * @Rest\Get("/api/document/{document_id}")
     */
    public function getDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->findOneBy(array('document_id' => $request->get('document_id')));
        if (empty($document)) {
            return $this->documentNotFound();
        }
        return $document;
    }

    /**
     * @OA\Response(
     *    response=200,description="Edit Document Tags")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"document"})
     * @Rest\Post("/api/document/{document_id}/save/tags")
     */
    public function postEditDocumentTagAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->findOneBy(array('document_id' => $request->get('document_id')));
        if (empty($document)) {
            return $this->documentNotFound();
        }
        //supprime tout
        foreach ($document->getDocumentTags() as $tag) {
            $document->removeTag($tag);
        }
        foreach ($request->get('tags') as $tag_id) {
            $tag = $em->getRepository('App:Tag')->findOneBy(array('tag_id' => $tag_id));
            if ($tag) {
                $document->addTag($tag);
            }
        }
        $em->persist($document);
        $em->flush();
        return $document;
    }

    /**
     * @OA\Response(
     *    response=200,description="Edit Document Tags Exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"document"})
     * @Rest\Post("/api/document/{document_id}/save/tags/exercise")
     */
    public function postEditDocumentTagExerciseAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->findOneBy(array('document_id' => $request->get('document_id')));
        if (empty($document)) {
            return $this->documentNotFound();
        }
        //supprime tout
        foreach ($document->getDocumentTagsExercise() as $exercise) {
            $document->removeTagExercise($exercise);
        }
        foreach ($request->get('tags') as $execise_id) {
            $exercise = $em->getRepository('App:Exercise')->findOneBy(array('exercise_id' => $execise_id));
            if ($exercise) {
                $document->addTagExercise($exercise);
            }
        }
        $em->persist($document);
        $em->flush();
        return $document;
    }

    /**
     * @OA\Response(
     *    response=200,description="Create a new document")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"document"})
     * @Rest\Post("/api/document")
     */
    public function postCreateDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        if (count($_FILES) == 0) {
            return View::create(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        } else {
            foreach ($_FILES as $f) {
                $document = new Document();
                $uploadedFile = new UploadedFile($f['tmp_name'], $f['name']);
                $fileType = $uploadedFile->guessExtension() ? $uploadedFile->guessExtension() : 'unknown';
                $filePath = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $fileName = $f['name'];

                $uploadedFile->move($this->getProjectFilePath(), $filePath);

                $document->setDocumentName($fileName);
                $document->setDocumentPath($filePath);
                $document->setDocumentType($fileType);
                $em->persist($document);
                $em->flush();
                break;
            }
            return $document;
        }
    }

    /**
     * @OA\Response(
     *    response=200,description="Edit a Document")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"document"})
     * @Rest\Post("/api/document/save/{document_id}")
     */
    public function postEditDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->find($request->get('document_id'));

        if (empty($document)) {
            return $this->documentNotFound();
        }

        $form = $this->createForm(DocumentType::class, $document);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($document);
            $em->flush();
            $em->clear();
            $document = $em->getRepository('App:Document')->find($request->get('document_id'));
            return $document;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Delete a document"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"document"})
     * @Rest\Delete("/api/document/{document_id}")
     */
    public function deleteDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $document = $em->getRepository('App:Document')->find($request->get('document_id'));

        if (empty($document)) {
            return $this->documentNotFound();
        }
        $em->remove($document);
        $em->flush();
        return array('result' => true);
    }

    /**
     * @OA\Response(
     *    response=200,
     *    description="Get List of document"
     * )
     *
     * @Rest\View(serializerGroups={"document"})
     * @Rest\Post("/api/document/search")
     */
    public function searchDocumentAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $documents = $em->getRepository('App:Document')->findAll();
        foreach ($documents as &$document) {
            $document->computeDocumentListeTags();
            $document->computeDocumentListeTagsExercise();
        }
        return $documents;
    }
}
