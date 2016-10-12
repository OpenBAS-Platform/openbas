<?php

namespace APIBundle\Command;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\File;
use APIBundle\Entity\Grant;
use APIBundle\Entity\Group;
use APIBundle\Entity\InjectType;
use APIBundle\Entity\Result;
use APIBundle\Entity\InjectState;
use APIBundle\Entity\ExerciseStatus;
use APIBundle\Entity\InjectStatus;
use APIBundle\Entity\Token;
use APIBundle\Entity\User;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;

class InitDatabaseCommand extends ContainerAwareCommand
{
    private $em;

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
        $this->em = $this->getContainer()->get('doctrine.orm.entity_manager');

        $output->writeln('Initializing database');
        $output->writeln('============');
        $output->writeln('');

        $statusScheduled = $this->createExerciseStatus('SCHEDULED');
        $statusRunning = $this->createExerciseStatus('RUNNING');
        $statusFinished = $this->createExerciseStatus('FINISHED');

        $statusDraft = $this->createInjectStatus('DRAFT');
        $statusReady = $this->createInjectStatus('READY');
        $statusDisabled = $this->createInjectStatus('DISABLED');
        $output->writeln('Creating default statuses');

        $statePending = $this->createInjectState('PENDING');
        $stateSent = $this->createInjectState('SENT');
        $output->writeln('Creating default states');

        $resultAchieved = $this->createResult('ACHIEVED');
        $resultSemiAchieved = $this->createResult('SEMI_ACHIEVED');
        $resultNotAchieved = $this->createResult('NOT_ACHIEVED');
        $output->writeln('Creating default results');

        $typeWeb = $this->createInjectType('WEB');
        $typeMail = $this->createInjectType('MAIL');
        $typePhone = $this->createInjectType('PHONE');
        $typeSMS = $this->createInjectType('SMS');
        $typeHangout = $this->createInjectType('HANGOUT');
        $output->writeln('Creating default inject types');

        $fileExercise = $this->createFile('Exercise default', 'default_exercise.png');
        $output->writeln('Creating default files');

        $userAdmin = $this->createUser('admin', 'admin', 'John', 'Doe', true);
        $output->writeln('Creating user admin with password admin');

        $tokenAdmin = $this->createToken($userAdmin);
        $output->writeln('Creating token for user admin: ' . $tokenAdmin->getTokenValue());

        $userJane = $this->createUser('jane', 'jane', 'Jane', 'Doe', true);
        $output->writeln('Creating user jane with password jane');

        $tokenJane = $this->createToken($userJane);
        $output->writeln('Creating token for user jane: ' . $tokenJane->getTokenValue());

        $userJerry = $this->createUser('jerry', 'jerry', 'Jerry', 'Doe', true);
        $output->writeln('Creating user jerry with password jerry');

        $tokenJerry = $this->createToken($userJerry);
        $output->writeln('Creating token for user jerry: ' . $tokenJerry->getTokenValue());

        $userSam = $this->createUser('sam', 'sam', 'Sam', 'Doe', true);
        $output->writeln('Creating user sam with password sam');

        $tokenSam = $this->createToken($userSam);
        $output->writeln('Creating token for user sam: ' . $tokenSam->getTokenValue());

        $exercisePotatoes = $this->createExercise(
            'Potatoes attack',
            'Major crisis exercise',
            'A massive potatoes attack, this is crisis.',
            new \DateTime('2018-01-01 08:00:00'),
            new \DateTime('2018-01-10 18:00:00'),
            $userAdmin,
            $statusScheduled,
            $fileExercise
        );
        $output->writeln('Creating exercise \'Potatoes attack\'');

        $exerciseCockroach = $this->createExercise(
            'Cockroach invasion',
            'Minor crisis exercise',
            'A massive cockroach invasion, this is crisis.',
            new \DateTime('2018-01-01 08:00:00'),
            new \DateTime('2018-01-10 18:00:00'),
            $userAdmin,
            $statusScheduled,
            $fileExercise
        );
        $output->writeln('Creating exercise \'Cockroach invasion\'');

        $groupPotatoesPlanners = $this->createGroup('Potatoes planners', $userAdmin);
        $output->writeln('Creating group \'Potatoes planners\'');

        $groupPotatoesPlayers = $this->createGroup('Potatoes players', $userAdmin);
        $output->writeln('Creating group \'Potatoes players\'');

        $groupCockroachPlanners = $this->createGroup('Cockroach planners', $userAdmin);
        $output->writeln('Creating group \'Cockroach planners\'');

        $groupCockroachPlayers = $this->createGroup('Cockroach players', $userAdmin);
        $output->writeln('Creating group \'Cockroach players\'');

