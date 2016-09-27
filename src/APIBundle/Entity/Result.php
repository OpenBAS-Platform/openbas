<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="results")
 */
class Result
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $result_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $result_name;

    public function getResultId()
    {
        return $this->result_id;
    }

    public function setResultId($id)
    {
        $this->result_id = $id;
        return $this;
    }

    public function getResultName()
    {
        return $this->result_name;
    }

    public function setResultName($name)
    {
        $this->result_name = $name;
        return $this;
    }
}