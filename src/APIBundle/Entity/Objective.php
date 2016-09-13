<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="objectives")
 */
class Objective
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $objective_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $objective_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $objective_description;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $objective_priority;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_objectives")
     * @ORM\JoinColumn(name="objective_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $objective_exercise;

    /**
     * @ORM\ManyToMany(targetEntity="Incident", inversedBy="incident_objectives")
     * @ORM\JoinTable(name="objectives_incidents",
     *      joinColumns={@ORM\JoinColumn(name="objective_id", referencedColumnName="objective_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="incident_id", referencedColumnName="incident_id", onDelete="CASCADE")}
     *      )
     */
    protected $objective_incidents;

    public function __construct()
    {
        $this->objective_incidents = new ArrayCollection();
    }

    public function getObjectiveId()
    {
        return $this->objective_id;
    }

    public function setObjectiveId($id)
    {
        $this->objective_id = $id;
        return $this;
    }

    public function getObjectiveTitle()
    {
        return $this->objective_title;
    }

    public function setObjectiveTitle($title)
    {
        $this->objective_title = $title;
        return $this;
    }

    public function getObjectiveDescription()
    {
        return $this->objective_description;
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