<?php

namespace APIBundle\Controller;

use APIBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Form\Type\CredentialsType;
use APIBundle\Entity\Token;
use APIBundle\Entity\Credentials;

class TokenController extends Controller
{
    /**
     * @ApiDoc(
     *    description="Create a token",
     *   input={"class"=CredentialsType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"token"})
     * @Rest\Post("/tokens")
     */
    public function postTokensAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $apacheAuthUser = $request->server->get('REMOTE_USER');
        if( $apacheAuthUser !== null ) {
            $user = $em->getRepository('APIBundle:User')->findOneBy(['user_login' => $apacheAuthUser]);
            if (!$user) {
                $user = new User();
                $user->setUserLogin($apacheAuthUser);
                $user->setUserEmail($apacheAuthUser);
                $user->setUserFirstname($apacheAuthUser);
                $user->setUserLastname('Doe');
                $user->setUserAdmin(false);
                $user->setUserStatus(1);
                $user->setUserLang('auto');
                $em->persist($user);
                $em->flush();
                $user->setUserGravatar();
            }

            $token = new Token();
            $token->setTokenValue(base64_encode(random_bytes(50)));
            $token->setTokenCreatedAt(new \DateTime('now'));
            $token->setTokenUser($user);

            $em->persist($token);
            $em->flush();

            return $token;
        }

        $credentials = new Credentials();
        $form = $this->createForm(CredentialsType::class, $credentials);

        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $user = $em->getRepository('APIBundle:User')->findOneBy(['user_login' => $credentials->getLogin()]);

        if (!$user) {
            return $this->invalidCredentials();
        }
        $user->setUserGravatar();

        $encoder = $this->get('security.password_encoder');
        $isPasswordValid = $encoder->isPasswordValid($user, $credentials->getPassword());

        if (!$isPasswordValid) {
            return $this->invalidCredentials();
        }

        $token = new Token();
        $token->setTokenValue(base64_encode(random_bytes(50)));
        $token->setTokenCreatedAt(new \DateTime('now'));
        $token->setTokenUser($user);

        $em->persist($token);
        $em->flush();

        return $token;
    }

    /**
     * @ApiDoc(
     *    description="Delete a token",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"token"})
     * @Rest\Delete("/tokens/{token_id}")
     */
    public function removeTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $token = $em->getRepository('APIBundle:Token')->find($request->get('token_id'));
        /* @var $token Token */

        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        if ($token && $token->getTokenUser()->getUserId() === $connectedUser->getUserId() || $connectedUser->isAdmin()) {
            $em->remove($token);
            $em->flush();
        } else {
            throw new \Symfony\Component\HttpKernel\Exception\BadRequestHttpException();
        }
    }

    /**
     * @ApiDoc(
     *    description="Read a token",
     * )
     *
     * @Rest\View(serializerGroups={"token"})
     * @Rest\Get("/tokens/{token_id}")
     */
    public function getTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $token = $em->getRepository('APIBundle:Token')->find($request->get('token_id'));
        /* @var $token Token */

        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        if ($token && $token->getTokenUser()->getUserId() === $connectedUser->getUserId() || $connectedUser->isAdmin() ) {
            $token->setTokenUser($token->getTokenUser()->setUserGravatar());
            return $token;
        } else {
            throw new \Symfony\Component\HttpKernel\Exception\BadRequestHttpException();
        }
    }

    private function invalidCredentials()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Invalid credentials'], Response::HTTP_BAD_REQUEST);
    }
}