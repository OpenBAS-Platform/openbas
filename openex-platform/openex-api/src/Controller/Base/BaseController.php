<?php

namespace App\Controller\Base;

use App\Entity\Audience;
use App\Entity\Subaudience;
use App\Entity\Event;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class BaseController extends AbstractFOSRestController
{
    const UPDATE = 'update';
    const DELETE = 'delete';

    private TokenStorageInterface $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * Check if user as grant to access to an object
     * @param String $attributes can be 'select'|'update'|'delete'
     * @param mixed $object The object
     * @return boolean
     */
    protected function hasGranted(String $attributes, mixed $object = null): bool
    {
        $User = $this->tokenStorage->getToken()->getUser();
        if ($User->isAdmin()) {
            return true;
        }
        if ($object instanceof Audience) {
            if (count($object->getAudiencePlanificateurUsers()) > 0) {
                return $object->isPlanificateurUser($User);
            } else {
                return true;
            }
        } elseif ($object instanceof Event) {
            if (count($object->getPlanificateurUsers()) > 0) {
                return $object->isPlanificateurUser($User);
            } else {
                return true;
            }
        } elseif ($object instanceof Subaudience) {
            $audience = $object->getSubaudienceAudience();
            if (count($audience->getAudiencePlanificateurUsers()) > 0) {
                return $audience->isPlanificateurUser($User);
            } else {
                return true;
            }
        } else {
            return $this->isGranted($attributes, $object);
        }
    }
}
