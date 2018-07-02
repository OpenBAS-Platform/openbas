<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="audiences")
 */
class Audience
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $audience_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $audience_name;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_audiences")
     * @ORM\JoinColumn(name="audience_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $audience_exercise;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $audience_enabled = true;

    /**
     * @ORM\ManyToMany(targetEntity="Inject", mappedBy="inject_audiences")
     * @var Inject[]
     */
    protected $audience_injects;

    /**
     * @ORM\OneToMany(targetEntity="Subaudience", mappedBy="subaudience_audience")
     * @var Subaudience[]
     */
    protected $audience_subaudiences;

    protected $audience_users_number;

    public function __construct()
    {
        $this->audience_injects = new ArrayCollection();
        $this->audience_subaudiences = new ArrayCollection();
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