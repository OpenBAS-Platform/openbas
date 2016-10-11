<?php

namespace APIBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="files")
 */
class File
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $file_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $file_name;

    protected $file_url;

    public function getFileId()
    {
        return $this->file_id;
    }

    public function setFileId($id)
    {
        $this->file_id = $id;
        return $this;
    }

    public function getFileName()
    {
        return $this->file_name;
    }

    public function setFileName($name)
    {
        $this->file_name = $name;
        return $this;
    }

    public function getFileUrl()
    {
        return $this->file_url;
    }

    public function setFileUrl($url)
    {
        $this->file_url = $url;
        return $this;
    }

    public function buildUrl($protocol, $hostname)
    {
        $this->file_url = $protocol . '://' . $hostname . '/upload/' . $this->file_url;
    }
}