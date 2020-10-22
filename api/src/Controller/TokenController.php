<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;
use App\Form\Type\CredentialsType;
use App\Entity\Token;
use App\Entity\Credentials;

class TokenController extends Controller
{
    /**
     * @SWG\Property(
     *    description="Get a Kerberos token",
     * )
     * @Rest\View(serializerGroups={"token"})
     * @Rest\Get("/tokens/kerberos")
     */
    public function getKerberosTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $apacheAuthUser = $request->server->get('REMOTE_USER');

        if ($apacheAuthUser === null) {
            return $this->noKerberos();
        }

        $user = $em->getRepository('App:User')->findOneBy(['user_login' => $apacheAuthUser]);
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

        $token = $em->getRepository('App:Token')->findOneBy(['token_user' => $user->getUserId()]);
        if (!$token) {
            $token = new Token();
            $token->setTokenValue(base64_encode(random_bytes(50)));
            $token->setTokenCreatedAt(new \DateTime('now'));
            $token->setTokenUser($user);

            $em->persist($token);
            $em->flush();
        }

        return $token;
    }

    /**
     * @SWG\Property(
     *    description="Create a token"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"token"})
     * @Rest\Post("/tokens")
     */
    public function postTokensAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $credentials = new Credentials();
        $form = $this->createForm(CredentialsType::class, $credentials);

        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $user = $em->getRepository('App:User')->findOneBy(['user_login' => $credentials->getLogin()]);

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
     * @SWG\Property(
     *    description="Delete a token",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"token"})
     * @Rest\Delete("/tokens/{token_id}")
     */
    public function removeTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $token = $em->getRepository('App:Token')->find($request->get('token_id'));
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
     * @SWG\Property(
     *    description="Read a token",
     * )
     *
     * @Rest\View(serializerGroups={"token"})
     * @Rest\Get("/tokens/{token_id}")
     */
    public function getTokenAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $token = $em->getRepository('App:Token')->find($request->get('token_id'));
        /* @var $token Token */

        $connectedUser = $this->get('security.token_storage')->getToken()->getUser();

        if ($token && $token->getTokenUser()->getUserId() === $connectedUser->getUserId() || $connectedUser->isAdmin()) {
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

    private function noKerberos()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Kerberos is not detected'], Response::HTTP_BAD_REQUEST);
    }
}
