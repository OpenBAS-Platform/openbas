<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="grants", uniqueConstraints={@ORM\UniqueConstraint(name="grant", columns={"grant_group", "grant_exercise", "grant_name"})})
 */
class Grant
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $grant_id;

    /**
     * @ORM\ManyToOne(targetEntity="Group", inversedBy="group_grants")
     * @ORM\JoinColumn(name="grant_group", referencedColumnName="group_id", onDelete="CASCADE")
     * @var Group
     */
    protected $grant_group;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise")
     * @ORM\JoinColumn(name="grant_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $grant_exercise;

    /**
     * @ORM\Column(type="string", columnDefinition="ENUM('ADMIN', 'PLANNER', 'PLAYER', 'OBSERVER')")
     */
    protected $grant_name;

    public function getGrantId()
    {
        return $this->grant_id;
    }

    public function setGrantId($id)
    {
        $this->grant_id = $id;
        return $this;
    }

    public function getGrantGroup()
    {
        return $this->grant_group;
    }

    public function setGrantGroup($group)
    {
        $this->grant_group = $group;
        return $this;
    }

    public function getGrantExercise()
    {
        return $this->grant_exercise;
    }

    public function setGrantExercise($exercise)
    {
        $this->grant_exercise = $exercise;
        return $this;
    }

    public function getGrantName()
    {
        return $this->grant_name;
    }

    public function setGrantName($name)
    {
        $this->grant_name = $name;
        return $this;
    }
}