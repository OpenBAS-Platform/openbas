<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="exercises")
 */
class Exercise
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $exercise_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $exercise_name;

    /**
     * @ORM\Column(type="text")
     */
    protected $exercise_subtitle;

    /**
     * @ORM\Column(type="text")
     */
    protected $exercise_description;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $exercise_start_date;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $exercise_end_date;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="exercise_owner", referencedColumnName="user_id")
     */
    protected $exercise_owner;

    /**
     * @ORM\OneToMany(targetEntity="Grant", mappedBy="grant_exercise")
     * @var Grant[]
     */
    protected $exercise_grants;

    /**
     * @ORM\OneToMany(targetEntity="Audience", mappedBy="audience_exercise")
     * @var Audience[]
     */
    protected $exercise_audiences;

    /**
     * @ORM\OneToMany(targetEntity="Event", mappedBy="event_exercise")
     * @var Event[]
     */
    protected $exercise_events;

    /**
     * @ORM\ManyToOne(targetEntity="File")
     * @ORM\JoinColumn(name="exercise_image", referencedColumnName="file_id")
     */
    protected $exercise_image;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $exercise_message_header;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $exercise_canceled = false;

    protected $exercise_status = 'SCHEDULED';

    public function __construct()
    {
        $this->exercise_grants = new ArrayCollection();
        $this->exercise_audiences = new ArrayCollection();
        $this->exercise_events = new ArrayCollection();
    }

    public function getExerciseId()
    {
        return $this->exercise_id;
    }

    public function setExerciseId($id)
    {
        $this->exercise_id = $id;
        return $this;
    }

    public function getExerciseName()
    {
        return $this->exercise_name;
    }

    public function setExerciseName($name)
    {
        $this->exercise_name = $name;
        return $this;
    }

    public function getExerciseSubtitle()
    {
        return $this->exercise_subtitle;
    }

    public function setExerciseSubtitle($subtitle)
    {
        $this->exercise_subtitle = $subtitle;
        return $this;
    }

    public function getExerciseDescription()
    {
        return $this->exercise_description;
    }

    public function setExerciseDescription($description)
    {
        $this->exercise_description = $description;
        return $this;
    }

    public function getExerciseStartDate()
    {
        return $this->exercise_start_date;
    }

    public function setExerciseStartDate($startDate)
    {
        $this->exercise_start_date = $startDate;
        return $this;
    }

    public function getExerciseEndDate()
    {
        return $this->exercise_end_date;
    }

    public function setExerciseEndDate($endDate)
    {
        $this->exercise_end_date = $endDate;
        return $this;
    }

    public function getExerciseOwner()
    {
        return $this->exercise_owner;
    }

    public function setExerciseOwner($owner)
    {
        $this->exercise_owner = $owner;
        return $this;
    }

    public function getExerciseStatus()
    {
        return $this->exercise_status;
    }

    public function setExerciseStatus($status)
    {
        $this->exercise_status = $status;
        return $this;
    }

    public function getExerciseGrants()
    {
        return $this->exercise_grants;
    }

    public function setExerciseGrants($grants)
    {
        $this->exercise_grants = $grants;
        return $this;
    }

    public function getExerciseAudiences()
    {
        return $this->exercise_audiences;
    }

    public function setExerciseAudiences($audiences)
    {
        $this->exercise_audiences = $audiences;
        return $this;
    }

    public function getExerciseEvents()
    {
        return $this->exercise_events;
    }

    public function setExerciseEvents($events)
    {
        $this->exercise_events = $events;
        return $this;
    }

    public function getExerciseImage()
    {
        return $this->exercise_image;
    }

    public function setExerciseImage($image)
    {
        $this->exercise_image = $image;
        return $this;
    }

    public function getExerciceMessageHeader()
    {
        return $this->exercise_message_header;
    }

    public function setExerciseMessageHeader($header)
    {
        $this->exercise_message_header = $header;
        return $this;
    }

    public function getExerciseCanceled()
    {
        return $this->exercise_canceled;
    }

    public function setExerciseCanceled($canceled)
    {
        $this->exercise_canceled = $canceled;
        return $this;
    }

    public function computeExerciseStatus($injects) {
        if( $this->exercise_canceled == true ) {
            $status = 'CANCELED';
        } else {
            $all_injects_in_future = true;
            $all_injects_in_past = true;
            $now = new \DateTime();
            foreach ($injects as $inject) {
                if ($inject->getInjectDate() < $now) {
                    $all_injects_in_future = false;
                } else {
                    $all_injects_in_past = false;
                }
            }
            if( !$all_injects_in_future && !$all_injects_in_past ) {
                $status = 'RUNNING';
            } else if ( $all_injects_in_future ) {
                $status = 'SCHEDULED';
            } else {
                $status = 'FINISHED';
            }
        }

        $this->exercise_status = $status;
    }
}