<?php
namespace App\Controller\Exercise\Tag;

use App\Controller\Base\BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Entity\Tag;
use App\Form\Type\TagType;

class TagController extends BaseController
{

    /**
     * @SWG\Property(description="Create a new tag")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"tag"})
     * @Rest\Post("/tag")
     */
    public function postCreateTagAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');

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
     * @SWG\Property(description="Edit a Tag")
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"tag"})
     * @Rest\Post("/tag/{tag_id}")
     */
    public function postEditTagAction(Request $request)
    {
    }

    /**
     * @SWG\Property(
     *    description="Delete a tag"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK, serializerGroups={"tag"})
     * @Rest\Delete("/tag/{tag_id}")
     */
    public function deleteTagAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $tag = $em->getRepository('App:Tag')->find($request->get('tag_id'));

        if (empty($tag)) {
            return $this->tagNotFound();
        }
        $em->remove($tag);
        $em->flush();
        return array('result' => true);
    }

    /**
     * @SWG\Property(
     *    description="Get List of Tags"
     * )
     *
     * @Rest\View(serializerGroups={"tag"})
     * @Rest\Get("/tag")
     */
    public function getTagAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $tags = $em->getRepository('App:Tag')->findAll();
        return $tags;
    }

    private function tagNotFound()
    {
        return View::create(['message' => 'Tag not found'], Response::HTTP_NOT_FOUND);
    }
}
