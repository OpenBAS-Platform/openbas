<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\File;

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
        $files = $em->getRepository('APIBundle:File')->findBy(array(), array('file_id' => 'DESC'));
        /* @var $files File[] */

        foreach ($files as &$file) {
            $file->buildUrl($this->getParameter('protocol'), $request->getHost());
        }

        return $files;
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

        // temporary store the file with the real name
        copy($this->get('kernel')->getRootDir() . '/../web/upload/' . $file->getFilePath(), '/tmp/' . $file->getFileName());

        return $this->file('/tmp/' . $file->getFileName());
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
            return \FOS\RestBundle\View\View::create(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        } else {
            $file = new File();
            foreach ($_FILES as $f) {
                $uploadedFile = new UploadedFile($f['tmp_name'], $f['name']);
                $type = $uploadedFile->guessExtension();
                if ($type === null) {
                    $type = 'unknown';
                }
                $file->setFileType($type);
                $filePath = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $uploadedFile->move($this->get('kernel')->getRootDir() . '/../web/upload', $filePath);
                $file->setFileName($f['name']);
                $file->setFilePath($filePath);
                $em->persist($file);
                $em->flush();
                break;
            }

            $file->buildUrl($this->getParameter('protocol'), $request->getHost());
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
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();

        $file = $em->getRepository('APIBundle:File')->find($request->get('file_id'));
        /* @var $file File */

        if ($file) {
            $em->remove($file);
            $em->flush();
            unlink($this->get('kernel')->getRootDir() . '/../web/upload/' . $file->getFilePath());
        }
    }

    private function fileNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'File not found'], Response::HTTP_NOT_FOUND);
    }
}