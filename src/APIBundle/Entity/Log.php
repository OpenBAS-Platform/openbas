<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="logs")
 */
class Log
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $log_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $log_title;

    /**
     * @ORM\Column(type="text")
     */
    protected $log_content;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercise_logs")
     * @ORM\JoinColumn(name="log_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $log_exercise;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="user_logs")
     * @ORM\JoinColumn(name="log_user", referencedColumnName="user_id", onDelete="CASCADE")
     * @var User
     */
    protected $log_user;

    public function getLogId()
    {
        return $this->log_id;
    }

    public function setLogId($id)
    {
        $this->log_id = $id;
        return $this;
    }

    public function getLogTitle()
    {
        return $this->log_title;
    }

    public function setLogTitle($title)
    {
        $this->log_title = $title;
        return $this;
    }

    public function getLogContent()
    {
        return $this->log_content;
    }

    public function setLogContent($content)
    {
        $this->log_content = $content;
        return $this;
    }

    public function getLogExercise()
    {
        return $this->log_exercise;
    }

    public function setLogExercise($exercise)
    {
        $this->log_exercise = $exercise;
        return $this;
    }

    public function getLogUser()
    {
        return $this->log_user;
    }

    public function setLogUser($user)
    {
        $this->log_user = $user;
        return $this;
    }

    public function sanitizeUser() {
        if( $this->log_user !== null ) {
            $this->log_user = $this->log_user->getUserFirstname() . ' ' . $this->log_user->getUserLastname();
        }
    }
}