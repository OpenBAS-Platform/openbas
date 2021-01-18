<?php

namespace App\Controller;

use App\Entity\Token;
use App\Entity\User;
use DateTime;
use Drenso\OidcBundle\OidcClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

class OidcController extends AbstractController
{
    /**
     * @Route("/connect/oidc", name="connect_oidc")
     */
    public function connect(SessionInterface $session, OidcClient $oidc)
    {
        // Remove errors from state
        $session->remove(Security::AUTHENTICATION_ERROR);
        $session->remove(Security::LAST_USERNAME);
        return $oidc->generateAuthorizationRedirect();
    }

    /**
     * @Route("/connect/oidc/check", name="connect_oidc_check")
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
        $data = [
            "token_id" => $token->getTokenId(),
            "token_user" => $token->getTokenUser(),
            "token_value" => $token->getTokenValue()
        ];
        $cookie = Cookie::create('openex_token')
            ->withValue(json_encode($data))
            // ->withExpires(strtotime('Fri, 20-May-2011 15:25:52 GMT'))
            // ->withDomain('.example.com')
            ->withHttpOnly(true)
            ->withSecure(false);
        // Redirect to /private
        $response = new RedirectResponse('/private');
        $response->headers->setCookie($cookie);
        return $response;
    }
}
