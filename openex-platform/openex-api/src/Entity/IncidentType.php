<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;


/**
 * @ORM\Entity()
 * @ORM\Table(name="incident_types")
 */
class IncidentType
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator("doctrine.uuid_generator")
     */
    protected $type_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $type_name;

    /**
     * @ORM\OneToMany(targetEntity="Incident", mappedBy="incident_type")
     * @var Comcheck[]
     */
    protected $type_incidents;

    public function getTypeId()
    {
        return $this->type_id;
    }

    public function setTypeId($id)
    {
        $this->type_id = $id;
        return $this;
    }

    public function getTypeName()
    {
        return $this->type_name;
    }

    public function setTypeName($name)
    {
        $this->type_name = $name;
        return $this;
    }
}
