<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="organizations")
 */
class Organization
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $organization_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $organization_name;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    protected $organization_description;

    /**
     * @ORM\OneToMany(targetEntity="User", mappedBy="user_organization")
     * @var User[]
     */
    protected $organization_users;

    public function __construct()
    {
        $this->organization_users = new ArrayCollection();
    }

    public function getOrganizationId()
    {
        return $this->organization_id;
    }

    public function setOrganizationId($id)
    {
        $this->organization_id = $id;
        return $this;
    }

    public function getOrganizationName()
    {
        return $this->organization_name;
    }

    public function setOrganizationName($name)
    {
        $this->organization_name = $name;
        return $this;
    }

    public function getOrganizationDescription()
    {
        return $this->organization_description;
    }

    public function setOrganizationDescription($description)
    {
        $this->organization_description = $description;
        return $this;
    }

    public function getOrganizationUsers()
    {
        return $this->organization_users;
    }

    public function setOrganizationUsers($users)
    {
        $this->organization_users = $users;
        return $this;
    }
}