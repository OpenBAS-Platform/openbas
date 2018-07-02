<?php

namespace APIBundle\Controller;

use APIBundle\Entity\File;
use APIBundle\Entity\User;
use FOS\RestBundle\View\View;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations as Rest;

class FileController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List files"
     * )
     *
     * @Rest\View(serializerGroups={"file"})
     * @Rest\Get("/files")
     */
    public function getFilesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        return $em->getRepository('APIBundle:File')->findBy(array(), array('file_id' => 'DESC'));
    }

    /**
     * @ApiDoc(
     *    description="Download a file"
     * )
     *
     * @Rest\Get("/files/{file_id}")
     */
    public function getFileAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $file = $em->getRepository('APIBundle:File')->find($request->get('file_id'));
        /* @var $file File */

        if (empty($file)) {
            return $this->fileNotFound();
        }

        return $this->file($this->get('kernel')->getRootDir() . '/files/' . $file->getFilePath(),
            $file->getFileName());
    }

    /**
     * @ApiDoc(
     *    description="Upload a file"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"file"})
     * @Rest\Post("/files")
     */
    public function postFilesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        if (count($_FILES) == 0) {
            return View::create(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        } else {
            $file = new File();
            foreach ($_FILES as $f) {
                $uploadedFile = new UploadedFile($f['tmp_name'], $f['name']);
                $type = $uploadedFile->guessExtension() ? $uploadedFile->guessExtension() : 'unknown';
                $file->setFileType($type);
                $filePath = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $uploadedFile->move($this->get('kernel')->getRootDir() . '/files', $filePath);
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
     * @ApiDoc(
     *    description="Delete a file"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"exercise"})
     * @Rest\Delete("/files/{file_id}")
     */
    public function removeFileAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        /** @var User $user */
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin()) {
            throw new AccessDeniedHttpException();
        }

        $file = $em->getRepository('APIBundle:File')->find($request->get('file_id'));
        /* @var $file File */

        if ($file) {
            $em->remove($file);
            $em->flush();
            @unlink($this->get('kernel')->getRootDir() . '/files/' . $file->getFilePath());
        }
    }

    private function fileNotFound()
    {
        return View::create(['message' => 'File not found'], Response::HTTP_NOT_FOUND);
    }
}