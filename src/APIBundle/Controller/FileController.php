<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
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
        $files = $em->getRepository('APIBundle:File')->findAll();
        /* @var $files File[] */

        foreach( $files as &$file) {
            $file->buildUrl($this->getParameter('protocol'), $this->getParameter('hostname'));
        }

        return $files;
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
                $fileName = md5(uniqid()) . '.' . $uploadedFile->guessExtension();
                $uploadedFile->move($this->get('kernel')->getRootDir() . '/../web/upload', $fileName);
                $file->setFileName($fileName);
                $em->persist($file);
                $em->flush();
                break;
            }

            return $file;
        }
    }
}