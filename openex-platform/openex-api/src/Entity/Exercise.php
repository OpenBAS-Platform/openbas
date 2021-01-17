<?php

namespace App\Entity;

use App\Entity\Base\BaseEntity;
use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="exercises")
 */
class Exercise extends BaseEntity
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
     * @ORM\Column(type="text")
     */
    protected $exercise_mail_expediteur = "planners@openex.io";
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
     * @ORM\OneToMany(targetEntity="Objective", mappedBy="objective_exercise")
     * @var Comcheck[]
     */
    protected $exercise_objectives;
    /**
     * @ORM\OneToMany(targetEntity="Log", mappedBy="log_exercise")
     * @var Log[]
     */
    protected $exercise_logs;
    /**
     * @ORM\OneToMany(targetEntity="Event", mappedBy="event_exercise")
     * @var Event[]
     */
    protected $exercise_events;
    /**
     * @ORM\OneToMany(targetEntity="Comcheck", mappedBy="comcheck_exercise")
     * @var Comcheck[]
     */
    protected $exercise_comechecks;
    /**
     * @ORM\ManyToOne(targetEntity="File")
     * @ORM\JoinColumn(name="exercise_image", referencedColumnName="file_id", onDelete="SET NULL", nullable=true)
     */
    protected $exercise_image;
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $exercise_message_header;
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $exercise_message_footer;
    /**
     * @ORM\Column(type="boolean")
     */
    protected $exercise_canceled = false;
    /**
     * @ORM\Column(type="string", options={"default" : "standard"})
     */
    protected $exercise_type = 'standard';
    /**
     * @ORM\ManyToOne(targetEntity="Group")
     * @ORM\JoinColumn(name="exercise_animation_group", referencedColumnName="group_id", onDelete="SET NULL", nullable=true)
     */
    protected $exercise_animation_group;
    /**
     * @ORM\ManyToMany(targetEntity="Document", mappedBy="document_exercises")
     * @var Documents[]
     */
    protected $exercise_documents;
    /**
     * @ORM\OneToMany(targetEntity="Dryrun", mappedBy="dryrun_exercise")
     * @var Comcheck[]
     */
    protected $exercise_dryruns;
    protected $exercise_status = 'SCHEDULED';
    protected $exercise_owner_id;

    public function __construct()
    {
        $this->exercise_grants = new ArrayCollection();
        $this->exercise_audiences = new ArrayCollection();
        $this->exercise_events = new ArrayCollection();
        $this->exercise_documents = new ArrayCollection();
        parent::__construct();
    }

    public function getExerciseMailExpediteur()
    {
        return $this->exercise_mail_expediteur;
    }

    public function setExerciseMailExpediteur($mail_expediteur)
    {
        $this->exercise_mail_expediteur = $mail_expediteur;
        return $this;
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

    public function getExerciseMessageHeader()
    {
        return $this->exercise_message_header;
    }

    public function setExerciseMessageHeader($header)
    {
        $this->exercise_message_header = $header;
        return $this;
    }

    public function getExerciseMessageFooter()
    {
        return $this->exercise_message_footer;
    }

    public function setExerciseMessageFooter($footer)
    {
        $this->exercise_message_footer = $footer;
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

    public function getExerciseType()
    {
        return $this->exercise_type;
    }

    public function setExerciseType($type)
    {
        $this->exercise_type = $type;
        return $this;
    }

    public function getExerciseAnimationGroup()
    {
        return $this->exercise_animation_group;
    }

    public function setExerciseAnimationGroup($group)
    {
        $this->exercise_animation_group = $group;
        return $this;
    }

    public function getExerciseOwnerId()
    {
        return $this->getExerciseOwner()->getUserId();
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

    public function computeExerciseOwner()
    {
        $this->exercise_owner_id = $this->getExerciseOwner()->getUserId();
    }

    public function computeExerciseStatus($injects)
    {
        if ($this->exercise_canceled == true) {
            $status = 'CANCELED';
        } else {
            $all_injects_in_future = true;
            $all_injects_in_past = true;
            $now = new DateTime();
            foreach ($injects as $inject) {
                if ($inject->getInjectDate() < $now) {
                    $all_injects_in_future = false;
                } else {
                    $all_injects_in_past = false;
                }
            }
            if (!$all_injects_in_future && !$all_injects_in_past) {
                $status = 'RUNNING';
            } elseif ($all_injects_in_future) {
                $status = 'SCHEDULED';
            } else {
                $status = 'FINISHED';
            }
        }

        $this->exercise_status = $status;
    }

    /**
     * Compute start and end exercise dates from given injects
     *
     * @param array $injects array of Injects
     */
    public function computeStartEndDates($injects)
    {
        $firstInjectDateTime = null;
        $lastInjectDateTime = null;
        foreach ($injects as $inject) {
            if ($inject) {
                if (!$firstInjectDateTime || $firstInjectDateTime->getTimestamp() > $inject->getInjectDate()->getTimestamp()) {
                    $firstInjectDateTime = $inject->getInjectDate();
                }
                if (!$lastInjectDateTime || $lastInjectDateTime->getTimestamp() < $inject->getInjectDate()->getTimestamp()) {
                    $lastInjectDateTime = $inject->getInjectDate();
                }
            }
        }
        if ($firstInjectDateTime) {
            $this->exercise_start_date = clone $firstInjectDateTime;
        }

        if ($lastInjectDateTime) {
            $this->exercise_end_date = clone $lastInjectDateTime;
        }
    }
}
