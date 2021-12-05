<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;


/**
 * @ORM\Entity()
 * @ORM\Table(name="parameters")
 */
class Parameter
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator("doctrine.uuid_generator")
     */
    protected $parameter_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $parameter_key;

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

    public function getParameterKey()
    {
        return $this->parameter_key;
    }

    public function setParameterKey($key)
    {
        $this->parameter_key = $key;
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
