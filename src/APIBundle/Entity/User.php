<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\Common\Collections\ArrayCollection;
use APIBundle\Entity\Grant;

/**
 * @ORM\Entity()
 * @ORM\Table(name="users", uniqueConstraints={@ORM\UniqueConstraint(name="users_email_unique",columns={"user_email"})})
 */
class User implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
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

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_email2;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_phone;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_phone2;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_phone3;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    protected $user_pgp_key;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_password;

    protected $user_plain_password;

    /**
     * @ORM\ManyToOne(targetEntity="Organization", inversedBy="organization_users")
     * @ORM\JoinColumn(name="user_organization", referencedColumnName="organization_id", onDelete="RESTRICT")
     * @var Organization
     */
    protected $user_organization;

    /**
     * @ORM\ManyToMany(targetEntity="Group", mappedBy="group_users")
     * @var Group[]
     */
    protected $user_groups;

    /**
     * @ORM\ManyToMany(targetEntity="Audience", mappedBy="audience_users")
     * @var Audience[]
     */
    protected $user_audiences;

    /**
     * @ORM\ManyToMany(targetEntity="Subaudience", mappedBy="subaudience_users")
     * @var Audience[]
     */
    protected $user_subaudiences;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $user_admin = false;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $user_status = 1;

    /**
     * @ORM\OneToMany(targetEntity="Inject", mappedBy="inject_users")
     * @var User[]
     */
    protected $user_injects;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_lang;

    protected $user_gravatar;

    public function __construct()
    {
        $this->user_groups = new ArrayCollection();
        $this->user_audiences = new ArrayCollection();
        $this->user_subaudiences = new ArrayCollection();
        $this->user_comchecks = new ArrayCollection();
        $this->user_injects = new ArrayCollection();
    }

    public function getUserId()
    {
        return $this->user_id;
    }

    public function setUserId($id)
    {
        $this->user_id = $id;
        return $this;
    }

    public function getUserFirstname()
    {
        return $this->user_firstname;
    }

    public function setUserFirstname($firstname)
    {
        $this->user_firstname = $firstname;
        return $this;
    }

    public function getUserLastname()
    {
        return $this->user_lastname;
    }

    public function setUserLastname($lastname)
    {
        $this->user_lastname = $lastname;
        return $this;
    }

    public function getUserEmail()
    {
        return $this->user_email;
    }

    public function setUserEmail($email)
    {
        $this->user_email = $email;
        return $this;
    }

    public function getUserEmail2()
    {
        return $this->user_email2;
    }

    public function setUserEmail2($email)
    {
        $this->user_email2 = $email;
        return $this;
    }

    public function getUserPhone()
    {
        return $this->user_phone;
    }

    public function setUserPhone($phone)
    {
        $this->user_phone = $phone;
        return $this;
    }

    public function getUserPhone2()
    {
        return $this->user_phone2;
    }

    public function setUserPhone2($phone)
    {
        $this->user_phone2 = $phone;
        return $this;
    }

    public function getUserPhone3()
    {
        return $this->user_phone3;
    }

    public function setUserPhone3($phone)
    {
        $this->user_phone3 = $phone;
        return $this;
    }

    public function getUserPgpKey()
    {
        return $this->user_pgp_key;
    }

    public function setUserPgpKey($key)
    {
        $this->user_pgp_key = $key;
        return $this;
    }

    public function getUserPassword()
    {
        return $this->user_password;
    }

    public function setUserPassword($password)
    {
        $this->user_password = $password;
        return $this;
    }

    public function getUserPlainPassword()
    {
        return $this->user_plain_password;
    }

    public function setUserPlainPassword($password)
    {
        $this->user_plain_password = $password;
        return $this;
    }

    public function getUserOrganization()
    {
        return $this->user_organization;
    }

    public function setUserOrganization($organization)
    {
        $this->user_organization = $organization;
        return $this;
    }

    public function getUserGroups()
    {
        return $this->user_groups;
    }

    public function setUserGroups($groups)
    {
        $this->user_groups = $groups;
        return $this;
    }

    public function getUserAudiences()
    {
        return $this->user_audiences;
    }

    public function setUserAudiences($audiences)
    {
        $this->user_audiences = $audiences;
        return $this;
    }

    public function getUserSubaudiences()
    {
        return $this->user_subaudiences;
    }

    public function setUserSubaudiences($subaudiences)
    {
        $this->user_subaudiences = $subaudiences;
        return $this;
    }

    public function getUserAdmin()
    {
        return $this->user_admin;
    }

    public function setUserAdmin($admin)
    {
        $this->user_admin = $admin;
        return $this;
    }

    public function getUserStatus()
    {
        return $this->user_status;
    }

    public function setUserStatus($status)
    {
        $this->user_status = $status;
        return $this;
    }

    public function getUserInjects()
    {
        return $this->user_injects;
    }

    public function setUserInjects($injects)
    {
        $this->user_injects = $injects;
        return $this;
    }

    public function getUserLang()
    {
        return $this->user_lang;
    }

    public function setUserLang($lang)
    {
        $this->user_lang = $lang;
        return $this;
    }

    public function getUserGravatar() {
        return $this->user_gravatar;
    }

    public function setUserGravatar() {
        $this->user_gravatar = 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($this->user_email))) . '?d=mm';
        return $this;
    }

    public function getUserGrants() {
        $grants = [];
        foreach( $this->user_groups as $group ) {
            foreach( $group->getGroupGrants() as $grant ) {
                $grants[] = $grant;
            }
        }
        return $grants;
    }

    public function getRoles()
    {
        $roles = ['ROLE_USER'];
        if( $this->isAdmin() ) {
            $roles[] = 'ROLE_ADMIN';
        }

        return $roles;
    }

    public function getGrants() {
        $grants = array();
        foreach( $this->user_groups as $group ) {
            foreach( $group->getGroupGrants() as $grant ) {
                $grants[$grant->getGrantExercise()->getExerciseId()] = $grant->getGrantName();
                }
            }
            return $grants;
    }

    public function getSalt()
    {
        return null;
    }

    public function getUsername()
    {
        return $this->user_email;
    }

    public function getPassword()
    {
        return $this->user_password;
    }

    public function eraseCredentials()
    {
        $this->user_plain_password = null;
    }

    public function isAdmin() {
        return $this->user_admin;
    }
}