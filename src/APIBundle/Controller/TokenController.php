<?php

namespace APIBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use APIBundle\Form\Type\CredentialsType;
use APIBundle\Entity\Token;
use APIBundle\Entity\Credentials;

class TokenController extends Controller
{
    /**
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"token"})
     * @Rest\Post("/tokens")
     */
    public function postTokensAction(Request $request)
    {
        $credentials = new Credentials();
        $form = $this->createForm(CredentialsType::class, $credentials);

        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->findOneBy(['user_email' => $credentials->getLogin()]);

        if (!$user) {
            return $this->invalidCredentials();
        }

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
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"token"})
     * @Rest\Delete("/tokens/{token_id}")
     */
    public function removeTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $token = $em->getRepository('APIBundle:Token')
            ->find($request->get('token_id'));
        /* @var $token Token */

        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        if ($token && $token->getTokenUser()->getUserId() === $connectedUser->getUserId()) {
            $em->remove($token);
            $em->flush();
        } else {
            throw new \Symfony\Component\HttpKernel\Exception\BadRequestHttpException();
        }
    }

    private function invalidCredentials()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Invalid credentials'], Response::HTTP_BAD_REQUEST);
    }
}