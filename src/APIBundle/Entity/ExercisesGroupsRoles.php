<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="exercises_groups_roles")
 */
class ExercisesGroupsRoles
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $egr_id;

    /**
     * @ORM\ManyToOne(targetEntity="Exercise", inversedBy="exercisesGroupsRoles")
     * @ORM\JoinColumn(name="exercise_id", referencedColumnName="exercise_id", nullable=false, onDelete="CASCADE")
     */
    protected $exercise_id;

    /**
     * @ORM\ManyToOne(targetEntity="Group", inversedBy="exercisesGroupsRoles")
     * @ORM\JoinColumn(name="group_id", referencedColumnName="group_id", nullable=false, onDelete="CASCADE")
     */
    protected $group_id;

    /**
     * @ORM\ManyToOne(targetEntity="Role", inversedBy="exercisesGroupsRoles")
     * @ORM\JoinColumn(name="role_id", referencedColumnName="role_id", nullable=false, onDelete="CASCADE")
     */
    protected $role_id;

    /**
     * @ORM\OneToMany(targetEntity="ExercisesGroupsRoles", mappedBy="exercises")
     */
    protected $exercisesGroupsRoles;

    public function getEgrId()
    {
        return $this->egr_id;
    }

    public function setEgrId($id)
    {
        $this->egr_id = $id;
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

    public function getGroupId()
    {
        return $this->group_id;
    }

    public function setGroupId($id)
    {
        $this->group_id = $id;
        return $this;
    }

    public function getRoleId()
    {
        return $this->role_id;
    }

    public function setRoleId($id)
    {
        $this->role_id = $id;
        return $this;
    }

    public function getExercisesGroupsRoles()
    {
        return $this->exercisesGroupsRoles;
    }

    public function setExercisesGroupsRoles($exercisesGroupsRoles)
    {
        $this->exercisesGroupsRoles = $exercisesGroupsRoles;
        return $this;
    }
}