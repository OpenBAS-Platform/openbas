<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="file_tags", uniqueConstraints={@ORM\UniqueConstraint(name="file_tag", columns={"tag_name", "tag_file"})})
 */
class FileTag
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $tag_id;

    /**
     * @ORM\ManyToOne(targetEntity="File")
     * @ORM\JoinColumn(name="tag_file", referencedColumnName="file_id", onDelete="CASCADE")
     * @var File
     */
    protected $tag_file;

    /**
     * @ORM\Column(type="string")
     */
    protected $tag_name;

    public function getTagId()
    {
        return $this->tag_id;
    }

    public function setTGagId($id)
    {
        $this->tag_id = $id;
        return $this;
    }

    public function getTagFile()
    {
        return $this->tag_file;
    }

    public function setTagFile($file)
    {
        $this->tag_file = $file;
        return $this;
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