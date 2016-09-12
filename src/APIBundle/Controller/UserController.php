<?php

namespace APIBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Form\Type\UserType;
use APIBundle\Entity\User;

class UserController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List users"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/users")
     */
    public function getUsersAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");

        $em = $this->get('doctrine.orm.entity_manager');
        $users = $em->getRepository('APIBundle:User')->findAll();
        /* @var $users User[] */

        return $users;
    }

    /**
     * @ApiDoc(
     *    description="Read a user"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/users/{user_id}")
     */
    public function getUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $this->denyAccessUnlessGranted('select', $user);
        return $user;
    }

    /**
     * @ApiDoc(
     *    description="Create a user",
     *   input={"class"=UserType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/users")
     */
    public function postUsersAction(Request $request)
    {
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

        $form->submit($request->request->all());

        if ($form->isValid()) {
            $encoder = $this->get('security.password_encoder');
            $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
            $user->setUserPassword($encoded);

            $em = $this->get('doctrine.orm.entity_manager');
            $em->persist($user);
            $em->flush();
            return $user;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a user"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"user"})
     * @Rest\Delete("/users/{user_id}")
     */
    public function removeUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')
            ->find($request->get('user_id'));
        /* @var $user User */

        if ($user) {
            $this->denyAccessUnlessGranted('delete', $user);
            $em->remove($user);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Replace a user",
     *   input={"class"=UserType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Put("/users/{user_id}")
     */
    public function updateUserAction(Request $request)
    {
        return $this->updateUser($request, true);
    }

    /**
     * @ApiDoc(
     *    description="Update a user",
     *   input={"class"=UserType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Patch("/users/{user_id}")
     */
    public function patchUserAction(Request $request)
    {
        return $this->updateUser($request, false);
    }

    private function updateUser(Request $request, $clearMissing)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $this->denyAccessUnlessGranted('update', $user);

        if ($clearMissing) {
            $options = ['validation_groups' => ['Default', 'FullUpdate']];
        } else {
            $options = [];
        }

        $form = $this->createForm(UserType::class, $user, $options);
        $form->submit($request->request->all(), $clearMissing);

        if ($form->isValid()) {
            if (!empty($user->getUserPlainPassword())) {
                $encoder = $this->get('security.password_encoder');
                $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
                $user->setUserPassword($encoded);
            }
            $em->persist($user);
            $em->flush();
            return $user;
        } else {
            return $form;
        }
    }

    private function userNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
    }
}