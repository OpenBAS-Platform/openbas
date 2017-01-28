<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="dryruns")
 */
class Dryrun
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $dryrun_id;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $dryrun_date;

    /**
     * @ORM\Column(type="integer")
     */
    protected $dryrun_speed;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_dryruns")
     * @ORM\JoinColumn(name="dryrun_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $dryrun_exercise;

    /**
     * @ORM\OneToMany(targetEntity="Dryinject", mappedBy="dryinject_dryrun")
     * @var Incident[]
     */
    protected $dryrun_dryinjects;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $dryrun_status = true;

    protected $dryrun_finished = false;

    public function __construct()
    {
        $this->dryrun_dryinjects = new ArrayCollection();
    }

    public function getDryrunId()
    {
        return $this->dryrun_id;
    }

    public function setDryrunId($id)
    {
        $this->dryrun_id = $id;
        return $this;
    }

    public function getDryrunDate()
    {
        return $this->dryrun_date;
    }

    public function setDryrunDate($date)
    {
        $this->dryrun_date = $date;
        return $this;
    }

    public function getDryrunSpeed()
    {
        return $this->dryrun_speed;
    }

    public function setDryrunSpeed($speed)
    {
        $this->dryrun_speed = $speed;
        return $this;
    }

    public function getDryrunExercise()
    {
        return $this->dryrun_exercise;
    }

    public function setDryrunExercise($exercise)
    {
        $this->dryrun_exercise = $exercise;
        return $this;
    }
    
    public function getDryrunDryinjects()
    {
        return $this->dryrun_dryinjects;
    }

    public function setDryrunDryinjects($dryinjects)
    {
        $this->dryrun_dryinjects = $dryinjects;
        return $this;
    }

    public function getDryrunStatus()
    {
        return $this->dryrun_status;
    }

    public function setDryrunStatus($status)
    {
        $this->dryrun_status = $status;
        return $this;
    }

    public function getDryrunFinished()
    {
        return $this->dryrun_finished;
    }

    public function setDryrunFinished($finished)
    {
        $this->dryrun_finished = $finished;
        return $this;
    }

    public function computeDryRunFinished($dryinjects) {
        /* @var $dryinjects Dryinject[] */
        $finished = true;
        foreach( $dryinjects as $dryinject ) {
            if( $dryinject->getDryinjectStatus()->getStatusName() == 'PENDING' ) {
                $finished = false;
            }
        }
        $this->dryrun_finished = $finished;
    }
}