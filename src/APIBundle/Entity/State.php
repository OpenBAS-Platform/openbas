<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="states")
 */
class State
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $state_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $state_name;

    public function getStateId()
    {
        return $this->state_id;
    }

    public function setStateId($id)
    {
        $this->state_id = $id;
        return $this;
    }

    public function getStateName()
    {
        return $this->state_name;
    }

    public function setStateName($name)
    {
        $this->state_name = $name;
        return $this;
    }
}