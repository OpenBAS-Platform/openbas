<?php

namespace APIBundle\Security;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use APIBundle\Entity\Group;
use APIBundle\Entity\User;

class GroupVoter extends Voter
{
    const SELECT = 'select';
    const UPDATE = 'update';
    const DELETE = 'delete';

    protected function supports($attribute, $group)
    {
        if (!in_array($attribute, array(self::SELECT, self::UPDATE, self::DELETE))) {
            return false;
        }

        if (!$group instanceof Group) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $targetUser, TokenInterface $token)
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        if( $user->isAdmin() ) {
            return true;
        }

        return false;
    }
}