<?php

namespace App\Security;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class TokenUserProvider implements UserProviderInterface
{
    protected $tokenRepository;
    protected $userRepository;

    public function __construct(EntityManager $em)
    {
        $this->tokenRepository = $em->getRepository('App:Token');
        $this->userRepository = $em->getRepository('App:User');
    }

    public function getToken($tokenHeader)
    {
        return $this->tokenRepository->findOneBy(['token_value' => $tokenHeader]);
    }

    public function loadUserByUsername($login)
    {
        return $this->userRepository->findBy(['user_login' => $login]);
    }

    public function refreshUser(UserInterface $user)
    {
        throw new UnsupportedUserException();
    }

    public function supportsClass($class)
    {
        return 'App\Entity\User' === $class;
    }
}
