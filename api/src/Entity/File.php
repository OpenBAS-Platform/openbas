<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\Tests\StringableObject;

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

    /**
     * @ORM\Column(type="string")
     */
    protected $file_path;

    /**
     * @ORM\Column(type="string")
     */
    protected $file_type;


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

    public function getFilePath()
    {
        return $this->file_path;
    }

    public function setFilePath($path)
    {
        $this->file_path = $path;
        return $this;
    }

    public function getFileType()
    {
        return $this->file_type;
    }

    public function setFileType($type)
    {
        $this->file_type = $type;
        return $this;
    }

}
