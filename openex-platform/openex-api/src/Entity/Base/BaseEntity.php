<?php

namespace App\Entity\Base;

class BaseEntity
{

    /**
     * User can update current object ?
     * @var boolean
     */
    protected $UserCanUpdate = false;

    /**
     * User can delete current object ?
     * @var boolean
     */
    protected $UserCanDelete = false;

    public function __construct()
    {
        $this->UserCanDelete = false;
        $this->UserCanUpdate = false;
    }

    /**
     * Get User Can Update Object
     * @return DateTime
     */
    public function getUserCanUpdate()
    {
        return $this->UserCanUpdate;
    }

    /**
     * Set User Can Update Object
     * @param bool $boolean
     * @return $this
     */
    public function setUserCanUpdate(bool $boolean)
    {
        $this->UserCanUpdate = $boolean;
        return $this;
    }

    /**
     * Get User Can Delete Object
     * @return DateTime
     */
    public function getUserCanDelete()
    {
        return $this->UserCanDelete;
    }

    /**
     * Set User Can Delete Object
     * @param bool $boolean
     * @return $this
     */
    public function setUserCanDelete(bool $boolean)
    {
        $this->UserCanDelete = $boolean;
        return $this;
    }
}
