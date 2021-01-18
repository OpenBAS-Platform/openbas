<?php

namespace App\Security;

use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;
use Symfony\Component\Security\Http\HttpUtils;

class TokenAuthenticator extends AbstractGuardAuthenticator
{
    const TOKEN_VALIDITY_DURATION = 31536000; // 3600 * 24 * 365
    protected $httpUtils;
    protected $em;

    public function __construct(HttpUtils $httpUtils, EntityManager $em)
    {
        $this->httpUtils = $httpUtils;
        $this->em = $em;
    }

    public function start(Request $request, AuthenticationException $authException = null)
    {
        $data = [
            'message' => 'Authentication Required'
        ];
        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    public function supports(Request $request)
    {
        return $request->headers->has('X-Authorization-Token') || $request->cookies->has('openex_token');
    }

    public function getCredentials(Request $request)
    {
        $header = $request->headers->get('X-Authorization-Token');
        $cookie = json_decode($request->cookies->get('openex_token'));
        return $header !== null ? $header : $cookie->token_value;
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        if ($credentials && strlen($credentials) > 0) {
            $token = $this->em->getRepository('App:Token')->findOneBy(['token_value' => $credentials]);
            if( $token ) {
                return $token->getTokenUser();
            }
        }
        return null;
    }

    public function checkCredentials($credentials, UserInterface $user)
    {
        return true;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $data = [
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData())
        ];
        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $providerKey)
    {
        return null;
    }

    public function supportsRememberMe()
    {
        return false;
    }
}
