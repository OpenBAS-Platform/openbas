<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="status")
 */
class Status
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $status_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $status_name;

    public function getStatusId()
    {
        return $this->status_id;
    }

    public function setStatusId($id)
    {
        $this->status_id = $id;
        return $this;
    }

    public function getStatusName()
    {
        return $this->status_name;
    }

    public function setStatusName($name)
    {
        $this->status_name = $name;
        return $this;
    }
}