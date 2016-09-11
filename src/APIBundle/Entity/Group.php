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
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $group_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $group_name;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="group_name")
     * @var User[]
     */
    protected $group_users;

    public function __construct()
    {
        $this->group_users = new ArrayCollection();
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
}