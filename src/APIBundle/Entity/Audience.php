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
     * @ORM\ManyToMany(targetEntity="User", mappedBy="user_audiences")
     * @var User[]
     */
    protected $audience_users;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_audiences")
     * @ORM\JoinColumn(name="audience_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $audience_exercise;

    public function __construct()
    {
        $this->audience_users = new ArrayCollection();
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

    public function getAudienceUsers()
    {
        return $this->audience_users;
    }

    public function setAudienceUsers($users)
    {
        $this->audience_users = $users;
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
}