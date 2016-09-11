<?php

namespace APIBundle\Security;

use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Doctrine\ORM\EntityRepository;

class TokenUserProvider implements UserProviderInterface
{
    protected $tokenRepository;
    protected $userRepository;

    public function __construct(EntityRepository $tokenRepository, EntityRepository $userRepository)
    {
        $this->tokenRepository = $tokenRepository;
        $this->userRepository = $userRepository;
    }

    public function getToken($tokenHeader)
    {
        return $this->tokenRepository->findOneBy(['token_value' => $tokenHeader]);
    }

    public function loadUserByUsername($email)
    {
        return $this->userRepository->findBy(['user_email' => $email]);
    }

    public function refreshUser(UserInterface $user)
    {
        throw new UnsupportedUserException();
    }

    public function supportsClass($class)
    {
        return 'APIBundle\Entity\User' === $class;
    }
}