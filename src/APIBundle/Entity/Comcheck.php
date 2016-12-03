<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="comchecks")
 */
class Comcheck
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $comcheck_id;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $comcheck_start_date;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $comcheck_end_date;

    /**
     * @ORM\ManyToOne(targetEntity="Audience", inversedBy="audience_comchecks")
     * @ORM\JoinColumn(name="comcheck_audience", referencedColumnName="audience_id", onDelete="CASCADE")
     * @var Audience
     */
    protected $comcheck_audience;

    /**
     * @ORM\ManyToMany(targetEntity="User", inversedBy="user_comchecks")
     * @ORM\JoinTable(name="comchecks_users",
     *      joinColumns={@ORM\JoinColumn(name="comcheck_id", referencedColumnName="comcheck_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="user_id", onDelete="RESTRICT")}
     *      )
     * @var User[]
     */
    protected $comcheck_users;

    public function __construct()
    {
        $this->comcheck_users = new ArrayCollection();
    }

    public function getComcheckId()
    {
        return $this->comcheck_id;
    }

    public function setComcheckId($id)
    {
        $this->comcheck_id = $id;
        return $this;
    }

    public function getComcheckStartDate()
    {
        return $this->comcheck_start_date;
    }

    public function setComcheckStartDate($startDate)
    {
        $this->comcheck_start_date = $startDate;
        return $this;
    }

    public function getComcheckEndDate()
    {
        return $this->comcheck_end_date;
    }

    public function setComcheckEndDate($endDate)
    {
        $this->comcheck_end_date = $endDate;
        return $this;
    }

    public function getComcheckAudience()
    {
        return $this->comcheck_audience;
    }

    public function setComcheckAudience($audience)
    {
        $this->comcheck_audience = $audience;
        return $this;
    }

    public function getComcheckUsers()
    {
        return $this->comcheck_users;
    }

    public function setComcheckUsers($users)
    {
        $this->comcheck_users = $users;
        return $this;
    }
}