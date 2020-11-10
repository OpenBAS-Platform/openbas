<?php

namespace App\Controller;

use App\Entity\File;
use App\Entity\User;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class FileController extends AbstractController
{
    protected $parameterBag;

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->parameterBag = $parameterBag;

    }

    /**
     * @OA\Property(
     *    description="List files"
     * )
     *
     * @Rest\View(serializerGroups={"file"})
     * @Rest\Get("/api/files")
     */
    public function getFilesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        return $em->getRepository('App:File')->findBy(array(), array('file_id' => 'DESC'));
    }

    /**
     * @OA\Property(
     *    description="Download a file"
     * )
     *
     * @Rest\Get("/api/files/{file_id}")
     */
    public function getFileAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $file = $em->getRepository('App:File')->find($request->get('file_id'));
        /* @var $file File */

        if (empty($file)) {
            $document = $em->getRepository('App:Document')->find($request->get('file_id'));
            if (empty($document)) {
                return $this->fileNotFound();
            } else {
                return $this->file(
                    $this->getProjectFilePath() . '/' . $document->getDocumentPath(),
                    $document->getDocumentName()
                );
            }
            return $this->fileNotFound();
        }

        return $this->file(
            $this->getProjectFilePath() . '/' . $file->getFilePath(),
            $file->getFileName()
        );
    }

    private function fileNotFound()
    {
        return View::create(['message' => 'File not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * Get Project File Path
     **/
    private function getProjectFilePath()
    {
        return $this->parameterBag->get('kernel.project_dir') . '/var/files';
    }

    /**
     * @OA\Property(
     *    description="Upload a file"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"file"})
     * @Rest\Post("/api/files")
     */
    public function postFilesAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        if (count($_FILES) == 0) {
            return View::create(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        } else {
            $file = new File();
            foreach ($_FILES as $f) {
                $uploadedFile = new UploadedFile($f['tmp_name'], $f['name']);
                $type = $uploadedFile->guessExtension() ? $uploadedFile->guessExtension() : 'unknown';
                $file->setFileType($type);
                $filePath = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $uploadedFile->move($this->getProjectFilePath(), $filePath);
                $file->setFileName($f['name']);
                $file->setFilePath($filePath);
                $em->persist($file);
                $em->flush();
                break;
            }
            return $file;
        }
    }

    /**
     * @OA\Property(
     *    description="Delete a file"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"exercise"})
     * @Rest\Delete("/api/files/{file_id}")
     */
    public function removeFileAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        /** @var User $user */
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new AccessDeniedHttpException();
        }

        $file = $em->getRepository('App:File')->find($request->get('file_id'));
        /* @var $file File */

        if ($file) {
            $em->remove($file);
            $em->flush();
            @unlink($this->getProjectFilePath() . '/' . $file->getFilePath());
        }
    }

    /**
     * @OA\Property(
     *    description="Get all sheets name for an import file"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/api/files/sheets/{file_id}")
     */
    public function getImportFileSheetsNameAction(Request $request)
    {
        $reader = new Xlsx();
        $listTypeSheet = ['exercise', 'audience', 'objective', 'scenarios', 'incidents', 'injects'];
        $em = $this->getDoctrine()->getManager();
        $file = $em->getRepository('App:File')->find($request->get('file_id'));

        if (empty($file)) {
            return $this->fileNotFound();
        }

        $fileAddress = $this->getProjectFilePath() . '/' . $file->getFilePath();

        if (!file_exists($fileAddress)) {
            return $this->fileNotFound($fileAddress);
        }

        $spreadsheet = $reader->load($fileAddress);
        $oFileSheet = array();
        foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
            if (in_array(strtolower($worksheet->getTitle()), $listTypeSheet)) {
                array_push($oFileSheet, strtolower($worksheet->getTitle()));
            }
        }
        return $oFileSheet;
    }

    private function fileNotExist($filePath)
    {
        return View::create(['message' => 'File not exist :' . $filePath], Response::HTTP_NOT_FOUND);
    }
}
