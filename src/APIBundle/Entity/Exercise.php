<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="exercises")
 */
class Exercise
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $exercise_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $exercise_name;

    /**
     * @ORM\Column(type="string")
     */
    protected $exercise_description;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $exercise_start_date;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $exercise_end_date;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $exercise_status;

    /**
     * @ORM\OneToMany(targetEntity="Event", mappedBy="exercise")
     * @var Event[]
     */
    protected $exercise_events;

    public function __construct()
    {
        $this->exercise_events = new ArrayCollection();
    }

    public function getExerciseId()
    {
        return $this->exercise_id;
    }

    public function setExerciseId($id)
    {
        $this->exercise_id = $id;
        return $this;
    }

    public function getExerciseName()
    {
        return $this->exercise_name;
    }

    public function setExerciseName($name)
    {
        $this->exercise_name = $name;
        return $this;
    }

    public function getExerciseDescription()
    {
        return $this->exercise_description;
    }

    public function setExerciseDescription($description)
    {
        $this->exercise_description = $description;
        return $this;
    }

    public function getExerciseStartDate()
    {
        return $this->exercise_start_date;
    }

    public function setExerciseStartDate($startDate)
    {
        $this->exercise_start_date = $startDate;
        return $this;
    }

    public function getExerciseEndDate()
    {
        return $this->exercise_end_date;
    }

    public function setExerciseEndDate($endDate)
    {
        $this->exercise_end_date = $endDate;
        return $this;
    }

    public function getExerciseStatus()
    {
        return $this->exercise_status;
    }

    public function setExerciseStatus($status)
    {
        $this->exercise_status = $status;
        return $this;
    }
}