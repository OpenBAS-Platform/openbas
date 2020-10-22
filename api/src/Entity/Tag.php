<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\Tests\StringableObject;
use App\Entity\Base\BaseEntity;


/**
 * @ORM\Entity()
 * @ORM\Table(name="tags")
 */
class Tag extends BaseEntity {

    public function __construct() {
        parent::__construct();
        $this->tag_documents = new ArrayCollection();
    }

    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $tag_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $tag_name;

    public function getTagId(){
        return $this->tag_id;
    }

    public function setTagName($name){
        $this->tag_name = $name;
        return $this;
    }

    public function getTagName(){
        return $this->tag_name;
    }

    /**
     * @ORM\ManyToMany(targetEntity="Document", mappedBy="document_tags")
     * @var Documents[]
     */
    protected $tag_documents;
}
