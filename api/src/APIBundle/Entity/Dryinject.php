<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="dryinjects")
 */
class Dryinject
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $dryinject_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $dryinject_title;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    protected $dryinject_content;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $dryinject_date;

    /**
     * @ORM\Column(type="string")
     */
    protected $dryinject_type;

    /**
     * @ORM\ManyToOne(targetEntity="Dryrun", inversedBy="dryrun_dryinjects")
     * @ORM\JoinColumn(name="dryinject_dryrun", referencedColumnName="dryrun_id", onDelete="CASCADE")
     * @var Dryrun
     */
    protected $dryinject_dryrun;

    /**
     * @ORM\OneToOne(targetEntity="DryinjectStatus", mappedBy="status_dryinject")
     */
    protected $dryinject_status;

    public function getDryinjectId()
    {
        return $this->dryinject_id;
    }

    public function setDryinjectId($id)
    {
        $this->dryinject_id = $id;
        return $this;
    }

    public function getDryinjectTitle()
    {
        return $this->dryinject_title;
    }

    public function setDryinjectTitle($title)
    {
        $this->dryinject_title = $title;
        return $this;
    }

    public function getDryinjectContent()
    {
        return $this->dryinject_content;
    }

    public function setDryinjectContent($content)
    {
        $this->dryinject_content = $content;
        return $this;
    }

    public function getDryinjectDate()
    {
        return $this->dryinject_date;
    }

    public function setDryinjectDate($date)
    {
        $this->dryinject_date = $date;
        return $this;
    }

    public function getDryinjectType()
    {
        return $this->dryinject_type;
    }

    public function setDryinjectType($type)
    {
        $this->dryinject_type = $type;
        return $this;
    }

    public function getDryinjectDryrun()
    {
        return $this->dryinject_dryrun;
    }

    public function setDryinjectDryrun($dryrun)
    {
        $this->dryinject_dryrun = $dryrun;
        return $this;
    }

    public function getDryinjectStatus()
    {
        return $this->dryinject_status;
    }

    public function setDryinjectStatus($status)
    {
        $this->dryinject_status = $status;
        return $this;
    }
}