<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="subobjectives")
 */
class Subobjective
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $subobjective_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $subobjective_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $subobjective_description;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $subobjective_priority;

    /**
     * @ORM\ManyToOne(targetEntity="Objective", inversedBy="objective_subobjectives")
     * @ORM\JoinColumn(name="subobjective_objective", referencedColumnName="objective_id", onDelete="CASCADE")
     * @var Objective
     */
    protected $subobjective_objective;

    /**
     * @ORM\ManyToMany(targetEntity="Incident", mappedBy="incident_subobjectives")
     * @var Incident[]
     */
    protected $subobjective_incidents;

    protected $subobjective_exercise;

    public function __construct()
    {
        $this->subobjective_incidents = new ArrayCollection();
    }

    public function getSubobjectiveId()
    {
        return $this->subobjective_id;
    }

    public function setSubobjectiveId($id)
    {
        $this->subobjective_id = $id;
        return $this;
    }

    public function getSubobjectiveTitle()
    {
        return $this->subobjective_title;
    }

    public function setSubobjectiveTitle($title)
    {
        $this->subobjective_title = $title;
        return $this;
    }

    public function getSubobjectiveDescription()
    {
        return $this->subobjective_description;
    }

    public function setSubobjectiveDescription($description)
    {
        $this->subobjective_description = $description;
        return $this;
    }

    public function getSubobjectivePriority()
    {
        return $this->subobjective_priority;
    }

    public function setSubobjectivePriority($priority)
    {
        $this->subobjective_priority = $priority;
        return $this;
    }

    public function getSubobjectiveObjective()
    {
        return $this->subobjective_objective;
    }

    public function setSubobjectiveObjective($objective)
    {
        $this->subobjective_objective = $objective;
        return $this;
    }

    public function getSubobjectiveIncidents()
    {
        return $this->subobjective_incidents;
    }

    public function setSubobjectiveIncidents($incidents)
    {
        $this->subobjective_incidents = $incidents;
        return $this;
    }

    public function getSubobjectiveExercise()
    {
        return $this->subobjective_exercise;
    }

    public function setSubobjectiveExercise($exercise)
    {
        $this->subobjective_exercise = $exercise;
        return $this;
    }
}