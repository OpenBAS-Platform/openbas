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
     * @ORM\Column(type="smallint")
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

    public function setObjectiveDescription($description)
    {
        $this->objective_description = $description;
        return $this;
    }

    public function getObjectivePriority()
    {
        return $this->objective_priority;
    }

    public function setObjectivePriority($priority)
    {
        $this->objective_priority = $priority;
        return $this;
    }

    public function getObjectiveExercise()
    {
        return $this->objective_exercise;
    }

    public function setEventExercise($exercise)
    {
        $this->objective_exercise = $exercise;
        return $this;
    }

    public function getObjectiveIncidents()
    {
        return $this->objective_incidents;
    }

    public function setObjectiveIncidents($incidents)
    {
        $this->objective_incidents = $incidents;
        return $this;
    }
}