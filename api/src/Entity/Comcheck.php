<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Base\BaseEntity;

/**
 * @ORM\Entity()
 * @ORM\Table(name="comchecks")
 */
class Comcheck extends BaseEntity
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $comcheck_id;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $comcheck_start_date;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $comcheck_end_date;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_comechecks")
     * @ORM\JoinColumn(name="comcheck_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $comcheck_exercise;

    /**
     * @ORM\OneToMany(targetEntity="ComcheckStatus", mappedBy="status_comcheck")
     * @var Comcheck[]
     */
    protected $comcheck_comchecks_statuses;

    /**
     * @ORM\ManyToOne(targetEntity="Audience", inversedBy="audience_comchecks")
     * @ORM\JoinColumn(name="comcheck_audience", referencedColumnName="audience_id", onDelete="CASCADE")
     * @var Audience
     */
    protected $comcheck_audience;

    protected $comcheck_subject;
    protected $comcheck_message;
    protected $comcheck_footer;
    protected $comcheck_finished = false;

    public function getComcheckId()
    {
        return $this->comcheck_id;
    }

    public function setComcheckId($id)
    {
        $this->comcheck_id = $id;
        return $this;
    }

    public function getComcheckStartDate()
    {
        return $this->comcheck_start_date;
    }

    public function setComcheckStartDate($startDate)
    {
        $this->comcheck_start_date = $startDate;
        return $this;
    }

    public function getComcheckEndDate()
    {
        return $this->comcheck_end_date;
    }

    public function setComcheckEndDate($endDate)
    {
        $this->comcheck_end_date = $endDate;
        return $this;
    }

    public function getComcheckExercise()
    {
        return $this->comcheck_exercise;
    }

    public function setComcheckExercise($exercise)
    {
        $this->comcheck_exercise = $exercise;
        return $this;
    }

    public function getComcheckAudience()
    {
        return $this->comcheck_audience;
    }

    public function setComcheckAudience($audience)
    {
        $this->comcheck_audience = $audience;
        return $this;
    }

    public function getComcheckSubject()
    {
        return $this->comcheck_subject;
    }

    public function setComcheckSubject($subject)
    {
        $this->comcheck_subject = $subject;
        return $this;
    }

    public function getComcheckMessage()
    {
        return $this->comcheck_message;
    }

    public function setComcheckMessage($message)
    {
        $this->comcheck_message = $message;
        return $this;
    }

    public function getComcheckFooter()
    {
        return $this->comcheck_footer;
    }

    public function setComcheckFooter($footer)
    {
        $this->comcheck_footer = $footer;
        return $this;
    }

    public function getComcheckFinished()
    {
        return $this->comcheck_finished;
    }

    public function setComcheckFinished($finished)
    {
        $this->comcheck_finished = $finished;
        return $this;
    }

    public function computeComcheckFinished()
    {
        $now = new \DateTime();
        if ($this->comcheck_end_date < $now) {
            $this->comcheck_finished = true;
        } else {
            $this->comcheck_finished = false;
        }
    }
}
