<?php

namespace App\Entity;

use DateTime;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Base\BaseEntity;

/**
 * @ORM\Entity()
 * @ORM\Table(name="injects")
 */
class Inject extends BaseEntity
{
    public function __construct()
    {
        $this->inject_audiences = new ArrayCollection();
        $this->inject_subaudiences = new ArrayCollection();
        parent::__construct();
    }

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
     * @ORM\Column(type="text", nullable=true)
     */
    protected $inject_content;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $inject_date;

    /**
     * @ORM\Column(type="string")
     */
    protected $inject_type;

    /**
     * @ORM\ManyToMany(targetEntity="Audience", inversedBy="audience_injects")
     * @ORM\JoinTable(name="injects_audiences",
     *     joinColumns={@ORM\JoinColumn(name="inject_id", referencedColumnName="inject_id", onDelete="CASCADE")},
     *     inverseJoinColumns={@ORM\JoinColumn(name="audience_id", referencedColumnName="audience_id", onDelete="CASCADE")}
     *     )
     * @var Audience[]
     */
    protected $inject_audiences;

    /**
     * @ORM\ManyToMany(targetEntity="Subaudience", inversedBy="subaudience_injects")
     * @ORM\JoinTable(name="injects_subaudiences",
     *     joinColumns={@ORM\JoinColumn(name="inject_id", referencedColumnName="inject_id", onDelete="CASCADE")},
     *     inverseJoinColumns={@ORM\JoinColumn(name="subaudience_id", referencedColumnName="subaudience_id", onDelete="CASCADE")}
     *     )
     * @var Subaudience[]
     */
    protected $inject_subaudiences;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $inject_all_audiences = false;

    /**
     * @ORM\ManyToOne(targetEntity="Incident", inversedBy="incident_injects")
     * @ORM\JoinColumn(name="inject_incident", referencedColumnName="incident_id", onDelete="CASCADE")
     * @var Incident
     */
    protected $inject_incident;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $inject_enabled = true;

