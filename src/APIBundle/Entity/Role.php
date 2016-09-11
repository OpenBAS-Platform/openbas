<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="roles")
 */
class Role
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $role_id;

    /**
     * @ORM\ManyToOne(targetEntity="Group")
     * @ORM\JoinColumn(name="role_group", referencedColumnName="group_id", onDelete="CASCADE")
     * @var Group
     */
    protected $role_group;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise")
     * @ORM\JoinColumn(name="role_exercise", referencedColumnName="exercise_id", onDelete="CASCADE")
     * @var Exercise
     */
    protected $role_exercise;

    /**
     * @ORM\Column(type="string")
     */
    protected $role_name;

    public function getRoleId()
    {
        return $this->role_id;
    }

    public function setRoleId($id)
    {
        $this->role_id = $id;
        return $this;
    }

    public function getRoleGroup()
    {
        return $this->role_name;
    }

    public function setRoleGroup($group)
    {
        $this->role_group = $group;
        return $this;
    }

    public function getRoleExercise()
    {
        return $this->role_exercise;
    }

    public function setRoleExercise($exercise)
    {
        $this->role_exercise = $exercise;
        return $this;
    }

    public function getRoleName()
    {
        return $this->role_name;
    }

    public function setRoleName($name)
    {
        $this->role_name = $name;
        return $this;
    }
}