<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Base\BaseEntity;

/**
 * @ORM\Entity()
 * @ORM\Table(name="audiences")
 */
class Audience extends BaseEntity
{
    public function __construct()
    {
        parent::__construct();
        $this->audience_injects = new ArrayCollection();
        $this->audience_subaudiences = new ArrayCollection();
        $this->audience_planificateur_users = new ArrayCollection();
    }

    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $audience_id;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $audience_name;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_audiences")
     * @ORM\JoinColumn(name="audience_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $audience_exercise;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     */
    protected $audience_enabled = true;

    /**
     * @ORM\ManyToMany(targetEntity="Inject", mappedBy="inject_audiences")
     * @var Inject[]
     */
    protected $audience_injects;

    /**
     * @ORM\OneToMany(targetEntity="Comcheck", mappedBy="comcheck_audience")
     * @var Comcheck[]
     */
    protected $audience_comchecks;

    /**
     * @ORM\OneToMany(targetEntity="Subaudience", mappedBy="subaudience_audience")
     * @var Subaudience[]
     */
    protected $audience_subaudiences;

    protected $audience_users_number;

    /**
     * @ORM\ManyToMany(targetEntity="User", inversedBy="userPlanificateurAudiences")
     * @ORM\JoinTable(name="planificateurs_audiences",
     *      joinColumns={@ORM\JoinColumn(name="planificateur_audience_id", referencedColumnName="audience_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="planificateur_user_id", referencedColumnName="user_id", onDelete="CASCADE")}
     *      )
     * @var User[]
     */
    protected $audience_planificateur_users;

    /**
     * Add User planificateur to audience
     * @param type $user
     * @return $this
     */
    public function addPlanificateurUser($user)
    {
        if (!$this->audience_planificateur_users->contains($user)) {
            $this->audience_planificateur_users->add($user);
        }
        return $this;
    }

    /**
     * Remove planificateur to audience
     * @param type $user
     */
    public function removePlanificateurUser($user)
    {
        if ($this->audience_planificateur_users->contains($user)) {
            $this->audience_planificateur_users->removeElement($user);
        }
    }

    /**
     *
     */
    public function isPlanificateurUser($user)
    {
        return $this->audience_planificateur_users->contains($user);
    }

    /**
     * Get All User Planificateur for audience
     * @return type
     */
    public function getAudiencePlanificateurUsers()
    {
        return $this->audience_planificateur_users;
    }

    public function getAudienceId()
    {
        return $this->audience_id;
    }

    public function setAudienceId($id)
    {
        $this->audience_id = $id;
        return $this;
    }

    public function getAudienceName()
    {
        return $this->audience_name;
    }

    public function setAudienceName($name)
    {
        $this->audience_name = $name;
        return $this;
    }

    public function getAudienceExercise()
    {
        return $this->audience_exercise;
    }

    public function setAudienceExercise($exercise)
    {
        $this->audience_exercise = $exercise;
        return $this;
    }

    public function getAudienceEnabled()
    {
        return $this->audience_enabled;
    }

    public function setAudienceEnabled($enabled)
    {
        $this->audience_enabled = $enabled;
        return $this;
    }

    public function getAudienceInjects()
    {
        return $this->audience_injects;
    }

    public function setAudienceInjects($injects)
    {
        $this->audience_injects = $injects;
        return $this;
    }

    public function getAudienceSubaudiences()
    {
        return $this->audience_subaudiences;
    }

    public function setAudienceSubaudiences($subaudiences)
    {
        $this->audience_subaudiences = $subaudiences;
        return $this;
    }

    public function getAudienceUsersNumber()
    {
        return $this->audience_users_number;
    }

    public function setAudienceUsersNumber($number)
    {
        $this->audience_users_number = $number;
        return $this;
    }

    public function computeUsersNumber()
    {
        $this->audience_users_number = 0;
        foreach ($this->audience_subaudiences as $subaudience) {
            $this->audience_users_number += count($subaudience->getSubaudienceUsers());
        }
    }
}
