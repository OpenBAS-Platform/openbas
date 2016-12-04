<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="injects_statuses")
 */
class InjectStatus
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $status_id;

    /**
     * @ORM\OneToOne(targetEntity="Inject", inversedBy="inject_status")
     * @ORM\JoinColumn(name="status_inject", referencedColumnName="inject_id", onDelete="CASCADE")
     */
    protected $status_inject;

    /**
     * @ORM\Column(type="string", columnDefinition="ENUM('SUCCESS', 'PARTIAL', 'ERROR', 'PENDING')")
     */
    protected $status_name;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    protected $status_message;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $status_date;

    public function getStatusId()
    {
        return $this->status_id;
    }

    public function setStatusId($id)
    {
        $this->status_id = $id;
        return $this;
    }

    public function getStatusInject()
    {
        return $this->status_inject;
    }

    public function setStatusInject($inject)
    {
        $this->status_inject = $inject;
        return $this;
    }

    public function getStatusName()
    {
        return $this->status_name;
    }

    public function setStatusName($name)
    {
        $this->status_name = $name;
        return $this;
    }

    public function getStatusMessage()
    {
        return $this->status_message;
    }

    public function setStatusMessage($message)
    {
        $this->status_message = $message;
        return $this;
    }

    public function getStatusDate()
    {
        return $this->status_date;
    }

    public function setStatusDate($date)
    {
        $this->status_date = $date;
        return $this;
    }
}