<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="users", uniqueConstraints={@ORM\UniqueConstraint(name="users_email_unique",columns={"user_email"})})
 */
class User
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $user_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_firstname;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_lastname;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_email;

    public function getUserId()
    {
        return $this->user_id;
    }

    public function setUserId($id)
    {
        $this->user_id = $id;
    }

    public function getUserFirstname()
    {
        return $this->user_firstname;
    }

    public function setUserFirstname($firstname)
    {
        $this->user_firstname = $firstname;
    }

    public function getUserLastname()
    {
        return $this->user_lastname;
    }

    public function setUserLastname($lastname)
    {
        $this->user_lastname = $lastname;
    }

    public function getUserEmail()
    {
        return $this->user_email;
    }

    public function setUserEmail($email)
    {
        $this->user_email = $email;
    }
}