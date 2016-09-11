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