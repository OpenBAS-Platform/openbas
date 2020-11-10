<?php

namespace App\Entity;

use App\Entity\Base\BaseEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="subaudiences")
 */
class Subaudience extends BaseEntity
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $subaudience_id;
    /**
     * @ORM\Column(type="string")
     */
    protected $subaudience_name;
    /**
     * @ORM\ManyToMany(targetEntity="User", inversedBy="userSubaudiences")
     * @ORM\JoinTable(name="users_subaudiences",
     *      joinColumns={@ORM\JoinColumn(name="subaudience_id", referencedColumnName="subaudience_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="user_id", onDelete="CASCADE")}
     *      )
     * @var User[]
     */
    protected $subaudienceUsers;
    /**
     * @ORM\ManyToOne(targetEntity="Audience", inversedBy="audience_subaudiences")
     * @ORM\JoinColumn(name="subaudience_audience", referencedColumnName="audience_id", onDelete="CASCADE")
     * @var Audience
     */
    protected $subaudience_audience;
    /**
     * @ORM\Column(type="boolean")
     */
    protected $subaudience_enabled = true;
    /**
     * @ORM\ManyToMany(targetEntity="Inject", mappedBy="inject_subaudiences")
     * @var Inject[]
     */
    protected $subaudience_injects;
    protected $subaudience_exercise;

    public function __construct()
    {
        $this->subaudienceUsers = new ArrayCollection();
        $this->subaudience_injects = new ArrayCollection();
        parent::__construct();
    }

    public function getSubaudienceId()
    {
        return $this->subaudience_id;
    }

    public function setSubaudienceId($id)
    {
        $this->subaudience_id = $id;
        return $this;
    }

    public function getSubaudienceName()
    {
        return $this->subaudience_name;
    }

    public function setSubaudienceName($name)
    {
        $this->subaudience_name = $name;
        return $this;
    }

    public function getSubaudienceUsers()
    {
        return $this->subaudienceUsers;
    }

    public function setSubaudienceUsers($users)
    {
        $this->subaudienceUsers = $users;
        return $this;
    }

    public function addSubaudienceUser(User $oUser)
    {
        if (!$this->subaudienceUsers->contains($oUser)) {
            $this->subaudienceUsers->add($oUser);
        }
        return $this;
    }

    public function removeSubaudienceUser(User $oUser)
    {
        $this->subaudienceUsers->removeElement($oUser);
        return $this;
    }

    public function getSubaudienceAudience()
    {
        return $this->subaudience_audience;
    }

    public function setSubaudienceAudience($audience)
    {
        $this->subaudience_audience = $audience;
        return $this;
    }

    public function getSubaudienceEnabled()
    {
        return $this->subaudience_enabled;
    }

    public function setSubaudienceEnabled($enabled)
    {
        $this->subaudience_enabled = $enabled;
        return $this;
    }

    public function getSubaudienceInjects()
    {
        return $this->subaudience_injects;
    }

    public function setSubaudienceInjects($injects)
    {
        $this->subaudience_injects = $injects;
        return $this;
    }

    public function getSubaudienceExercise()
    {
        return $this->subaudience_exercise;
    }

    public function setSubaudienceExercise($exercise)
    {
        $this->subaudience_exercise = $exercise;
        return $this;
    }
}