        $this->createGrant('PLANNER', $groupPotatoesPlanners, $exercisePotatoes);
        $output->writeln('Group \'Potatoes planners\' granted PLANNER on exercise \'Potatoes attack\'');

        $this->createGrant('PLAYER', $groupPotatoesPlayers, $exercisePotatoes);
        $output->writeln('Group \'Potatoes players\' granted PLAYER on exercise \'Potatoes attack\'');

        $this->createGrant('PLANNER', $groupCockroachPlanners, $exerciseCockroach);
        $output->writeln('Group \'Cockroach planners\' granted PLANNER on exercise \'Cockroach attack\'');

        $this->createGrant('PLAYER', $groupCockroachPlayers, $exerciseCockroach);
        $output->writeln('Group \'Cockroach players\' granted PLAYER on exercise \'Cockroach attack\'');

        $this->joinGroup($userJane, $groupPotatoesPlanners);
        $output->writeln('Jane is joining group \'Potatoes planners\'');

        $this->joinGroup($userJane, $groupCockroachPlayers);
        $output->writeln('Jane is joining group \'Cockroach players\'');

        $this->joinGroup($userJerry, $groupPotatoesPlayers);
        $output->writeln('Jerry is joining group \'Potatoes players\'');

        $this->joinGroup($userJerry, $groupCockroachPlanners);
        $output->writeln('Jerry is joining group \'Cockroach planners\'');

        $this->joinGroup($userSam, $groupCockroachPlayers);
        $output->writeln('Sam is joining group \'Cockroach players\'');
    }

    private function createExerciseStatus($name) {
        $status = new ExerciseStatus();
        $status->setStatusName($name);
        $this->em->persist($status);
        $this->em->flush();

        return $status;
    }

    private function createInjectStatus($name) {
        $status = new InjectStatus();
        $status->setStatusName($name);
        $this->em->persist($status);
        $this->em->flush();

        return $status;
    }

    private function createInjectState($name) {
        $state = new InjectState();
        $state->setStateName($name);
        $this->em->persist($state);
        $this->em->flush();

        return $state;
    }

    private function createResult($name) {
        $result = new Result();
        $result->setResultName($name);
        $this->em->persist($result);
        $this->em->flush();

        return $result;
    }

    private function createInjectType($name) {
        $type = new InjectType();
        $type->setTypeName($name);
        $this->em->persist($type);
        $this->em->flush();

        return $type;
    }

    private function createUser($login, $password, $firstname, $lastname, $admin) {
        $user = new User();
        $user->setUserFirstname($firstname);
        $user->setUserLastname($lastname);
        $user->setUserEmail($login);
        $user->setUserAdmin($admin);
        $user->setUserStatus(1);
        $encoder = $this->getContainer()->get('security.password_encoder');
        $encoded = $encoder->encodePassword($user, $password);
        $user->setUserPassword($encoded);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    private function createToken($user) {
        $token = new Token();
        $token->setTokenValue(base64_encode(random_bytes(50)));
        $token->setTokenCreatedAt(new \DateTime('now'));
        $token->setTokenUser($user);
        $this->em->persist($token);
        $this->em->flush();

        return $token;
    }

    private function createExercise($name, $subtitle, $description, $startDate, $endDate, $owner, $status, $image) {
        $exercise = new Exercise();
        $exercise->setExerciseName($name);
        $exercise->setExerciseSubtitle($subtitle);
        $exercise->setExerciseDescription($description);
        $exercise->setExerciseStartDate($startDate);
        $exercise->setExerciseEndDate($endDate);
        $exercise->setExerciseOwner($owner);
        $exercise->setExerciseStatus($status);
        $exercise->setExerciseImage($image);
        $this->em->persist($exercise);
        $this->em->flush();

        return $exercise;
    }

    private function createGroup($name, $owner) {
        $group = new Group();
        $group->setGroupName($name);
        $group->setGroupOwner($owner);
        $this->em->persist($group);
        $this->em->flush();

        return $group;
    }

    private function createGrant($name, $group, $exercise) {
        $grant = new Grant();
        $grant->setGrantName($name);
        $grant->setGrantGroup($group);
        $grant->setGrantExercise($exercise);
        $this->em->persist($grant);
        $this->em->flush();

        return $grant;
    }

    private function joinGroup($user, $group) {
        $user->joinGroup($group);
        $this->em->persist($user);
        $this->em->flush();
    }

    private function createFile($name, $path) {
        $file = new File();
        $file->setFileName($name);
        $file->setFilePath($path);
        $this->em->persist($file);
        $this->em->flush();

        return $file;
    }
}