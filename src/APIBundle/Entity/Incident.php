<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="incidents")
 */
class Incident
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $incident_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $incident_title;

    /**
     * @ORM\Column(type="string")
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
     * @ORM\Column(type="smallint")
     */
    protected $incident_status;

    /**
     * @ORM\ManyToOne(targetEntity="Event", inversedBy="event_incidents")
     * @ORM\JoinColumn(name="incident_event", referencedColumnName="event_id", onDelete="CASCADE")
     * @var Event
     */
    protected $incident_event;

    /**
     * @ORM\ManyToOne(targetEntity="Event", inversedBy="event_incidents")
     * @ORM\JoinColumn(name="incident_event", referencedColumnName="event_id", onDelete="CASCADE")
     * @var Event
     */
    protected $incident_objectives;

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
}