<?php

namespace App\Controller\Exercise\Tag;

use App\Controller\Base\BaseController;
use App\Entity\Tag;
use App\Form\Type\TagType;
use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TagController extends BaseController
{

    /**
     * @OA\Property(description="Create a new tag")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"tag"})
     * @Rest\Post("/api/tag")
     */
    public function postCreateTagAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $tag = new Tag();
        $form = $this->createForm(TagType::class, $tag);
        $form->submit($request->request->all());
        if ($form->isValid()) {
            $em->persist($tag);
            $em->flush();
            return $tag;
        } else {
            return $form;
        }
    }

    /**
     * @OA\Property(description="Edit a Tag")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"tag"})
     * @Rest\Post("/api/tag/{tag_id}")
     */
    public function postEditTagAction(Request $request)
    {
    }

    /**
     * @OA\Property(
     *    description="Delete a tag"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"tag"})
     * @Rest\Delete("/api/tag/{tag_id}")
     */
    public function deleteTagAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $tag = $em->getRepository('App:Tag')->find($request->get('tag_id'));

        if (empty($tag)) {
            return $this->tagNotFound();
        }
        $em->remove($tag);
        $em->flush();
        return array('result' => true);
    }

    private function tagNotFound()
    {
        return View::create(['message' => 'Tag not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Get List of Tags"
     * )
     *
     * @Rest\View(serializerGroups={"tag"})
     * @Rest\Get("/api/tag")
     */
    public function getTagAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $tags = $em->getRepository('App:Tag')->findAll();
        return $tags;
    }
}
