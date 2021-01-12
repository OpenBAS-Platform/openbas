<?php

namespace App\Controller;

use App\Entity\Credentials;
use App\Entity\Token;
use App\Entity\User;
use App\Form\Type\CredentialsType;
use DateTime;
use Exception;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AuthController extends AbstractController
{
    private $passwordEncoder;

    public function __construct(UserPasswordEncoderInterface $passwordEncoder)
    {
        $this->passwordEncoder = $passwordEncoder;
    }

    /**
     * @OA\Property(
     *    description="Get a Kerberos token",
     * )
     * @Rest\View(serializerGroups={"token"})
     * @Rest\Get("/api/auth/kerberos")
     * @throws Exception
     */
    public function getAuthKerberosTokenAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $apacheAuthUser = $request->server->get('REMOTE_USER');

        if ($apacheAuthUser === null) {
            return $this->noKerberos();
        }

        $user = $em->getRepository('App:User')->findOneBy(['user_login' => $apacheAuthUser]);
        if (!$user) {
            $user = new User();
            $user->setUserLogin($apacheAuthUser);
            $user->setUserEmail($apacheAuthUser);
            $user->setUserFirstname($apacheAuthUser);
            $user->setUserLastname('Doe');
            $user->setUserAdmin(false);
            $user->setUserStatus(1);
            $user->setUserLang('auto');
            $em->persist($user);
            $em->flush();
            $user->setUserGravatar();
        }

        $token = $em->getRepository('App:Token')->findOneBy(['token_user' => $user->getUserId()]);
        if (!$token) {
            $token = new Token();
            $token->setTokenValue(base64_encode(random_bytes(50)));
            $token->setTokenCreatedAt(new DateTime('now'));
            $token->setTokenUser($user);

            $em->persist($token);
            $em->flush();
        }

        return $token;
    }

    private function noKerberos()
    {
        return View::create(['message' => 'Kerberos is not detected'], Response::HTTP_BAD_REQUEST);
    }

    /**
     * @OA\Property(
     *    description="Create a token"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"token"})
     * @Rest\Post("/api/auth")
     * @throws Exception
     */
    public function postAuthAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $credentials = new Credentials();
        $form = $this->createForm(CredentialsType::class, $credentials);

        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $user = $em->getRepository('App:User')->findOneBy(['user_login' => $credentials->getLogin()]);

        if (!$user) {
            return $this->invalidCredentials();
        }
        $user->setUserGravatar();

        $isPasswordValid = $this->passwordEncoder->isPasswordValid($user, $credentials->getPassword());

        if (!$isPasswordValid) {
            return $this->invalidCredentials();
        }

        $token = new Token();
        $token->setTokenValue(base64_encode(random_bytes(50)));
        $token->setTokenCreatedAt(new DateTime('now'));
        $token->setTokenUser($user);

        $em->persist($token);
        $em->flush();

        return $token;
    }

    private function invalidCredentials()
    {
        return View::create(['errors' => ['children' => ['login' => ['errors' => ['Invalid credentials']]]]], Response::HTTP_BAD_REQUEST);
    }
}
