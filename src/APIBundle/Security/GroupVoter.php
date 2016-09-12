<?php

namespace APIBundle\Security;


use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\User;
use APIBundle\Entity\Group;
use APIBundle\Entity\Grant;

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

    protected function voteOnAttribute($attribute, $group, TokenInterface $token)
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
                return $this->canSelect($group, $user);
            case self::UPDATE:
                return $this->canUpdate($group, $user);
            case self::DELETE:
                return $this->canDelete($group, $user);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canSelect(Group $group, User $user)
    {
        if ($this->computeIntersection($group, $user, 'ANY')) {
            return true;
        }

        return false;
    }

    private function canUpdate(Group $group, User $user)
    {
        if ($this->computeIntersection($group, $user, 'PLANNER')) {
            return true;
        }

        if ($this->computeIntersection($group, $user, 'ADMIN')) {
            return true;
        }

        return false;
    }

    private function canDelete(Group $group, User $user)
    {
        return false;
    }

    private function computeIntersection(Group $group, User $user, $grantName)
    {
        $groupExercises = [];
        $userExercises = [];

        $groupGrants = $group->getGroupGrants();
        /* @var $groupGrants Grant[] */
        $userGrants = $user->getGrants();
        /* @var $userGrants Grant[] */

        foreach ($groupGrants as $grant) {
            $groupExercises[] = $grant->getGrantExercise()->getExerciseId();
        }

        if ($grantName == 'ANY') {
            foreach ($userGrants as $grant) {
                $userExercises[] = $grant->getGrantExercise()->getExerciseId();
            }
        } else {
            foreach ($userGrants as $grant) {
                if ($grant->getGrantName() == $grantName) {
                    $userExercises[] = $grant->getGrantExercise()->getExerciseId();
                }
            }
        }

        $intersection = array_intersect($groupExercises, $userExercises);

        if (count($intersection) > 0) {
            return true;
        } else {
            return false;
        }
    }
}
