<?php

namespace App\Entity;

use App\Entity\Base\BaseEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity()
 * @ORM\Table(name="users", uniqueConstraints={@ORM\UniqueConstraint(name="users_email_unique",columns={"user_email"})})
 */
class User extends BaseEntity implements UserInterface, PasswordAuthenticatedUserInterface
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator("doctrine.uuid_generator")
     */
    protected $user_id;
    /**
     * @ORM\Column(type="string", unique=true)
     */
    protected $user_login;
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
     * @ORM\Column(type="float", nullable=true)
     */
    protected $user_latitude;
    /**
     * @ORM\Column(type="float", nullable=true)
     */
    protected $user_longitude;
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_password;
    protected $user_plain_password;
    /**
     * @ORM\OneToMany(targetEntity="Inject", mappedBy="inject_user")
     * @var Inject[]
     */
    protected $user_injects;
    /**
     * @ORM\OneToMany(targetEntity="ComcheckStatus", mappedBy="status_user")
     * @var Comcheck[]
     */
    protected $user_comchecks_statuses;
    /**
     * @ORM\OneToMany(targetEntity="Log", mappedBy="log_user")
     * @var Log[]
     */
    protected $user_logs;
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
     * @ORM\ManyToMany(targetEntity="Subaudience", mappedBy="subaudienceUsers")
     * @var Audience[]
     */
    protected $userSubaudiences;
    /**
     * @ORM\ManyToMany(targetEntity="Audience", mappedBy="audience_planificateur_users")
     * @var Audience[]
     */
    protected $userPlanificateurAudiences;
    /**
     * @ORM\ManyToMany(targetEntity="Event", mappedBy="eventPlanificateurUsers")
     * @var Event[]
     */
    protected $userPlanificateurEvents;
    /**
     * @ORM\Column(type="boolean")
     */
    protected $user_admin = false;
    /**
     * @ORM\Column(type="boolean", options={"default" : false})
     */
    protected $user_planificateur = false;
    /**
     * @ORM\Column(type="smallint")
     */
    protected $user_status = 1;
    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $user_lang;
    /**
     * @ORM\OneToMany(targetEntity="Token", mappedBy="token_user")
     * @var Token[]
     */
    protected $user_tokens;

    protected $user_gravatar;
    protected $user_subaudience;

    public function __construct()
    {
        $this->user_groups = new ArrayCollection();
        $this->userSubaudiences = new ArrayCollection();
        $this->user_comchecks = new ArrayCollection();
        $this->user_injects = new ArrayCollection();
        $this->userPlanificateurAudiences = new ArrayCollection();
        $this->userPlanificateurEvents = new ArrayCollection();
        parent::__construct();
    }

    /**
     * Add Audience to planifications user
     * @param type $audience
     * @return $this
     */
    public function addUserPlanificateurAudience($audience)
    {
        if (!$this->userPlanificateurAudiences->contains($audience)) {
            $this->userPlanificateurAudiences->add($audience);
        }
        return $this;
    }

    /**
     * Remove planificateur Audience
     * @param type $audience
     */
    public function removeUserPlanificateurAudience($audience)
    {
        if ($this->userPlanificateurAudiences->contains($audience)) {
            $this->userPlanificateurAudiences->removeElement($audience);
        }
    }

    /**
     * Add Event to planifications user
     * @param type $event
     * @return $this
     */
    public function addUserPlanificateurEvent($event)
    {
        if (!$this->userPlanificateurEvents->contains($event)) {
            $this->userPlanificateurEvents->add($event);
        }
        return $this;
    }

    /**
     * Remove Planificateur Event
     * @param type $event
     */
    public function removeUserPlanificateurEvent($event)
    {
        if ($this->userPlanificateurEvents->contains($event)) {
            $this->userPlanificateurEvents->removeElement($event);
        }
    }

    /**
     * Get All Planification for user
     * @return type
     */
    public function getUserPlanificateurAudiences()
    {
        return $this->userPlanificateurAudiences;
    }

    /**
     * Get All Planification for user
     * @return type
     */
    public function getUserPlanificateurEvents()
    {
        return $this->userPlanificateurEvents;
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

    public function getUserLogin()
    {
        return $this->user_login;
    }

    public function setUserLogin($login)
    {
        $this->user_login = $login;
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

    public function getUserSubaudiences()
    {
        return $this->userSubaudiences;
    }

    public function setUserSubaudiences($subaudiences)
    {
        $this->userSubaudiences = $subaudiences;
        return $this;
    }

    public function addUserSubaudiences(Subaudience $oSubaudience)
    {
        if (!$this->userSubaudiences->contains($oSubaudience)) {
            $this->userSubaudiences->add($oSubaudience);
        }
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

    public function getUserPlanificateur()
    {
        return $this->user_planificateur;
    }

    public function setUserPlanificateur($planificateur)
    {
        $this->user_planificateur = $planificateur;
        return $this;
    }

    /**
     * L'utilisateur est il planificateur de cette audience ?
     * @param type $audience
     * @return type
     */
    public function isUserPlanificateurAudiences($audience)
    {
        return $this->userPlanificateurAudiences->contains($audience);
    }

    public function isPlanificateurEvent($event)
    {
        return $this->userPlanificateurEvents->contains($event);
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

    public function getUserGravatar()
    {
        return $this->user_gravatar;
    }

    public function setUserGravatar()
    {
        $this->user_gravatar = 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($this->user_email))) . '?d=mm';
        return $this;
    }

    public function getUserSubaudience()
    {
        return $this->user_subaudience;
    }

    public function setUserSubaudience($subaudience)
    {
        $this->user_subaudience = $subaudience;
        return $this;
    }

    public function getUserTokens()
    {
        return $this->user_tokens;
    }

    public function setUserTokens($tokens)
    {
        $this->user_tokens = $tokens;
        return $this;
    }

    public function getUserGrants()
    {
        $grants = [];
        foreach ($this->user_groups as $group) {
            foreach ($group->getGroupGrants() as $grant) {
                $grants[] = $grant;
            }
        }
        return $grants;
    }

    public function getRoles()
    {
        $roles = ['ROLE_USER'];
        if ($this->isAdmin()) {
            $roles[] = 'ROLE_ADMIN';
        }

        return $roles;
    }

    public function isAdmin()
    {
        return $this->user_admin;
    }

    public function getGrants()
    {
        $grants = array();
        foreach ($this->user_groups as $group) {
            foreach ($group->getGroupGrants() as $grant) {
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

    public function eraseCredentials()
    {
        $this->user_plain_password = null;
    }

    public function getUserLatitude()
    {
        return $this->user_latitude;
    }

    public function setUserLatitude($user_latitude): void
    {
        $this->user_latitude = $user_latitude;
    }

    public function getUserLongitude()
    {
        return $this->user_longitude;
    }

    public function setUserLongitude($user_longitude): void
    {
        $this->user_longitude = $user_longitude;
    }

    public function getPassword(): ?string
    {
        return $this->user_password;
    }

    public function getUserIdentifier(): string
    {
        return $this->getUserLogin();
    }
}
