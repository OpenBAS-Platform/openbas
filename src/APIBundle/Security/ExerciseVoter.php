<?php

namespace APIBundle\Security;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExerciseVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';

    protected function supports($attribute, $subject)
    {
        if (!in_array($attribute, array(self::VIEW, self::EDIT))) {
            return false;
        }

        if (!$subject instanceof Exercise) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Exercise $exercise */
        $exercise = $subject;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($exercise, $user);
            case self::EDIT:
                return $this->canEdit($exercise, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canView(Exercise $exercise, User $user)
    {
        if ($this->canEdit($exercise, $user)) {
            return true;
        }

        return !$exercise->isPrivate();
    }

    private function canEdit(Exercise $exercise, User $user)
    {
        // this assumes that the data object has a getOwner() method
        // to get the entity of the user who owns this data object
        return $user === $exercise->getOwner();
    }
}