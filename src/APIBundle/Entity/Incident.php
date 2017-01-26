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
     * @ORM\Column(type="integer")
     */
    protected $incident_weight;

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
     * @ORM\ManyToMany(targetEntity="Subobjective", inversedBy="incident_subobjectives")
     * @ORM\JoinTable(name="incidents_subobjectives",
     *      joinColumns={@ORM\JoinColumn(name="incident_id", referencedColumnName="incident_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="subobjective_id", referencedColumnName="subobjective_id", onDelete="CASCADE")}
     *      )
     * @var Subobjective[]
     */
    protected $incident_subobjectives;

    /**
     * @ORM\OneToOne(targetEntity="Outcome", mappedBy="outcome_incident")
     */
    protected $incident_outcome;

    /**
     * @ORM\OneToMany(targetEntity="Inject", mappedBy="inject_incident")
     * @var Inject[]
     */
    protected $incident_injects;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $incident_order = 0;

    protected $incident_exercise;

    public function __construct()
    {
        $this->incident_objectives = new ArrayCollection();
        $this->incident_injects = new ArrayCollection();
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

    public function getIncidentWeight()
    {
        return $this->incident_weight;
    }

    public function setIncidentWeight($weight)
    {
        $this->incident_weight = $weight;
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

    public function getIncidentSubobjectives()
    {
        return $this->incident_subobjectives;
    }

    public function setIncidentSubobjectives($subobjectives)
    {
        $this->incident_subobjectives = $subobjectives;
        return $this;
    }

    public function getIncidentOutcome()
    {
        return $this->incident_outcome;
    }

    public function setIncidentOutcome($outcome)
    {
        $this->incident_outcome = $outcome;
        return $this;
    }

    public function getIncidentInjects()
    {
        return $this->incident_injects;
    }

    public function setIncidentInjects($injects)
    {
        $this->incident_injects = $injects;
        return $this;
    }

    public function getIncidentOrder()
    {
        return $this->incident_order;
    }

    public function setIncidentOrder($order)
    {
        $this->incident_order = $order;
        return $this;
    }

    public function getIncidentExercise()
    {
        return $this->incident_exercise;
    }

    public function setIncidentExercise($exercise)
    {
        $this->incident_exercise = $exercise;
        return $this;
    }
}