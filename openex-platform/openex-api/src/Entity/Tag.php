<?php

namespace App\Entity;

use App\Entity\Base\BaseEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;



/**
 * @ORM\Entity()
 * @ORM\Table(name="tags")
 */
class Tag extends BaseEntity
{

    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator("doctrine.uuid_generator")
     */
    protected $tag_id;
    /**
     * @ORM\Column(type="string")
     */
    protected $tag_name;
    /**
     * @ORM\ManyToMany(targetEntity="Document", mappedBy="document_tags")
     * @var Documents[]
     */
    protected $tag_documents;

    public function __construct()
    {
        parent::__construct();
        $this->tag_documents = new ArrayCollection();
    }

    public function getTagId()
    {
        return $this->tag_id;
    }

    public function getTagName()
    {
        return $this->tag_name;
    }

    public function setTagName($name)
    {
        $this->tag_name = $name;
        return $this;
    }
}
