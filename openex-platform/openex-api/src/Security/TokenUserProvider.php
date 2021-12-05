<?php

namespace App\Security;

use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class TokenUserProvider implements UserProviderInterface
{
    protected EntityRepository $tokenRepository;
    protected EntityRepository $userRepository;

    public function __construct(EntityManager $em)
    {
        $this->tokenRepository = $em->getRepository('App:Token');
        $this->userRepository = $em->getRepository('App:User');
    }

    public function getToken($tokenHeader)
    {
        return $this->tokenRepository->findOneBy(['token_value' => $tokenHeader]);
    }

    public function loadUserByUsername($login): UserInterface
    {
        return $this->userRepository->findBy(['user_login' => $login]);
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        return $this->userRepository->findBy(['user_login' => $identifier]);
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        throw new UnsupportedUserException();
    }

    public function supportsClass($class): bool
    {
        return 'App\Entity\User' === $class;
    }
}
