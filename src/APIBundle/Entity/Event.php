<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="events")
 */
class Event
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $event_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $event_title;

    /**
     * @ORM\Column(type="string")
     */
    protected $event_description;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $event_status;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="events")
     * @ORM\JoinColumn(name="event_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $event_exercise;

    public function getEventId()
    {
        return $this->event_id;
    }

    public function setEventId($id)
    {
        $this->event_id = $id;
        return $this;
    }

    public function getEventTitle()
    {
        return $this->event_title;
    }

    public function setEventTitle($title)
    {
        $this->event_title = $title;
        return $this;
    }

    public function getEventDescription()
    {
        return $this->event_description;
    }

    public function setEventDescription($description)
    {
        $this->event_description = $description;
        return $this;
    }

    public function getEventStatus()
    {
        return $this->event_status;
    }

    public function setEventStatus($status)
    {
        $this->event_status = $status;
        return $this;
    }

    public function getEventExercise()
    {
        return $this->event_exercise;
    }

    public function setEventExercise($exercise)
    {
        $this->event_exercise = $exercise;
        return $this;
    }
}