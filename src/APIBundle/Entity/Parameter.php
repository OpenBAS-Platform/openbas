<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="parameters")
 */
class Parameters
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $parameter_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $parameter_name;

    /**
     * @ORM\Column(type="string")
     */
    protected $parameter_value;

    public function getParameterId()
    {
        return $this->parameter_id;
    }

    public function setParameterId($id)
    {
        $this->parameter_id = $id;
        return $this;
    }

    public function getParameterName()
    {
        return $this->parameter_name;
    }

    public function setParameterName($name)
    {
        $this->parameter_name = $name;
        return $this;
    }

    public function getParameterValue()
    {
        return $this->parameter_value;
    }

    public function setParameterValue($value)
    {
        $this->parameter_value = $value;
        return $this;
    }
}