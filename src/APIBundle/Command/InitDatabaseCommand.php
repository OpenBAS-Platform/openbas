<?php

namespace APIBundle\Command;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\Role;
use APIBundle\Entity\Token;
use APIBundle\Entity\User;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class InitDatabaseCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('app:db-init')
            ->setDescription('Initialize the database with a primary set of data')
            ->setHelp("Initialize the database with a primary set of data (users, tokens and samples).")
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('Initializing database');
        $output->writeln('============');
        $output->writeln('');
        $output->writeln('Creating default user');

        $em = $this->getContainer()->get('doctrine.orm.entity_manager');

        $user = new User();
        $user->setUserFirstname('Admin');
        $user->setUserLastname('CEP');
        $user->setUserEmail('admin');
        $user->setUserAdmin(1);
        $user->setUserStatus(1);
        $password = 'admin';
        $encoder = $this->getContainer()->get('security.password_encoder');
        $encoded = $encoder->encodePassword($user, $password);
        $user->setUserPassword($encoded);
        $em->persist($user);
        $em->flush();

        $output->writeln('Login: admin / Password: admin');
        $output->writeln('============');
        $output->writeln('');
        $output->writeln('Creating default token');

        $token = new Token();
        $token->setTokenValue(base64_encode(random_bytes(50)));
        $token->setTokenCreatedAt(new \DateTime('now'));
        $token->setTokenUser($user);
        $em->persist($token);
        $em->flush();

        $output->writeln('Token: ' . $token->getTokenValue());
        $output->writeln('============');
        $output->writeln('');
        $output->writeln('Creating default roles');

        $roleAdmin = new Role();
        $roleAdmin->setRoleName('ROLE_ADMIN');
        $em->persist($roleAdmin);
        $em->flush();
        $rolePlanner = new Role();
        $rolePlanner->setRoleName('ROLE_PLANNER');
        $em->persist($rolePlanner);
        $em->flush();
        $rolePlayer = new Role();
        $rolePlayer->setRoleName('ROLE_PLAYER');
        $em->persist($rolePlayer);
        $em->flush();
        $roleObserver = new Role();
        $roleObserver->setRoleName('ROLE_OBSERVER');
        $em->persist($roleObserver);
        $em->flush();

        $output->writeln('Default roles: ADMIN, PLANNER, PLAYER, OBSERVER');
        $output->writeln('============');
    }
}