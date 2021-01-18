<?php

namespace App\Controller;

use App\Controller\Base\BaseController;
use App\Entity\Organization;
use App\Entity\User;
use App\Form\Type\UserType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserController extends BaseController
{

    /**
     * @OA\Property(
     *    description="List users planificateurs"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/api/planificateurs")
     */
    public function getPlanificateursAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $planificateurs = $em->getRepository('App:User')->FindBy(array('user_planificateur' => true));
        return $planificateurs;
    }

    /**
     * @OA\Property(
     *    description="List users"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/api/users")
     */
    public function getUsersAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $users = array();
        if (!$request->get('keyword')) {
            $users = $em->getRepository('App:User')->findAll();
        } else {
            $users = $em->getRepository('App:User')->createQueryBuilder('o')
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

        foreach ($users as &$user) {
            $user->setUserGravatar();
            $user->setUserCanUpdate($this->hasGranted(self::UPDATE, $user));
            $user->setUserCanDelete($this->hasGranted(self::DELETE, $user));
        }

        //$this->get('openex_mailer')->sendEmailWithMessage("samuel@hassine.fr", 'This is a test', 'test message');

        return $users;
    }

    /**
     * @OA\Property(
     *    description="Read a user"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Get("/api/users/{user_id}")
     */
    public function getUserAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository('App:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        $user->setUserGravatar();
        $user->setUserCanUpdate($this->hasGranted(self::UPDATE, $user));
        $user->setUserCanDelete($this->hasGranted(self::DELETE, $user));

        return $user;
    }

    private function userNotFound()
    {
        return View::create(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * @OA\Property(
     *    description="Create a user"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"user"})
     * @Rest\Post("/api/users")
     */
    public function postUsersAction(Request $request, UserPasswordEncoderInterface $encoder)
    {
        $em = $this->getDoctrine()->getManager();

        $user = new User();
        $form = $this->createForm(UserType::class, $user);
        $form->submit($request->request->all());
        $user->setUserLogin($user->getUserEmail());
        if ($form->isValid()) {
            $organization = $em->getRepository('App:Organization')->findOneBy(['organization_name' => $request->request->get('user_organization')]);
            if (empty($organization)) {
                $organization = new Organization();
                $organization->setOrganizationName($request->request->get('user_organization'));
                $em->persist($organization);
                $em->flush();
            }
            $user->setUserOrganization($organization);

            if (!empty($user->getUserPlainPassword())) {
                $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
                $user->setUserPassword($encoded);
            }

            $em = $this->getDoctrine()->getManager();
            if ($user->getUserAdmin() === null) {
                $user->setUserAdmin(false);
            }
            if ($user->getUserAdmin() == true && !$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
                throw new AccessDeniedHttpException("Access Denied.");
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
     * @OA\Property(
     *    description="Delete a user"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"user"})
     * @Rest\Delete("/api/users/{user_id}")
     */
    public function removeUserAction(Request $request)
    {
        if (!$this->get('security.token_storage')->getToken()->getUser()->isAdmin()) {
            throw new AccessDeniedHttpException("Access Denied.");
        }

        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository('App:User')->find($request->get('user_id'));
        /* @var $user User */

        if ($user) {
            $em->remove($user);
            $em->flush();
        }
    }

    /**
     * @OA\Property(
     *    description="Update a user"
     * )
     *
     * @Rest\View(serializerGroups={"user"})
     * @Rest\Put("/api/users/{user_id}")
     */
    public function updateUserAction(Request $request,  UserPasswordEncoderInterface $encoder)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $em->getRepository('App:User')->find($request->get('user_id'));
        /* @var $user User */

        if (empty($user)) {
            return $this->userNotFound();
        }

        if (!empty($request->request->get('user_organization'))) {
            $organization = $em->getRepository('App:Organization')->findOneBy(['organization_name' => $request->request->get('user_organization')]);
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
                $encoded = $encoder->encodePassword($user, $user->getUserPlainPassword());
                $user->setUserPassword($encoded);
            }

            if (!$isAdmin) {
                $user->setUserAdmin($userAdmin);
            } elseif ($user->getUserAdmin() === false) {
                $user->setUserAdmin(0);
            }

            $em->persist($user);
            $em->flush();
            $em->clear();
            $user = $em->getRepository('App:User')->find($request->get('user_id'));
            $user->setUserGravatar();
            return $user;
        } else {
            return $form;
        }
    }
}
