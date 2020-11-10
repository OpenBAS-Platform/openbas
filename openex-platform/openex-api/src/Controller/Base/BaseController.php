<?php

namespace App\Controller\Base;

use App\Entity\Event;
use FOS\RestBundle\Controller\AbstractFOSRestController;

class BaseController extends AbstractFOSRestController
{
    const UPDATE = 'update';
    const DELETE = 'delete';

    /**
     * Check if user as grant to access to an object
     * @param type $attributes can be 'select'|'update'|'delete'
     * @param type $object The object
     * @return boolean
     */
    protected function hasGranted($attributes, $object = null)
    {
        $User = $this->get('security.token_storage')->getToken()->getUser();
        if ($User->isAdmin()) {
            return true;
        }
        if ($object instanceof App\Entity\Audience) {
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
        } elseif ($object instanceof App\Entity\Subaudience) {
            $audience = $object->getSubaudienceAudience();
            if (count($audience->getPlanificateurUsers()) > 0) {
                return $audience->isPlanificateurUser($User);
            } else {
                return true;
            }
        } else {
            return $this->isGranted($attributes, $object);
        }
    }
}
