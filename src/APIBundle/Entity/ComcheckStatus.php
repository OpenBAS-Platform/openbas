<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="comchecks_statuses")
 */
class ComcheckStatus
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $status_id;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="user_comchecks_statuses")
     * @ORM\JoinColumn(name="status_user", referencedColumnName="user_id", onDelete="CASCADE")
     * @var USer
     */
    protected $status_user;

    /**
     * @ORM\ManyToOne(targetEntity="Comcheck", inversedBy="comcheck_comchecks_statuses")
     * @ORM\JoinColumn(name="status_comcheck", referencedColumnName="comcheck_id", onDelete="CASCADE")
     * @var Comcheck
     */
    protected $status_comcheck;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $status_last_update;

    public function getStatusId()
    {
        return $this->status_id;
    }

    public function setStatusId($id)
    {
        $this->status_id = $id;
        return $this;
    }

    public function getStatusUser()
    {
        return $this->status_user;
    }

    public function setStatusUser($user)
    {
        $this->status_user = $user;
        return $this;
    }

    public function getStatusComcheck()
    {
        return $this->status_comcheck;
    }

    public function setStatusComcheck($comcheck)
    {
        $this->status_comcheck = $comcheck;
        return $this;
    }

    public function getStatusLastUpdate()
    {
        return $this->status_last_update;
    }

    public function setStatusLastUpdate($lastUpdate)
    {
        $this->status_last_update = $lastUpdate;
        return $this;
    }
}