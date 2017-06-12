<?php

namespace APIBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\ViewHandler;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Form\Type\UserType;
use APIBundle\Entity\User;
use APIBundle\Entity\Organization;
use APIBundle\Service\OpenexMailerService;

class UserController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List users"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/users")
     */
    public function getUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');

        $users = array();
        if( !$request->get('keyword') ) {
            $users = $em->getRepository('APIBundle:User')->findAll();
        } else {
            $users = $em->getRepository('APIBundle:User')->createQueryBuilder('o')
                ->where('o.user_login LIKE :keyword')
                ->orWhere('o.user_firstname LIKE :keyword')
                ->orWhere('o.user_lastname LIKE :keyword')
                ->orWhere('o.user_email LIKE :keyword')
                ->orWhere('o.user_phone LIKE :keyword')
                ->setParameter('keyword', '%' . $request->get('keyword') . '%')
                ->getQuery()
                ->getResult();
        }
        /* @var $users User[] */

        foreach( $users as &$user ) {
            $user->setUserGravatar();
        }

        //$this->get('openex_mailer')->sendEmailWithMessage("samuel@hassine.fr", 'This is a test', 'test message');

        return $users;
    }

    /**
     * @ApiDoc(
     *    description="Read a user"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/users/{user_id}")
     */
    public function getUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $user->setUserGravatar();
        return $user;
    }

    /**
     * @ApiDoc(
     *    description="Create a user",
     *   input={"class"=UserType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/users")
     */
    public function postUsersAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');

        $user = new User();
        $form = $this->createForm(UserType::class, $user);
        $form->submit($request->request->all());
        $user->setUserLogin($user->getUserEmail());
        if ($form->isValid()) {
            $organization = $em->getRepository('APIBundle:Organization')->findOneBy(['organization_name' => $request->request->get('user_organization')]);
            if( empty($organization) ) {
                $organization = new Organization();
                $organization->setOrganizationName($request->request->get('user_organization'));
                $em->persist($organization);
                $em->flush();
            }
            $user->setUserOrganization($organization);

            if (!empty($user->getUserPlainPassword())) {
                $encoder = $this->get('security.password_encoder');
                $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
                $user->setUserPassword($encoded);
            }

            $em = $this->get('doctrine.orm.entity_manager');
            if( $user->getUserAdmin() === null ) {
                $user->setUserAdmin(false);
            }
            if( $user->getUserAdmin() == true && !$this->get('security.token_storage')->getToken()->getUser()->isAdmin() ) {
                throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");
            }

            $user->setUserLang('auto');
            $em->persist($user);
            $em->flush();

            $user->setUserGravatar();
            return $user;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete a user"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"user"})
     * @Rest\Delete("/users/{user_id}")
     */
    public function removeUserAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException("Access Denied.");

        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
        /* @var $user User */

        if ($user) {
            $em->remove($user);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Update a user",
     *   input={"class"=UserType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Put("/users/{user_id}")
     */
    public function updateUserAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        if (!empty($request->request->get('user_organization')) ) {
            $organization = $em->getRepository('APIBundle:Organization')->findOneBy(['organization_name' => $request->request->get('user_organization')]);
            if (empty($organization)) {
                $organization = new Organization();
                $organization->setOrganizationName($request->request->get('user_organization'));
                $em->persist($organization);
                $em->flush();
            }
            $user->setUserOrganization($organization);
            $request->request->remove('user_organization');
        }

        $userAdmin = $user->getUserAdmin();
        $isAdmin = $this->get('security.token_storage')->getToken()->getUser()->isAdmin();
        $form = $this->createForm(UserType::class, $user);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            if (!empty($user->getUserPlainPassword())) {
                $encoder = $this->get('security.password_encoder');
                $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
                $user->setUserPassword($encoded);
            }

            if( !$isAdmin ) {
                $user->setUserAdmin($userAdmin);
            } else if( $user->getUserAdmin() === false ) {
                $user->setUserAdmin(0);
            }

            $em->persist($user);
            $em->flush();
            $em->clear();
            $user = $em->getRepository('APIBundle:User')->find($request->get('user_id'));
            $user->setUserGravatar();
            return $user;
        } else {
            return $form;
        }
    }

    private function userNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
    }
}