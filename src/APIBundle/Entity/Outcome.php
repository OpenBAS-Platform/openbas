<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="outcomes")
 */
class Outcome
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $outcome_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $outcome_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $outcome_description;

    /**
     * @ORM\OneToMany(targetEntity="Incident", mappedBy="incident_outcome")
     * @var Incident[]
     */
    protected $outcome_incident;

    /**
     * @ORM\ManyToOne(targetEntity="State")
     * @ORM\JoinColumn(name="outcome_state", referencedColumnName="state_id")
     */
    protected $outcome_state;

    public function getOutcomeId()
    {
        return $this->outcome_id;
    }

    public function setOutcomeId($id)
    {
        $this->outcome_id = $id;
        return $this;
    }

    public function getOutcomeTitle()
    {
        return $this->outcome_title;
    }

    public function setOutcomeTitle($title)
    {
        $this->outcome_title = $title;
        return $this;
    }

    public function getOutcomeDescription()
    {
        return $this->outcome_description;
    }

    public function setOutcomeDescription($description)
    {
        $this->outcome_description = $description;
        return $this;
    }

    public function getOutcomeIncident()
    {
        return $this->outcome_incident;
    }

    public function setOutcomeIncident($incident)
    {
        $this->outcome_incident = $incident;
        return $this;
    }

    public function getOutcomeState()
    {
        return $this->outcome_state;
    }

    public function setOutcomeState($state)
    {
        $this->outcome_state = $state;
        return $this;
    }
}