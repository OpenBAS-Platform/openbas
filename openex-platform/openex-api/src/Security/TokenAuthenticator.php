<?php

namespace App\Security;

use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\HttpUtils;

class TokenAuthenticator extends AbstractAuthenticator
{
    protected HttpUtils $httpUtils;
    protected EntityManager $em;

    public function __construct(HttpUtils $httpUtils, EntityManager $em)
    {
        $this->httpUtils = $httpUtils;
        $this->em = $em;
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-Authorization-Token') || $request->cookies->has('openex_token');
    }

    public function authenticate(Request $request): Passport
    {
        $header = $request->headers->get('X-Authorization-Token');
        $cookie = json_decode($request->cookies->get('openex_token'));
        $tokenValue = $header !== null ? $header : $cookie->token_value;
        if (null === $tokenValue) {
            // The token header was empty, authentication fails with HTTP Status
            // Code 401 "Unauthorized"
            throw new CustomUserMessageAuthenticationException('No API token provided');
        }
        $userLoader = function($token) {
            $token = $this->em->getRepository('App:Token')->findOneBy(['token_value' => $token]);
            return $token->getTokenUser();
        };
        return new SelfValidatingPassport(new UserBadge($tokenValue, $userLoader));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $data = ['message' => strtr($exception->getMessageKey(), $exception->getMessageData())];
        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }
}
