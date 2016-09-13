<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
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
     * @ORM\ManyToOne(targetEntity="Status")
     * @ORM\JoinColumn(name="event_status", referencedColumnName="status_id")
     */
    protected $event_status;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_events")
     * @ORM\JoinColumn(name="event_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $event_exercise;

    /**
     * @ORM\OneToMany(targetEntity="Incident", mappedBy="incident_event")
     * @var Incident[]
     */
    protected $event_incidents;

    public function __construct()
    {
        $this->event_incidents = new ArrayCollection();
    }

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