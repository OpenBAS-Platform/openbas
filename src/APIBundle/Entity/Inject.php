<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="injects")
 */
class Inject
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $inject_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $inject_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $inject_description;

    /**
     * @ORM\Column(type="text")
     */
    protected $inject_content;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $inject_date;

    /**
     * @ORM\Column(type="string")
     */
    protected $inject_sender;

    /**
     * @ORM\OneToMany(targetEntity="Event", mappedBy="event_exercise")
     * @var Event[]
     */
    protected $exercise_events;

    /**
     * @ORM\ManyToOne(targetEntity="Status")
     * @ORM\JoinColumn(name="inject_status", referencedColumnName="status_id")
     */
    protected $inject_status;

    /**
     * @ORM\ManyToOne(targetEntity="Event", inversedBy="event_incidents")
     * @ORM\JoinColumn(name="incident_event", referencedColumnName="event_id", onDelete="CASCADE")
     * @var Event
     */
    protected $incident_event;

    /**
     * @ORM\ManyToMany(targetEntity="Objective", mappedBy="objective_events")
     * @var Objective[]
     */
    protected $incident_objectives;

    public function __construct()
    {
        $this->incident_objectives = new ArrayCollection();
    }

    public function getIncidentId()
    {
        return $this->incident_id;
    }

    public function setIncidentId($id)
    {
        $this->incident_id = $id;
        return $this;
    }

    public function getIncidentTitle()
    {
        return $this->incident_title;
    }

    public function setIncidentTitle($title)
    {
        $this->incident_title = $title;
        return $this;
    }

    public function getIncidentStory()
    {
        return $this->incident_story;
    }

    public function setIncidentStory($story)
    {
        $this->incident_story = $story;
        return $this;
    }

    public function getIncidentStartDate()
    {
        return $this->incident_start_date;
    }

    public function setIncidentStartDate($startDate)
    {
        $this->incident_start_date = $startDate;
        return $this;
    }

    public function getIncidentEndDate()
    {
        return $this->incident_end_date;
    }

    public function setIncidentEndDate($endDate)
    {
        $this->incident_end_date = $endDate;
        return $this;
    }

    public function getIncidentStatus()
    {
        return $this->incident_status;
    }

    public function setIncidentStatus($status)
    {
        $this->incident_status = $status;
        return $this;
    }

    public function getIncidentEvent()
    {
        return $this->incident_event;
    }

    public function setIncidentEvent($event)
    {
        $this->incident_event = $event;
        return $this;
    }

    public function getIncidentObjectives()
    {
        return $this->incident_objectives;
    }

    public function setIncidentObjectives($objectives)
    {
        $this->incident_objectives = $objectives;
        return $this;
    }
}