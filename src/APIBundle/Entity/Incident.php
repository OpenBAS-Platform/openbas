<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="incidents")
 */
class Incident
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $incident_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $incident_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $incident_story;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $incident_start_date;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $incident_end_date;

    /**
     * @ORM\ManyToOne(targetEntity="IncidentType", inversedBy="type_incidents")
     * @ORM\JoinColumn(name="incident_type", referencedColumnName="type_id", onDelete="CASCADE")
     * @var IncidentType
     */
    protected $incident_type;

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

    /**
     * @ORM\OneToMany(targetEntity="Outcome", mappedBy="outcome_incident")
     * @var Outcome[]
     */
    protected $incident_outcomes;

    /**
     * @ORM\ManyToOne(targetEntity="Status")
     * @ORM\JoinColumn(name="incident_status", referencedColumnName="status_id")
     */
    protected $incident_status;

    public function __construct()
    {
        $this->incident_objectives = new ArrayCollection();
        $this->incident_outcomes = new ArrayCollection();
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

    public function getIncidentType()
    {
        return $this->incident_type;
    }

    public function setIncidentType($type)
    {
        $this->incident_type = $type;
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

    public function getIncidentOutcomes()
    {
        return $this->incident_outcomes;
    }

    public function setIncidentOutcomes($outcomes)
    {
        $this->incident_outcomes = $outcomes;
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
}