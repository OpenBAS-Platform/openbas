<?php

namespace App\Entity;

use DateTime;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="tokens", uniqueConstraints={@ORM\UniqueConstraint(name="tokens_value_unique", columns={"token_value"})})
 */
class Token
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $token_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $token_value;

    /**
     * @ORM\Column(type="datetime")
     * @var DateTime
     */
    protected $token_created_at;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="token_user", referencedColumnName="user_id", onDelete="CASCADE")
     * @var User
     */
    protected $token_user;

    public function getTokenId()
    {
        return $this->token_id;
    }

    public function setTokenId($id)
    {
        $this->token_id = $id;
        return $this;
    }

    public function getTokenValue()
    {
        return $this->token_value;
    }

    public function setTokenValue($value)
    {
        $this->token_value = $value;
        return $this;
    }

    public function getTokenCreatedAt()
    {
        return $this->token_created_at;
    }

    public function setTokenCreatedAt(DateTime $createdAt)
    {
        $this->token_created_at = $createdAt;
        return $this;
    }

    public function getTokenUser()
    {
        return $this->token_user;
    }

    public function setTokenUser(User $user)
    {
        $this->token_user = $user;
        return $this;
    }
}