    /**
     * @ORM\OneToOne(targetEntity="InjectStatus", mappedBy="status_inject")
     */
    protected $inject_status;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="user_injects")
     * @ORM\JoinColumn(name="inject_user", referencedColumnName="user_id", onDelete="CASCADE")
     * @var User
     */
    protected $inject_user;

    protected $inject_event;
    protected $inject_exercise;

    protected $inject_header;
    protected $inject_footer;

    protected $inject_users_number;

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
        // Worker needs "file_*" properties -> duplicate "document_*" properties to "file_*"
        // quite ugly hack :'(
        $injectContent = \json_decode($this->inject_content, true);
        $attachments = [];
        if (is_array($injectContent) && array_key_exists('attachments', $injectContent) && is_array($injectContent['attachments'])) {
            foreach ($injectContent['attachments'] as $attachment) {
                $attachment['file_id'] = $attachment['document_id'];
                $attachment['file_name'] = $attachment['document_name'];
                $attachment['file_description'] = $attachment['document_description'];
                $attachment['file_type'] = $attachment['document_type'];
                $attachment['file_path'] = $attachment['document_path'];
                $attachment['file_liste_tags'] = $attachment['document_liste_tags'];

                $attachments[] = $attachment;
            }
            $injectContent['attachments'] = $attachments;
        }

        return \json_encode($injectContent);
    }

    public function setInjectContent($content)
    {
        $this->inject_content = $content;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getInjectDate()
    {
        return $this->inject_date;
    }

    public function setInjectDate($date)
    {
        $this->inject_date = $date;
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

    public function getInjectSubaudiences()
    {
        return $this->inject_subaudiences;
    }

    public function setInjectSubaudiences($subaudiences)
    {
        $this->inject_subaudiences = $subaudiences;
        return $this;
    }

    public function addInjectSubaudience($subaudience)
    {
        if (!$this->inject_subaudiences->contains($subaudience)) {
            $this->inject_subaudiences->add($subaudience);
        }
        return $this;
    }

    public function addInjectAudience($audience)
    {
        if (!$this->inject_audiences->contains($audience)) {
            $this->inject_audiences->add($audience);
        }
        return $this;
    }

    public function getInjectAllAudiences()
    {
        return $this->inject_all_audiences;
    }

    public function setInjectAllAudiences($all_audiences)
    {
        $this->inject_all_audiences = $all_audiences;
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

    public function getInjectEnabled()
    {
        return $this->inject_enabled;
    }

    public function setInjectEnabled($enabled)
    {
        $this->inject_enabled = $enabled;
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

    public function getInjectUser()
    {
        return $this->inject_user;
    }

    public function setInjectUser($user)
    {
        $this->inject_user = $user;
        return $this;
    }

    public function sanitizeUser()
    {
        if ($this->inject_user !== null && !is_string($this->inject_user)) {
            $this->inject_user = $this->inject_user->getUserFirstname() . ' ' . $this->inject_user->getUserLastname();
        }
    }

    public function getInjectEvent()
    {
        return $this->inject_event;
    }

    public function setInjectEvent($event)
    {
        $this->inject_event = $event;
        return $this;
    }

    public function getInjectExercise()
    {
        return $this->inject_exercise;
    }

    public function setInjectExercise($exercise)
    {
        $this->inject_exercise = $exercise;
        return $this;
    }

    public function getInjectHeader()
    {
        return $this->inject_header;
    }

    public function setInjectHeader($header)
    {
        $this->inject_header = $header;
        return $this;
    }

    public function getInjectFooter()
    {
        return $this->inject_footer;
    }

    public function setInjectFooter($footer)
    {
        $this->inject_footer = $footer;
        return $this;
    }

    public function getInjectUsersNumber()
    {
        return $this->inject_users_number;
    }

    public function setInjectUsersNumber($number)
    {
        $this->inject_users_number = $number;
        return $this;
    }

    /**
     * Get recipients from inject (sub)audiences setting
     *
     * @return array array of App\Entity\User
     */
    public function getInjectRecipients()
    {
        $users = [];

        // All exercise audiences
        if ($this->getInjectAllAudiences()) {
            $audiences = $this
                ->getInjectIncident()
                ->getIncidentEvent()
                ->getEventExercise()
                ->getExerciseAudiences();

            foreach ($audiences as $audience) {
                foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                    foreach ($subaudience->getSubaudienceUsers() as $user) {
                        $users[] = $user;
                    }
                }
            }

            return $users;
        }

        // Only selected audience / subaudience
        $audiences = array();
        foreach ($this->getInjectAudiences() as $audience) {
            $audiences[] = $audience->getAudienceId();
            foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                foreach ($subaudience->getSubaudienceUsers() as $user) {
                    $users[] = $user;
                }
            }
        }
        foreach ($this->getInjectSubaudiences() as $subaudience) {
            if (!in_array($subaudience->getSubaudienceAudience()->getAudienceId(), $audiences)) {
                foreach ($subaudience->getSubaudienceUsers() as $user) {
                    $users[] = $user;
                }
            }
        }

        return $users;
    }

    public function computeUsersNumber($audiences = [])
    {
        $this->inject_users_number = 0;

        // Get all users (with duplicates)
        $users = [];

        if ($this->getInjectAllAudiences()) {
            foreach ($audiences as $audience) {
                foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                    $subAudienceUsers = $subaudience->getSubaudienceUsers();
                    foreach ($subAudienceUsers as $user) {
                        $users[] = $user;
                    }
                }
            }
        } else {
            $audiences = array();
            foreach ($this->inject_audiences as $audience) {
                $audiences[] = $audience->getAudienceId();
                foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                    $subAudienceUsers = $subaudience->getSubaudienceUsers();
                    foreach ($subAudienceUsers as $user) {
                        $users[] = $user;
                    }
                }
            }
            foreach ($this->inject_subaudiences as $subaudience) {
                if (!in_array($subaudience->getSubaudienceAudience()->getAudienceId(), $audiences)) {
                    $subAudienceUsers = $subaudience->getSubaudienceUsers();
                    foreach ($subAudienceUsers as $user) {
                        $users[] = $user;
                    }
                }
            }
        }

        // Remove duplicates in users list
        $usersWithoutDuplicates = [];
        foreach ($users as $user) {
            $userId = $user->getUserId();
            $usersWithoutDuplicates[$userId] = $userId;
        }

        $this->inject_users_number = count($usersWithoutDuplicates);
    }
}
