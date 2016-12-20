<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="outcomes")
 */
class Outcome
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $outcome_id;

    /**
     * @ORM\Column(type="text")
     */
    protected $outcome_comment;

    /**
     * @ORM\OneToOne(targetEntity="Incident", inversedBy="incident_outcome")
     * @ORM\JoinColumn(name="outcome_incident", referencedColumnName="incident_id", onDelete="CASCADE")
     */
    protected $outcome_incident;

    /**
     * @ORM\Column(type="integer")
     */
    protected $outcome_result;

    public function getOutcomeId()
    {
        return $this->outcome_id;
    }

    public function setOutcomeId($id)
    {
        $this->outcome_id = $id;
        return $this;
    }

    public function getOutcomeComment()
    {
        return $this->outcome_comment;
    }

    public function setOutcomeComment($comment)
    {
        $this->outcome_comment = $comment;
        return $this;
    }

    public function getOutcomeIncident()
    {
        return $this->outcome_incident;
    }

    public function setOutcomeIncident($incident)
    {
        $this->outcome_incident = $incident;
        return $this;
    }

    public function getOutcomeResult()
    {
        return $this->outcome_result;
    }

    public function setOutComeResult($result)
    {
        $this->outcome_result = $result;
        return $this;
    }
}