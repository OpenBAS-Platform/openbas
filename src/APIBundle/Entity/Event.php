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
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
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

    /**
     * @ORM\ManyToOne(targetEntity="File")
     * @ORM\JoinColumn(name="event_image", referencedColumnName="file_id", onDelete="SET NULL", nullable=true)
     */
    protected $event_image;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $event_order = 0;

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

    public function getEventExercise()
    {
        return $this->event_exercise;
    }

    public function setEventExercise($exercise)
    {
        $this->event_exercise = $exercise;
        return $this;
    }

    public function getEventIncidents()
    {
        return $this->event_incidents;
    }

    public function setEventIncidents($incidents)
    {
        $this->event_incidents = $incidents;
        return $this;
    }

    public function getEventImage()
    {
        return $this->event_image;
    }

    public function setEventImage($image)
    {
        $this->event_image = $image;
        return $this;
    }

    public function getEventOrder()
    {
        return $this->event_order;
    }

    public function setEventOrder($order)
    {
        $this->event_order = $order;
        return $this;
    }
}