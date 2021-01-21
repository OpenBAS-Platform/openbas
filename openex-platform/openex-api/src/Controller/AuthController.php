<?php

namespace App\Controller;

use App\Entity\Credentials;
use App\Entity\Token;
use App\Entity\User;
use App\Form\Type\CredentialsType;
use DateTime;
use Drenso\OidcBundle\OidcClient;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;

class AuthController extends AbstractController
{
    private $passwordEncoder;

    public function __construct(UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }

    private function setupCookie($token, $response) {
        $data = [
            "token_id" => $token->getTokenId(),
            "token_user" => $token->getTokenUser(),
            "token_value" => $token->getTokenValue()
        ];
        $cookie = Cookie::create('openex_token')
            ->withValue(json_encode($data))
            // ->withExpires(strtotime('Fri, 20-May-2011 15:25:52 GMT'))
            // ->withDomain('.example.com')
            ->withSameSite(null)
            ->withHttpOnly(true)
            ->withSecure($this->getParameter('cookie_secure'));
        // Redirect to /private
        $response->headers->setCookie($cookie);
    }

    /**
     *
     * @OA\Response(
     *    response=200,
     *    description="Logout (delete the cookie)"
     * )
     *
     * @Route("/api/logout", name="auth_logout", methods={"GET"})
     */
    public function logoutAction(Request $request) {
        $response = new Response();
        $response->headers->clearCookie('openex_token', null, null, false, true);
        return $response;
    }

    /**
     * @Route("/api/auth/kerberos", name="connect_kerberos", methods={"GET"})
     */
    public function getAuthKerberosTokenAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
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
            $token->setTokenCreatedAt(new DateTime('now'));
            $token->setTokenUser($user);

            $em->persist($token);
            $em->flush();
        }
        // Create and setup the cookie
        $serializer = $this->container->get('serializer');
        $userSerialized = $serializer->serialize($user, 'json',  ['groups' => 'user']);
        $response = new Response($userSerialized);
        $this->setupCookie($token, $response);
        return $response;
    }
    private function noKerberos()
    {
        return View::create(['message' => 'Kerberos is not detected']);
    }

    /**
     * @Route("/api/auth", name="connect_local", methods={"POST"})
     */
    public function postAuthAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
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
        $isPasswordValid = $this->passwordEncoder->isPasswordValid($user, $credentials->getPassword());
        if (!$isPasswordValid) {
            return $this->invalidCredentials();
        }

        $tokens = $user->getUserTokens();
        if( count($tokens) > 0 ) {
            $token = $tokens[0];
        } else {
            $token = new Token();
            $token->setTokenValue(base64_encode(random_bytes(50)));
            $token->setTokenCreatedAt(new DateTime('now'));
            $token->setTokenUser($user);
            $em->persist($token);
            $em->flush();
        }
        // Create and setup the cookie
        $serializer = $this->container->get('serializer');
        $userSerialized = $serializer->serialize($user, 'json',  ['groups' => 'user']);
        $response = new Response($userSerialized);
        $this->setupCookie($token, $response);
        return $response;
    }
    private function invalidCredentials()
    {
        return View::create(['message' => 'Invalid credentials'], Response::HTTP_BAD_REQUEST);
    }

    /**
     * @Route("/connect/oidc", name="connect_oidc", methods={"GET"})
     */
    public function connect(SessionInterface $session, OidcClient $oidc)
    {
        // Remove errors from state
        $session->remove(Security::AUTHENTICATION_ERROR);
        $session->remove(Security::LAST_USERNAME);
        return $oidc->generateAuthorizationRedirect();
    }
    /**
     * @Route("/connect/oidc/check", name="connect_oidc_check", methods={"GET"})
     */
    public function check(Request $request, OidcClient $oidc)
    {
        $em = $this->getDoctrine()->getManager();
        if (($authData = $oidc->authenticate($request)) === NULL) {
            return new JsonResponse('ERROR');
        }
        // Retrieve the user date with the authentication data
        $userData = $oidc->retrieveUserInfo($authData);
        // $user_id = $userData["sub"];
        $email = $userData["email"];
        // $email_verified = $userData["email_verified"];
        // $name = $userData["name"];
        $given_name = $userData["given_name"];
        $family_name = $userData["family_name"];
        // Create the user if needed
        $user = $em->getRepository('App:User')->findOneBy(['user_login' => $email]);
        if (!$user) {
            $user = new User();
            $user->setUserLogin($email);
            $user->setUserEmail($email);
            $user->setUserFirstname($given_name);
            $user->setUserLastname($family_name);
            $user->setUserAdmin(false);
            $user->setUserStatus(1);
            $user->setUserLang('auto');
            $em->persist($user);
            $em->flush();
            $user->setUserGravatar();
        }
        // Create the token if needed
        $token = $em->getRepository('App:Token')->findOneBy(['token_user' => $user->getUserId()]);
        if (!$token) {
            $token = new Token();
            $token->setTokenValue(base64_encode(random_bytes(50)));
            $token->setTokenCreatedAt(new DateTime('now'));
            $token->setTokenUser($user);
            $em->persist($token);
            $em->flush();
        }
        // Create and setup the cookie
        $response = new RedirectResponse('/private');
        $this->setupCookie($token, $response);
        return $response;
    }
}
