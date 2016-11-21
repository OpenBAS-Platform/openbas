<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="injects_states")
 */
class InjectState
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $state_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $state_name;

    /**
     * @ORM\OneToOne(targetEntity="Inject")
     * @ORM\JoinColumn(name="state_inject", referencedColumnName="inject_id", onDelete="CASCADE")
     */
    protected $state_inject;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $state_error;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $state_date;

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

    public function getStateError()
    {
        return $this->state_error;
    }

    public function setStateError($error)
    {
        $this->state_error = $error;
        return $this;
    }

    public function getStateDate()
    {
        return $this->state_date;
    }

    public function setStateDate($date)
    {
        $this->state_date = $date;
        return $this;
    }
}