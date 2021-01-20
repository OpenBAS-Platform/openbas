<?php

namespace App\Controller\Exercise;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\Incident;
use DateTime;
use Exception;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use OpenApi\Annotations as OA;
use PHPExcel;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use function is_array;

class StatisticController extends BaseController
{
    /**
     * @OA\Response(
     *    response=200,
     *    description="Get all statistics for an exercise"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/api/exercises/{exercise_id}/statistics")
     */
    public function getStatisticsForExerciseAction(Request $request)
    {
        $exerciseId = $request->get('exercise_id');

        $em = $this->getDoctrine()->getManager();
        $oExercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $oExercise Exercise */

        if (empty($oExercise)) {
            return $this->exerciseNotFound();
        }

        $interval = $request->get('interval');

        return [
            'allInjectsCount' => $this->getAllInjectsCount($exerciseId),
            'avgInjectPerPlayerCount' => $this->getAverageInjectsNumberPerPlayer($exerciseId),
            'allPlayersCount' => $this->getAllPlayersCount($exerciseId),
            'organizationsCount' => $this->getOrganizationsCount($exerciseId),
            'frequencyOfInjectsCount' => $this->getInjectsFrequency($exerciseId),
            'injectPerPlayer' => $this->getInjectsCountsPerPlayer($exerciseId),
            'injectPerIncident' => $this->getInjectsCountsPerIncident($exerciseId),
            'injectPerInterval' => $this->getInjectsCountsPerInterval($exerciseId, $interval),
            'value' => strval($this->getDefaultInteval($exerciseId, $interval))
        ];
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * Returns the number of injects for an exercise
     *
     * @param $exerciseId
     * @return int
     */
    private function getAllInjectsCount($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injectsToCount = [];
        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */
            foreach ($incidents as $incident) {
                $injects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident, 'inject_enabled' => true]);
                foreach ($injects as &$inject) {
                    $inject->setInjectEvent($event->getEventId());
                }
                $injectsToCount = array_merge($injectsToCount, $injects);
            }
        }

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        $injectsCount = 0;
        foreach ($injectsToCount as &$inject) {
            $inject->computeUsersNumber($audiences);
            $injectsCount += $inject->getInjectUsersNumber();
        }

        return $injectsCount;
    }

    /**
     * Returns the average number of injects per person for an exercise
     *
     * @param $exerciseId
     * @return float
     */
    private function getAverageInjectsNumberPerPlayer($exerciseId)
    {
        $allPlayersCount = $this->getAllPlayersCount($exerciseId);
        if (!$allPlayersCount) {
            return number_format(0, 2);
        }

        $allInjectsCount = $this->getAllInjectsCount($exerciseId);

        return number_format($allInjectsCount / $allPlayersCount, 2);
    }

    /**
     * Returns the number of players for an exercise
     *
     * @param $exerciseId
     * @return int
     */
    private function getAllPlayersCount($exerciseId)
    {
        $users = $this->getAllPlayersFromExercise($exerciseId);

        if (!is_array($users)) {
            return 0;
        }

        return count($users);
    }

    /**
     * Return an array of users from audiences and subaudiences
     *
     * @param $exerciseId
     * @return array
     */
    private function getAllPlayersFromExercise($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $audiences = $em->getRepository('App:Audience')->findBy(['audience_exercise' => $exercise]);
        /* @var $audiences Audience[] */

        $users = [];
        foreach ($audiences as $audience) {
            foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                foreach ($subaudience->getSubaudienceUsers() as $user) {
                    $user->setUserSubaudience($subaudience->getSubaudienceName());

                    // Check if user is already picked
                    $isUserAlreadyPicked = false;
                    foreach ($users as $tmpUser) {
                        if ($user->getUserId() === $tmpUser->getUserId()) {
                            $isUserAlreadyPicked = true;
                            break;
                        }
                    }
                    if (!$isUserAlreadyPicked) {
                        $users[] = $user;
                    }
                }
            }
        }

        return $users;
    }

    /**
     * Returns the number of organizations for an exercise
     *
     * @param $exerciseId
     * @return int
     */
    private function getOrganizationsCount($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();

        $users = $this->getAllPlayersFromExercise($exerciseId);
        $organizations = [];

        foreach ($users as $user) {
            $organizations[$user->getUserOrganization()->getOrganizationId()] = 'found';
        }

        return count($organizations);
    }

    /**
     * Returns the frequency of injects for an exercise
     *
     * @param $exerciseId
     * @return float
     */
    private function getInjectsFrequency($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $exerciseBoundaries = $this->getExerciseDateTimeBoundaries($exerciseId);
        $durationInHours = $exerciseBoundaries['duration'];

        if (!$durationInHours) {
            return number_format(0, 2);
        }

        return number_format($this->getAllInjectsCount($exerciseId) / $durationInHours, 2);
    }

    /**
     * Return the datatime boundaries of an exercise and its duration (in hours)
     * from min(first inject, exercise start) to max(last inject, exercise end)
     *
     * @param $exerciseId
     * return array
     */
    private function getExerciseDateTimeBoundaries($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        // Force compute exercise dates
        $allInjects = $this->getAllInjects($exerciseId);
        $exercise->computeStartEndDates($allInjects);

        $startDateExercise = new DateTime($exercise->getExerciseStartDate()->format('Y-m-d H:i:s'));
        $endDateExercise = new DateTime($exercise->getExerciseEndDate()->format('Y-m-d H:i:s'));

        $diff = $startDateExercise->diff($endDateExercise);
        $durationInHours = $diff->h + ($diff->days * 24);

        return [
            'start' => $startDateExercise,
            'end' => $endDateExercise,
            'duration' => $durationInHours
        ];
    }

    /**
     * Return an array of all injects from an exercise
     *
     * @param $exerciseId
     * @return array
     */
    private function getAllInjects($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $allInjects = array();

        $events = $em->getRepository('App:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */
        foreach ($events as $event) {
            $incidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */
            foreach ($incidents as $incident) {
                $injects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $incident, 'inject_enabled' => true]);
                foreach ($injects as &$inject) {
                    $inject->setInjectEvent($event->getEventId());
                }
                $allInjects = array_merge($allInjects, $injects);
            }
        }

        return $allInjects;
    }

    /**
     * Return the number of injects per person for an exercise
     *
     * @param $exerciseId
     * @return json for chartJS
     */
    private function getInjectsCountsPerPlayer($exerciseId)
    {
        $injectsCountsPerUser = [];

        // Prepare injects count array with all users
        $allUsers = $this->getAllPlayersFromExercise($exerciseId);
        foreach ($allUsers as $user) {
            $injectsCountsPerUser[$user->getUserId()] = [
                'name' => $user->getUserFirstname() . ' ' . $user->getUserLastname(),
                'injectCount' => 0
            ];
        }

        // Count injects per user
        $allInjects = $this->getAllInjects($exerciseId);
        foreach ($allInjects as $inject) {

            // Users for this inject, to remove duplicates
            $usersForThisInject = [];

            if ($inject->getInjectAllAudiences()) {
                foreach ($inject->getInjectAudiences() as $audience) {
                    foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                        foreach ($subaudience->getSubaudienceUsers() as $user) {
                            $usersForThisInject[$user->getUserId()] = $user->getUserId();
                        }
                    }
                }
            } else {
                $audiences = array();
                foreach ($inject->getInjectAudiences() as $audience) {
                    $audiences[] = $audience->getAudienceId();
                    foreach ($audience->getAudienceSubaudiences() as $subaudience) {
                        foreach ($subaudience->getSubaudienceUsers() as $user) {
                            $usersForThisInject[$user->getUserId()] = $user->getUserId();
                        }
                    }
                }
                foreach ($inject->getInjectSubaudiences() as $subaudience) {
                    if (!in_array($subaudience->getSubaudienceAudience()->getAudienceId(), $audiences)) {
                        foreach ($subaudience->getSubaudienceUsers() as $user) {
                            $usersForThisInject[$user->getUserId()] = $user->getUserId();
                        }
                    }
                }
            }

            // Counts per user
            foreach ($usersForThisInject as $userId) {
                $injectsCountsPerUser[$userId]['injectCount']++;
            }
        }

        // Format json for chartJS
        $output = array();
        foreach ($injectsCountsPerUser as $user) {
            $output['labels'][] = $user['name'];
            $output['datasets']['data'][] = $user['injectCount'];
        }

        return $output;
    }

    /**
     * Return the number of inject per person for an exercise
     * @param $exerciseId
     * @return json for chartJS
     */
    private function getInjectsCountsPerIncident($exerciseId)
    {
        $em = $this->getDoctrine()->getManager();
        $oExercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $oExercise Exercise */

        if (empty($oExercise)) {
            return $this->exerciseNotFound();
        }

        $oEvents = $em->getRepository('App:Event')->findBy(['event_exercise' => $oExercise]);
        /* @var $oEvents Event[] */

        $aIncident = array();
        foreach ($oEvents as $oEvent) {
            $oIncidents = $em->getRepository('App:Incident')->findBy(['incident_event' => $oEvent]);
            /* @var $oIncidents Incident[] */
            foreach ($oIncidents as $oIncident) {
                $incidentId = $oIncident->getIncidentId();
                $incidentName = $oEvent->getEventTitle() . ' - ' . $oIncident->getIncidentTitle();
                $oInjects = $em->getRepository('App:Inject')->findBy(['inject_incident' => $oIncident, 'inject_enabled' => true]);
                $aIncident[$incidentId] = [
                    'incidentName' => $incidentName,
                    'injectCount' => count($oInjects)
                ];
            }
        }

        //Format json for chartJS
        $output = array();
        foreach ($aIncident as $incident) {
            $output['labels'][] = $incident['incidentName'];
            $output['datasets']['data'][] = $incident['injectCount'];
        }

        return $output;
    }

    /**
     * Return the number of inject per interval for an exercise
     * @param $exerciseId
     * @return json for chartJS
     * @throws Exception
     */
    private function getInjectsCountsPerInterval($exerciseId, $interval)
    {
        $em = $this->getDoctrine()->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($exerciseId);
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $exerciseBoundaries = $this->getExerciseDateTimeBoundaries($exerciseId);
        $startDateExercise = $exerciseBoundaries['start'];
        $endDateExercise = $exerciseBoundaries['end'];
        $exerciseDurationInHours = $exerciseBoundaries['duration'];

        // Something went wrong while computing exercise duration -> force exercise duration
        if (!$exerciseDurationInHours) {
            $exerciseDurationInHours = 1;
        }

        // Compute default interval (in hours) from exercise total execution time
        if ($interval === 'null') {
            $interval = $this->getDefaultInteval($exerciseId, $interval);
        }

        $offsets = array();
        $offsetIndex = 0;
        while ($exerciseDurationInHours - $interval * $offsetIndex >= 0) {
            $offsets[] = $interval * $offsetIndex;
            $offsetIndex++;
        }

        //Format json for chartJS
        $output = [
            'labels' => [],
            'datasets' => [
                'data' => []
            ]
        ];

        for ($offsetIndex = 0; $offsetIndex < count($offsets); $offsetIndex++) {
            $isLastInterval = ($offsetIndex === (count($offsets) - 1));

            $startInject = clone $startDateExercise;
            $endInject = clone $startDateExercise;

            $startInject = $startInject->modify('+' . ($offsets[$offsetIndex] * 60) . ' minutes');
            $endInject = $endInject->modify('+' . (($offsets[$offsetIndex] + $interval) * 60) . ' minutes');

            if (!$isLastInterval) {
                $endInject = $endInject->modify('-1 second');
            }

            $incidentInjects = $em->getRepository('App:Inject')->createQueryBuilder('inject')
                ->innerJoin('inject.inject_incident', 'incident')
                ->innerJoin('incident.incident_event', 'event')
                ->andWhere('event.event_exercise = :exercise')
                ->andWhere('inject.inject_enabled = true')
                ->andWhere('inject.inject_date BETWEEN :start AND :end')
                ->setParameter('exercise', $exercise->getExerciseId())
                ->setParameter('start', $startInject)
                ->setParameter('end', $endInject)
                ->getQuery()
                ->getResult();

            $output['labels'][] = $offsets[$offsetIndex];
            $output['datasets']['data'][] = count($incidentInjects);
        }

        return $output;
    }

    /**
     * Return default interval for getInjectsCountsPerInterval
     *
     * @param $exerciseId
     * @param $interval
     *
     * @return float|int default interval value (in hours)
     */
    private function getDefaultInteval($exerciseId, $interval)
    {
        if ($interval === 'null') {
            $exerciseBoundaries = $this->getExerciseDateTimeBoundaries($exerciseId);
            $exerciseDurationInHours = $exerciseBoundaries['duration'];

            if ($exerciseDurationInHours > 0 && $exerciseDurationInHours <= 24) {
                // 30 minutes
                $interval = 0.5;
            } elseif ($exerciseDurationInHours > 24 && $exerciseDurationInHours <= 48) {
                // 1 heures
                $interval = 1;
            } elseif ($exerciseDurationInHours > 48 && $exerciseDurationInHours <= 96) {
                // 2 heures
                $interval = 2;
            } elseif ($exerciseDurationInHours > 96 && $exerciseDurationInHours <= 168) {
                // 6 heures
                $interval = 6;
            } elseif ($exerciseDurationInHours > 168 && $exerciseDurationInHours <= 336) {
                // 12 heures
                $interval = 12;
            } else {
                // 24 heures
                $interval = 24;
            }
        }

        return $interval;
    }

    private function intervalNull()
    {
        return View::create(['message' => 'No interval'], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
