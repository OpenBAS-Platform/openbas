<?php

namespace APIBundle\Security;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;

class ExerciseVoter extends Voter
{
    const VIEW = 'view';
    const EDIT = 'edit';

    private $decisionManager;

    public function __construct(AccessDecisionManagerInterface $decisionManager)
    {
        $this->decisionManager = $decisionManager;
    }

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

        if ($this->decisionManager->decide($token, array('ROLE_' . $exercise->getExerciseId() . '_ADMIN')))
            return true;

        switch ($attribute) {
            case self::VIEW:
                return $this->canView($exercise, $token);
            case self::EDIT:
                return $this->canEdit($exercise, $token);
        }

        throw new \LogicException('This code should not be reached!');
    }

    private function canView(Exercise $exercise, TokenInterface $token)
    {
        if ($this->canEdit($exercise, $token)) {
            return true;
        }

        if ($this->decisionManager->decide($token, array('ROLE_' . $exercise->getExerciseId() . '_PLAYER', 'ROLE_' . $exercise->getExerciseId() . '_OBSERVER'))) {
            return true;
        }

        return false;
    }

    private function canEdit(Exercise $exercise, TokenInterface $token)
    {
        if ($this->decisionManager->decide($token, array('ROLE_' . $exercise->getExerciseId() . '_PLANNER'))) {
            return true;
        }
    }
}