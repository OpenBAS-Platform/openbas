<?php

namespace APIBundle\Security;

use APIBundle\Entity\User;
use APIBundle\Entity\Token;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\PreAuthenticatedToken;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Http\Authentication\SimplePreAuthenticatorInterface;
use Symfony\Component\Security\Http\HttpUtils;
use Doctrine\ORM\EntityManager;

class TokenAuthenticator implements SimplePreAuthenticatorInterface, AuthenticationFailureHandlerInterface
{
    const TOKEN_VALIDITY_DURATION = 31536000; // 3600 * 24 * 365
    protected $httpUtils;
    protected $em;
    protected $userRepository;

    public function __construct(HttpUtils $httpUtils, EntityManager $em)
    {
        $this->httpUtils = $httpUtils;
        $this->em = $em;
    }

    /**
     * @param Request $request
     * @param $providerKey
     * @return PreAuthenticatedToken|void
     */
    public function createToken(Request $request, $providerKey)
    {
        $targetUrl = '/api/tokens';
        if ($request->getMethod() === "POST" && $this->httpUtils->checkRequestPath($request, $targetUrl)) {
            return;
        }

        $kerberosUrl = '/api/tokens/kerberos';
        if ($request->getMethod() === "GET" && $this->httpUtils->checkRequestPath($request, $kerberosUrl)) {
            return;
        }

        $apacheAuthUser = $request->server->get('REMOTE_USER');
        if ($apacheAuthUser !== null) {
            $user = $this->em->getRepository('APIBundle:User')->findOneBy(['user_login' => $apacheAuthUser]);
            if (!$user) {
                $user = new User();
                $user->setUserLogin($apacheAuthUser);
                $user->setUserEmail($apacheAuthUser);
                $user->setUserFirstname($apacheAuthUser);
                $user->setUserLastname('Doe');
                $user->setUserAdmin(false);
                $user->setUserStatus(1);
                $user->setUserLang('auto');
                $this->em->persist($user);
                $this->em->flush();
                $user->setUserGravatar();
            }

            $token = $this->em->getRepository('APIBundle:Token')->findOneBy(['token_user' => $user->getUserId()]);
            if (!$token) {
                $token = new Token();
                $token->setTokenValue(base64_encode(random_bytes(50)));
                $token->setTokenCreatedAt(new \DateTime('now'));
                $token->setTokenUser($user);

                $this->em->persist($token);
                $this->em->flush();
            }

            return new PreAuthenticatedToken(
                'anon.',
                $token->getTokenValue(),
                $providerKey
            );
        }

        $tokenHeader = $request->headers->get('Authorization');

        if (!$tokenHeader) {
            throw new BadCredentialsException('Authorization header is required');
        }

        return new PreAuthenticatedToken(
            'anon.',
            $tokenHeader,
            $providerKey
        );
    }

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        if (!$userProvider instanceof TokenUserProvider) {
            throw new \InvalidArgumentException(
                sprintf(
                    'The user provider must be an instance of TokenUserProvider (%s was given).',
                    get_class($userProvider)
                )
            );
        }

        $tokenHeader = $token->getCredentials();
        $token = $userProvider->getToken($tokenHeader);

        if (!$token || !$this->isTokenValid($token)) {
            throw new BadCredentialsException('Invalid authentication token');
        }

        $user = $token->getTokenUser();
        $pre = new PreAuthenticatedToken(
            $user,
            $tokenHeader,
            $providerKey,
            $user->getRoles()
        );

        $pre->setAuthenticated(true);

        return $pre;
    }

    public function supportsToken(TokenInterface $token, $providerKey)
    {
        return $token instanceof PreAuthenticatedToken && $token->getProviderKey() === $providerKey;
    }

    private function isTokenValid($token)
    {
        //return (time() - $token->getTokenCreatedAt()->getTimestamp()) < self::TOKEN_VALIDITY_DURATION;
        return true;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        throw $exception;
    }
}