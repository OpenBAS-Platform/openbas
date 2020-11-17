<?php

namespace App\Command;

use App\Entity\File;
use App\Entity\IncidentType;
use App\Entity\Organization;
use App\Entity\Token;
use App\Entity\User;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class InitDatabaseCommand extends Command
{
    protected static $defaultName = 'app:db-init';
    private $em;
    private $encoder;
    private $params;

    public function __construct(EntityManagerInterface $em, UserPasswordEncoderInterface $encoder, ParameterBagInterface $params)
    {
        parent::__construct();
        $this->em = $em;
        $this->encoder = $encoder;
        $this->params = $params;
    }

    protected function configure()
    {
        $this
            ->setName('app:db-init')
            ->setDescription('Initialize the database with a primary set of data')
            ->setHelp("Initialize the database with a primary set of data (users, tokens and samples).");
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $varDir = $this->params->get('kernel.project_dir') . '/var';

        if (file_exists($varDir . '/initialized')) {
            $output->writeln('Initializing database');
            $output->writeln('============');
            $output->writeln('Already initialized');
            return Command::SUCCESS;
        }

        $output->writeln('Initializing database');
        $output->writeln('============');
        $output->writeln('');

        $this->createIncidentType('TECHNICAL');
        $this->createIncidentType('OPERATIONAL');
        $this->createIncidentType('STRATEGIC');
        $output->writeln('Creating default incident types');

        $this->createFile('Exercise default', 'default_exercise.png', 'png');
        $this->createFile('Event default', 'default_event.png', 'png');
        $output->writeln('Creating default files');

        $userAdmin = $this->createUser('admin@openex.io', 'admin', 'John', 'Doe', true, false, null);
        $output->writeln('Creating user admin@openex.io with password admin');

        if ($this->params->get('admin_token') && strlen($this->params->get('admin_token')) > 0) {
            $token = $this->params->get('admin_token');
        } else {
            $token = null;
        }
        $tokenAdmin = $this->createToken($userAdmin, $token);
        $output->writeln('Creating token for user admin: ' . $tokenAdmin->getTokenValue());

        touch($varDir . '/initialized');
        return Command::SUCCESS;
    }

    private function createIncidentType($name)
    {
        $type = new IncidentType();
        $type->setTypeName($name);
        $this->em->persist($type);
        $this->em->flush();

        return $type;
    }

    private function createFile($name, $path, $type)
    {
        $file = new File();
        $file->setFileName($name);
        $file->setFileTYpe($type);
        $file->setFilePath($path);
        $this->em->persist($file);
        $this->em->flush();

        return $file;
    }

    private function createOrganization($name, $description)
    {
        $organization = new Organization();
        $organization->setOrganizationName($name);
        $organization->setOrganizationDescription($description);

        $this->em->persist($organization);
        $this->em->flush();

        return $organization;
    }

    private function createUser($login, $password, $firstname, $lastname, $admin, $planificateur, $organization)
    {
        $user = new User();
        $user->setUserLogin($login);
        $user->setUserFirstname($firstname);
        $user->setUserLastname($lastname);
        $user->setUserEmail($login);
        $user->setUserAdmin($admin);
        $user->setUserPlanificateur($planificateur);
        $user->setUserStatus(1);
        $user->setUserLang('auto');
        $user->setUserOrganization($organization);
        $encoded = $this->encoder->encodePassword($user, $password);
        $user->setUserPassword($encoded);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    private function createToken($user, $value = null)
    {
        $token = new Token();
        $token->setTokenValue($value ? $value : base64_encode(random_bytes(50)));
        $token->setTokenCreatedAt(new DateTime('now'));
        $token->setTokenUser($user);
        $this->em->persist($token);
        $this->em->flush();

        return $token;
    }
}
