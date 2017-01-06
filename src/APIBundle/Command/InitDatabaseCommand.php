<?php

namespace APIBundle\Command;

use APIBundle\Entity\Audience;
use APIBundle\Entity\Event;
use APIBundle\Entity\Exercise;
use APIBundle\Entity\File;
use APIBundle\Entity\Grant;
use APIBundle\Entity\Group;
use APIBundle\Entity\Incident;
use APIBundle\Entity\IncidentType;
use APIBundle\Entity\Inject;
use APIBundle\Entity\Objective;
use APIBundle\Entity\Outcome;
use APIBundle\Entity\Result;
use APIBundle\Entity\InjectStatus;
use APIBundle\Entity\Token;
use APIBundle\Entity\User;
use APIBundle\Entity\Organization;
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

        $typeTechnical = $this->createIncidentType('TECHNICAL');
        $typeOperational = $this->createIncidentType('OPERATIONAL');
        $typeStrategic = $this->createIncidentType('STRATEGIC');
        $output->writeln('Creating default incident types');

        $fileExercise = $this->createFile('Exercise default', 'default_exercise.png', 'png');
        $fileEvent = $this->createFile('Event default', 'default_event.png', 'png');
        $output->writeln('Creating default files');

        $organizationAgency = $this->createOrganization('The agency', 'The national security agency');
        $output->writeln('Creating organization \'The agency\'');

        $userAdmin = $this->createUser('admin@openex.io', 'admin', 'John', 'Doe', true, $organizationAgency);
        $output->writeln('Creating user admin@openex.io with password admin');

        $tokenAdmin = $this->createToken($userAdmin);
        $output->writeln('Creating token for user admin: ' . $tokenAdmin->getTokenValue());

        $userDemo = $this->createUser('demo@openex.io', 'demo', 'Demo', 'Openex', true, $organizationAgency);
        $output->writeln('Creating user demo@openex.io with password demo');

        $tokenDemo = $this->createToken($userDemo);
        $output->writeln('Creating token for user demo: ' . $tokenDemo->getTokenValue());

        $userJane = $this->createUser('jane@openex.io', 'jane', 'Jane', 'Doe', true, $organizationAgency);
        $output->writeln('Creating user jane@openex.io with password jane');

        $tokenJane = $this->createToken($userJane);
        $output->writeln('Creating token for user jane: ' . $tokenJane->getTokenValue());

        $userJerry = $this->createUser('jerry@openex.io', 'jerry', 'Jerry', 'Doe', true, $organizationAgency);
        $output->writeln('Creating user jerry@openex.io with password jerry');

        $tokenJerry = $this->createToken($userJerry);
        $output->writeln('Creating token for user jerry: ' . $tokenJerry->getTokenValue());

        $userSam = $this->createUser('sam@openex.io', 'sam', 'Sam', 'Doe', true, $organizationAgency);
        $output->writeln('Creating user sam@openex.io with password sam');

        $tokenSam = $this->createToken($userSam);
        $output->writeln('Creating token for user sam: ' . $tokenSam->getTokenValue());

        $exercisePotatoes = $this->createExercise(
            'Potatoes attack',
            'Major crisis exercise',
            'A massive potatoes attack, this is crisis.',
            new \DateTime('2018-01-01 08:00:00'),
            new \DateTime('2018-01-10 18:00:00'),
            $userAdmin,
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
            $fileExercise
        );
        $output->writeln('Creating exercise \'Cockroach invasion\'');

        $groupPotatoesPlanners = $this->createGroup('Potatoes planners', $userAdmin);
        $output->writeln('Creating group \'Potatoes planners\'');

        $groupCockroachPlanners = $this->createGroup('Cockroach planners', $userAdmin);
        $output->writeln('Creating group \'Cockroach planners\'');

        $this->createGrant('PLANNER', $groupPotatoesPlanners, $exercisePotatoes);
        $output->writeln('Group \'Potatoes planners\' granted PLANNER on exercise \'Potatoes attack\'');

        $this->createGrant('PLANNER', $groupCockroachPlanners, $exerciseCockroach);
        $output->writeln('Group \'Cockroach planners\' granted PLANNER on exercise \'Cockroach attack\'');

        $this->joinGroup($userJane, $groupPotatoesPlanners);
        $output->writeln('Jane is joining group \'Potatoes planners\'');

        $this->joinGroup($userJerry, $groupCockroachPlanners);
        $output->writeln('Jerry is joining group \'Cockroach planners\'');

        $audienceDefence = $this->createAudience('National defence forces', $exercisePotatoes, [$userSam, $userJane]);
        $output->writeln('Creating audience \'National defence forces\'');

        $audienceMedia = $this->createAudience('Communication team', $exercisePotatoes, [$userSam, $userJane, $userJerry]);
        $output->writeln('Creating audience \'Communication team\'');

        $this->createObjective(
            'Train the government to respond to a potatoes attack',
            'Train all ministries and agencies to defend against potatoes and manage the crisis.',
            1,
            $exercisePotatoes);
        $output->writeln('Creating objective \'Train the government to respond to a potatoes attack\'');

        $this->createObjective(
            'Train the government to communicate about a potatoes attack',
            'Test the government communication strategy when facing a massive potatoes crisis.',
            2,
            $exercisePotatoes);
        $output->writeln('Creating objective \'Train the government to communicate about a potatoes attack\'');

        $eventReco = $this->createEvent('Potatoes go on reconnaissance', 'Potatoes are planning their attack and sending reconnaissance teams.', $exercisePotatoes);
        $output->writeln('Creating event \'Potatoes go on reconnaissance\'');

        $eventInfiltration = $this->createEvent('Potatoes infiltration', 'Potatoes infiltrate all strategic buildings and federal agencies.', $exercisePotatoes);
        $output->writeln('Creating event \'Potatoes infiltration\'');

        $incidentCapital = $this->createIncident(
            'A potato is sent to the capital',
            'A potato is sent to the capital in order to search targets.',
            $typeOperational,
            $eventReco);
        $output->writeln('Creating incident \'A potato is sent to the capital\'');

        $outcomeCapital = $this->createOutcome($incidentCapital);
        $output->writeln('Creating outcome for incident \'A potato is sent to the capital\'');

        $incidentSpy = $this->createIncident('A potato is infiltrated',
            'The national security agency building has been infiltrated by a potato',
            $typeOperational,
            $eventInfiltration);
        $output->writeln('Creating incident \'A potato has been detected in the national security agency\'');

        $outcomeSpy = $this->createOutcome($incidentSpy);
        $output->writeln('Creating outcome for incident \'A potato has been detected in the national security agency\'');

        $content = array('sender' => 'no-reply@openex.io', 'subject' => 'Conversation interception', 'body' => 'A conversation between the potatoes chief and an agent', 'encrypted' => false);
        $injectIntercept = $this->createInject(
            'Potatoes headquarters conversation',
            'A potatoes headquarters conversation is intercepted',
            json_encode($content),
            new \DateTime('2018-01-01 08:01:00'),
            'email',
            $incidentCapital,
            $userAdmin
        );
        $this->createInjectStatus($injectIntercept);
        $output->writeln('Creating inject \'Potatoes headquarters conversation\'');

        $content = array('sender' => 'no-reply@openex.io', 'subject' => 'Potato confirmed in flight PO345', 'body' => 'A potato is arriving at the airport, according to the flight passengers records.', 'encrypted' => false);
        $injectArrival = $this->createInject(
            'Potato arrival at the airport',
            'A potato is arriving at the airport ',
            json_encode($content),
            new \DateTime('2018-01-01 08:15:00'),
            'email',
            $incidentCapital,
            $userAdmin
        );
        $this->createInjectStatus($injectArrival);
        $output->writeln('Creating inject \'Potato arrival at the airport\'');

        $content = array('sender' => 'no-reply@openex.io', 'subject' => 'Potato filmed by CCTV', 'body' => 'A potato has been detected by the CCTV of the airport', 'encrypted' => false);
        $injectCamera = $this->createInject(
            'A potato has been detected',
            'A potato has been detected by CCTV',
            json_encode($content),
            new \DateTime('2018-01-01 08:45:00'),
            'email',
            $incidentCapital,
            $userAdmin
        );
        $this->createInjectStatus($injectCamera);
        $output->writeln('Creating inject \'A potato has been detected\'');
    }

    private function createIncidentType($name) {
        $type = new IncidentType();
        $type->setTypeName($name);
        $this->em->persist($type);
        $this->em->flush();

        return $type;
    }

    private function createResult($name) {
        $result = new Result();
        $result->setResultName($name);
        $this->em->persist($result);
        $this->em->flush();

        return $result;
    }

    private function createUser($login, $password, $firstname, $lastname, $admin, $organization) {
        $user = new User();
        $user->setUserFirstname($firstname);
        $user->setUserLastname($lastname);
        $user->setUserEmail($login);
        $user->setUserAdmin($admin);
        $user->setUserStatus(1);
        $user->setUserLang('auto');
        $user->setUserOrganization($organization);
        $encoder = $this->getContainer()->get('security.password_encoder');
        $encoded = $encoder->encodePassword($user, $password);
        $user->setUserPassword($encoded);
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    private function createOrganization($name, $description) {
        $organization = new Organization();
        $organization->setOrganizationName($name);
        $organization->setOrganizationDescription($description);

        $this->em->persist($organization);
        $this->em->flush();

        return $organization;
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

    private function createExercise($name, $subtitle, $description, $startDate, $endDate, $owner, $image) {
        $exercise = new Exercise();
        $exercise->setExerciseCanceled(false);
        $exercise->setExerciseName($name);
        $exercise->setExerciseSubtitle($subtitle);
        $exercise->setExerciseDescription($description);
        $exercise->setExerciseStartDate($startDate);
        $exercise->setExerciseEndDate($endDate);
        $exercise->setExerciseOwner($owner);
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
        $users = $group->getGroupUsers();
        $users[] = $user;
        $group->setGroupUsers($users);
        $this->em->persist($group);
        $this->em->flush();
    }

    private function createFile($name, $path, $type) {
        $file = new File();
        $file->setFileName($name);
        $file->setFileTYpe($type);
        $file->setFilePath($path);
        $this->em->persist($file);
        $this->em->flush();

        return $file;
    }

    private function createAudience($name, $exercise, $users) {
        $audience = new Audience();
        $audience->setAudienceName($name);
        $audience->setAudienceExercise($exercise);
        $audience->setAudienceUsers($users);

        $this->em->persist($audience);
        $this->em->flush();

        return $audience;
    }

    private function createObjective($title, $description, $priority, $exercise) {
        $objective = new Objective();
        $objective->setObjectiveTitle($title);
        $objective->setObjectiveDescription($description);
        $objective->setObjectivePriority($priority);
        $objective->setObjectiveExercise($exercise);

        $this->em->persist($objective);
        $this->em->flush();

        return $objective;
    }

    private function createEvent($title, $description, $exercise) {
        $event = new Event();
        $event->setEventTitle($title);
        $event->setEventDescription($description);
        $event->setEventExercise($exercise);

        $this->em->persist($event);
        $this->em->flush();

        return $event;
    }

    private function createIncident($title, $story, $type, $event) {
        $incident = new Incident();
        $incident->setIncidentTitle($title);
        $incident->setIncidentStory($story);
        $incident->setIncidentType($type);
        $incident->setIncidentEvent($event);
        $incident->setIncidentWeight(0);
        $this->em->persist($incident);
        $this->em->flush();

        return $incident;
    }

    private function createOutcome($incident) {
        $outcome = new Outcome();
        $outcome->setOutcomeIncident($incident);
        $outcome->setOutComeResult(0);

        $this->em->persist($outcome);
        $this->em->flush();

        return $outcome;
    }

    private function createInject($title, $description, $content, $date, $type, $incident, $user) {
        $inject = new Inject();
        $inject->setInjectTitle($title);
        $inject->setInjectDescription($description);
        $inject->setInjectContent($content);
        $inject->setInjectDate($date);
        $inject->setInjectType($type);
        $inject->setInjectIncident($incident);
        $inject->setInjectUser($user);
        $inject->setInjectEnabled(true);

        $this->em->persist($inject);
        $this->em->flush();

        return $inject;
    }

    private function createInjectStatus($inject) {
        $status = new InjectStatus();
        $status->setStatusName('PENDING');
        $status->setStatusDate(new \DateTime());
        $status->setStatusInject($inject);

        $this->em->persist($status);
        $this->em->flush();

        return $status;
    }
}