<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="groups")
 */
class Group
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $group_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $group_name;

    /**
     * @ORM\ManyToMany(targetEntity="User", inversedBy="group_users")
     * @ORM\JoinTable(name="users_groups",
     *      joinColumns={@ORM\JoinColumn(name="group_id", referencedColumnName="group_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="user_id", onDelete="CASCADE")}
     *      )
     * @var User[]
     */
    protected $group_users;

    /**
     * @ORM\OneToMany(targetEntity="Grant", mappedBy="grant_group")
     * @var Grant[]
     */
    protected $group_grants;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="group_owner", referencedColumnName="user_id")
     */
    protected $group_owner;

    protected $group_grant_in_exercise;

    public function __construct()
    {
        $this->group_users = new ArrayCollection();
        $this->group_grants = new ArrayCollection();
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

    public function getGroupName()
    {
        return $this->group_name;
    }

    public function setGroupName($name)
    {
        $this->group_name = $name;
        return $this;
    }

    public function getGroupUsers()
    {
        return $this->group_users;
    }

    public function setGroupUsers($users)
    {
        $this->group_users = $users;
        return $this;
    }

    public function getGroupGrants()
    {
        return $this->group_grants;
    }

    public function setGroupGrants($grants)
    {
        $this->group_grants = $grants;
        return $this;
    }

    public function getGroupOwner()
    {
        return $this->group_owner;
    }

    public function setGroupOwner($owner)
    {
        $this->group_owner = $owner;
        return $this;
    }

    public function getGroupGrantInExercise()
    {
        return $this->group_grant_in_exercise;
    }

    public function setGroupGrantInExercise($grant)
    {
        $this->group_grant_in_exercise = $grant;
        return $this;
    }
}