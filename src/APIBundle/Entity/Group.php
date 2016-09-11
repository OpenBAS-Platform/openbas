<?php

namespace APIBundle\Entity;

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


}