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
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
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
     * @ORM\Column(type="string")
     */
    protected $inject_type;

    /**
     * @ORM\ManyToMany(targetEntity="Audience", inversedBy="inject_audiences")
     * @ORM\JoinTable(name="injects_audiences",
     *     joinColumns={@ORM\JoinColumn(name="inject_id", referencedColumnName="inject_id", onDelete="CASCADE")},
     *     inverseJoinColumns={@ORM\JoinColumn(name="audience_id", referencedColumnName="audience_id", onDelete="RESTRICT")}
     *     )
     * @var Audience[]
     */
    protected $inject_audiences;

    /**
     * @ORM\ManyToOne(targetEntity="Incident", inversedBy="incident_injects")
     * @ORM\JoinColumn(name="inject_incident", referencedColumnName="incident_id", onDelete="CASCADE")
     * @var Incident
     */
    protected $inject_incident;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $inject_automatic;

    /**
     * @ORM\ManyToOne(targetEntity="InjectStatus")
     * @ORM\JoinColumn(name="inject_status", referencedColumnName="status_id")
     */
    protected $inject_status;

    public function __construct()
    {
        $this->incident_audiences = new ArrayCollection();
    }

    public function getInjectId()
    {
        return $this->inject_id;
    }

    public function setInjectId($id)
    {
        $this->inject_id = $id;
        return $this;
    }

    public function getInjectTitle()
    {
        return $this->inject_title;
    }

    public function setInjectTitle($title)
    {
        $this->inject_title = $title;
        return $this;
    }

    public function getInjectDescription()
    {
        return $this->inject_description;
    }

    public function setInjectDescription($description)
    {
        $this->inject_description = $description;
        return $this;
    }

    public function getInjectContent()
    {
        return $this->inject_content;
    }

    public function setInjectContent($content)
    {
        $this->inject_content = $content;
        return $this;
    }

    public function getInjectDate()
    {
        return $this->inject_date;
    }

    public function setInjectDate($date)
    {
        $this->inject_date = $date;
        return $this;
    }

    public function getInjectSender()
    {
        return $this->inject_sender;
    }

    public function setInjectSender($sender)
    {
        $this->inject_sender = $sender;
        return $this;
    }

    public function getInjectAudiences()
    {
        return $this->inject_audiences;
    }

    public function setInjectAudiences($audiences)
    {
        $this->inject_audiences = $audiences;
        return $this;
    }

    public function getInjectType()
    {
        return $this->inject_type;
    }

    public function setInjectType($type)
    {
        $this->inject_type = $type;
        return $this;
    }

    public function getInjectIncident()
    {
        return $this->inject_incident;
    }

    public function setInjectIncident($incident)
    {
        $this->inject_incident = $incident;
        return $this;
    }

    public function getInjectAutomatic()
    {
        return $this->inject_automatic;
    }

    public function setInjectAutomatic($automatic)
    {
        $this->inject_automatic = $automatic;
        return $this;
    }

    public function getInjectStatus()
    {
        return $this->inject_status;
    }

    public function setInjectStatus($status)
    {
        $this->inject_status = $status;
        return $this;
    }
}