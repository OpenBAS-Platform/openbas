<?php

namespace App\Security;

use App\Entity\Exercise;
use App\Entity\User;
use LogicException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ExerciseVoter extends Voter
{
    const SELECT = 'select';
    const UPDATE = 'update';
    const DELETE = 'delete';

    protected function supports($attribute, $exercise)
    {
        if (!in_array($attribute, array(self::SELECT, self::UPDATE, self::DELETE))) {
            return false;
        }

        if (!$exercise instanceof Exercise) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute($attribute, $exercise, TokenInterface $token)
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        switch ($attribute) {
            case self::SELECT:
                return $this->canSelect($exercise, $user);
            case self::UPDATE:
                return $this->canUpdate($exercise, $user);
            case self::DELETE:
                return $this->canDelete($exercise, $user);
        }

        throw new LogicException('This code should not be reached!');
    }

    private function canSelect(Exercise $exercise, User $user)
    {
        if (in_array($this->findGrant($exercise, $user), array('ADMIN', 'PLANNER', 'PLAYER', 'OBSERVER'))) {
            return true;
        }

        return false;
    }

    private function findGrant(Exercise $exercise, User $user)
    {
        $grants = $user->getGrants();
        if (isset($grants[$exercise->getExerciseId()])) {
            return $grants[$exercise->getExerciseId()];
        } else {
            return 'DENIED';
        }
    }

    private function canUpdate(Exercise $exercise, User $user)
    {
        if (in_array($this->findGrant($exercise, $user), array('ADMIN', 'PLANNER'))) {
            return true;
        }

        return false;
    }

    private function canDelete(Exercise $exercise, User $user)
    {
        if (in_array($this->findGrant($exercise, $user), array('ADMIN'))) {
            return true;
        }

        return false;
    }
}
