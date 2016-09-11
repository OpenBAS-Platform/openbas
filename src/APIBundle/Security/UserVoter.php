<?php

namespace APIBundle\Security;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\User;
use APIBundle\Entity\Grant;

class UserVoter extends Voter
{
    const SELECT = 'select';
    const UPDATE = 'update';
    const DELETE = 'delete';

    protected function supports($attribute, $targetUser)
    {
        if (!in_array($attribute, array(self::SELECT, self::UPDATE, self::DELETE))) {
            return false;
        }

        if (!$targetUser instanceof User) {
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

        switch ($attribute) {
            case self::SELECT:
                return $this->canSelect($targetUser, $user);
            case self::UPDATE:
                return $this->canUpdate($targetUser, $user);
            case self::DELETE:
                return $this->canDelete($targetUser, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canSelect(User $targetUser, User $user)
    {
        if( $targetUser->getUserId() == $user->getUserId() ) {
            return true;
        }

        $grants = $targetUser->getGrants();
        /* @var $grants Grant[] */

        foreach( $grants as $grant ) {
            if( $grant->getGrantExercise() ) {

            }
        }

        return false;
    }

    private function canUpdate(User $targetUser, User $user)
    {
        if( $targetUser->getUserId() == $user->getUserId() ) {
            return true;
        }

        return false;
    }

    private function canDelete(User $targetUser, User $user)
    {
        if( $targetUser->getUserId() == $user->getUserId() ) {
            return true;
        }

        return false;
    }
}
