<?php

namespace App\Controller\Exercise\ChangeDuration;

use App\Controller\Base\BaseController;
use DateTime;
use Doctrine\Persistence\ManagerRegistry;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use JetBrains\PhpStorm\Pure;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ChangeDurationController extends BaseController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine, TokenStorageInterface $tokenStorage)
    {
        $this->doctrine = $doctrine;
        parent::__construct($tokenStorage);
    }
    
    /**
     * @OA\Response(
     *    response=200,description="Change duration of the exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/api/exercises/{exercise_id}/injects/changeDuration")
     */
    public function changeDurationExerciseAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $repositoryInject = $em->getRepository('App:Inject');
        $repositoryExercise = $em->getRepository('App:Exercise');

        $exercise = $repositoryExercise->find($request->get('exercise_id'));
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $injectsWithNewDate = $this->getInjectsWithNewDate($request, $exercise);

        // Mise a jour des dates des injects
        foreach ($injectsWithNewDate as $injectWithNewDate) {
            $inject = $repositoryInject->findOneBy(['inject_id' => $injectWithNewDate['inject_id']]);
            if ($inject) {
                $inject->setInjectDate($injectWithNewDate['inject_new_date']);
                $em->persist($inject);
            }
        }

        // Calcul de la date de fin d'exercice
        $exercise->setExerciseEndDate($this->computeExerciseNewEndDateTime($request, $exercise));
        $em->persist($exercise);
        $em->flush();

        return [
            'success' => true
        ];
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    /**
     * Recupération des inject, avec nouvelle date d'execution
     *
     * @param Symfony\Component\HttpFoundation\Request $request
     * @param App\Entity\Exercise $exercise
     *
     * @return type
     */
    private function getInjectsWithNewDate($request, $exercise)
    {
        $injectsWithNewDate = array();

        // Initialise les creneaux d'ouverture
        $listeCreneaux = $this->initializeCreneaux($request, $exercise);

        // Recherche la liste des injects, avec decalage a effectuer
        $listeInjects = $this->getInjectDecalage($exercise, floatval($request->get('duration_desired')));

        foreach ($listeInjects as $inject) {
            // Recherche du creneau correspondant au decalage depuis le debut de l'exercice
            $injectNewDecalageExercise = $inject['inject_new_decalage_exercise'];

            foreach ($listeCreneaux as $creneau) {
                if (($injectNewDecalageExercise >= $creneau['start_decalage']) && ($injectNewDecalageExercise <= $creneau['end_decalage'])) {
                    // Si utilisation des heures creuses, et 1ere inject du creneau
                    if ($request->get('use_closing_hours') && !$creneau['nb_injects']) {
                        // Définition de l'heure de l'inject à l'heure de debut de journée ($creneau['start_decalage'])
                        $injectNewDecalageExercise = $creneau['start_decalage'];
                    }
                    $creneau['nb_injects']++;

                    $injectNewDatetime = clone $creneau['start_date'];
                    $injectNewDatetime->setTimestamp($creneau['start_date_timestamp'] + ($injectNewDecalageExercise - $creneau['start_decalage']));

                    $tabInject = [
                        'inject_id' => $inject['inject_id'],
                        'inject_incident_id' => $inject['inject_incident_id'],
                        'inject_incident_event_id' => $inject['inject_incident_event_id'],
                        'inject_title' => $inject['inject_title'],
                        'inject_new_date' => $injectNewDatetime
                    ];

                    $injectsWithNewDate[$inject['inject_id']] = $tabInject;
                    break;
                }
            }
        }

        return $injectsWithNewDate;
    }

    /**
     * Initialisation des creneaux
     *
     * @param Symfony\Component\HttpFoundation\Request $request
     * @param App\Entity\Exercise $exercise
     *
     * @return array liste des créneaux horaires
     */
    public function initializeCreneaux($request, $exercise)
    {
        $wantedDuration = floatval($request->get('duration_desired'));

        $firstInjectDateTime = $this->getFirstInjectDateTime($exercise);

        if ($request->get('continuous_day')) {
            $lastInjectDateTime = $this->getLastInjectDateTime($exercise);
            $lastInjectDateTime->modify('+' . $wantedDuration . ' hours');

            return [[
                'start_decalage' => 0,
                'end_decalage' => $lastInjectDateTime->getTimestamp() - $firstInjectDateTime->getTimestamp(),
                'start_date' => $firstInjectDateTime,
                'start_date_timestamp' => $firstInjectDateTime->getTimestamp(),
                'end_date_timestamp' => $lastInjectDateTime->getTimestamp(),
                'nb_injects' => 0
            ]];
        }

        $listeCreneaux = array();

        // Get working hours count by day
        $workingHoursByDay = $this->computeWorkingHoursCountByDay($request);
        if (!$workingHoursByDay) {
            return $listeCreneaux;
        }

        // Calcul du nombre de creneaux (~jours) necessaires au maximum
        // (sans prendre en compte l'option use_closing_hours)
        $nbCreneauxHoraire = ceil($wantedDuration / $workingHoursByDay);
        // Creation de la liste des creneaux horaires

        for ($i = 0; $i < $nbCreneauxHoraire; $i++) {
            $startDateCreneau = $this->getFirstInjectDateTime($exercise);
            $startDateCreneau->modify('+' . $i . ' days');

            $endDateCreneau = new DateTime($startDateCreneau->format('Y-m-d H:i:s'));
            $endDateCreneau->modify('+' . $workingHoursByDay . ' hours');

            // Recherche la durée couverte par le creneau
            $dureeCreneau = new DateTime();
            $dureeCreneau->setTimestamp($endDateCreneau->getTimestamp() - $startDateCreneau->getTimestamp());

            $listeCreneaux[] = [
                'start_decalage' => $dureeCreneau->getTimestamp() * $i,
                'end_decalage' => $dureeCreneau->getTimestamp() * ($i + 1),
                'start_date' => $startDateCreneau,
                'start_date_timestamp' => $startDateCreneau->getTimestamp(),
                'end_date_timestamp' => $endDateCreneau->getTimestamp(),
                'nb_injects' => 0
            ];
        }

        return $listeCreneaux;
    }

    /**
     * Get first inject datetime from exercise
     *
     * @param App\Entity\Exercise $exercise
     *
     * @return DateTime first inject datetime
     */
    private function getFirstInjectDateTime($exercise)
    {
        $em = $this->doctrine->getManager();
        $repositoryEvent = $em->getRepository('App:Event');
        $repositoryIncident = $em->getRepository('App:Incident');
        $repositoryInject = $em->getRepository('App:Inject');

        $firstInjectDateTime = null;

        $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
        foreach ($events as $event) {
            $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
            foreach ($incidents as $incident) {
                $injects = $repositoryInject->findBy(['inject_incident' => $incident], ['inject_date' => 'ASC']);
                foreach ($injects as $inject) {
                    if (!$firstInjectDateTime || $firstInjectDateTime->getTimestamp() > $inject->getInjectDate()->getTimestamp()) {
                        $firstInjectDateTime = $inject->getInjectDate();
                    }
                }
            }
        }

        return clone $firstInjectDateTime;
    }

    /**
     * Get last inject datetime from exercise
     *
     * @param App\Entity\Exercise $exercise
     *
     * @return DateTime last inject datetime
     */
    private function getLastInjectDateTime($exercise)
    {
        $em = $this->doctrine->getManager();
        $repositoryEvent = $em->getRepository('App:Event');
        $repositoryIncident = $em->getRepository('App:Incident');
        $repositoryInject = $em->getRepository('App:Inject');

        $lastInjectDateTime = null;

        $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
        foreach ($events as $event) {
            $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
            foreach ($incidents as $incident) {
                $injects = $repositoryInject->findBy(['inject_incident' => $incident], ['inject_date' => 'ASC']);
                foreach ($injects as $inject) {
                    if (!$lastInjectDateTime || $lastInjectDateTime->getTimestamp() < $inject->getInjectDate()->getTimestamp()) {
                        $lastInjectDateTime = $inject->getInjectDate();
                    }
                }
            }
        }

        return clone $lastInjectDateTime;
    }

    /**
     * Get working hours count by day
     *
     * @param Symfony\Component\HttpFoundation\Request $request
     *
     * @return float working hours count by day
     */
    private function computeWorkingHoursCountByDay($request)
    {
        return floatval($request->get('end_time_day')) - floatval($request->get('start_time_day'));
    }

    /**
     * Calcul du decalage de chaque inject
     *
     * @param App\Entity\Exercise $exercise
     * @param type $wantedDuration
     *
     * @return array liste d'injects avec décalage
     */
    private function getInjectDecalage($exercise, $wantedDuration)
    {
        $em = $this->doctrine->getManager();
        $repositoryEvent = $em->getRepository('App:Event');
        $repositoryIncident = $em->getRepository('App:Incident');
        $repositoryInject = $em->getRepository('App:Inject');

        $listeInjects = [];

        // Récupération des dates de premier et dernier inject avant modification
        $firstInjectDateTime = $this->getFirstInjectDateTime($exercise);
        $lastInjectDateTime = $this->getLastInjectDateTime($exercise);

        // Calcul du ratio de modification
        $initialDuration = $this->getDurationInHours($firstInjectDateTime, $lastInjectDateTime);
        if (!$initialDuration) {
            return $listeInjects;
        }
        $ratio = $wantedDuration / $initialDuration;

        // Recherche des evenements
        $events = $repositoryEvent->findBy(['event_exercise' => $exercise]);
        foreach ($events as $event) {
            $incidents = $repositoryIncident->findBy(['incident_event' => $event]);
            foreach ($incidents as $incident) {
                $incidentInjects = $repositoryInject->findBy(['inject_incident' => $incident], ['inject_date' => 'ASC']);

                // Décalage total, depuis le début de l'exercice
                $totalDecalageInject = $firstInjectDateTime->getTimestamp();
                foreach ($incidentInjects as $inject) {
                    // Recupération du timestamp de l'inject
                    $injectTimestamp = $inject->getInjectDate()->getTimestamp();

                    // Calcul du decalage depuis le debut de l'exercice
                    $injectDecalageExercise = $injectTimestamp - $firstInjectDateTime->getTimestamp();
                    // Calcul du nouveau decalage (application du ratio)
                    $injectNewDecalageExercise = $injectDecalageExercise * $ratio;

                    // Calcul du décalage, depuis l'inject précédent (ou le début de l'exercice pour le 1er inject)
                    $injectDecalage = $injectTimestamp - $totalDecalageInject;
                    // Calcul du nouveau decalage
                    $injectNewDecalage = $injectDecalage * $ratio;
                    // Incrémentation
                    $totalDecalageInject += $injectDecalage;

                    $listeInjects[] = [
                        'inject_id' => $inject->getInjectId(),
                        'inject_incident_id' => $inject->getInjectIncident()->getIncidentId(),
                        'inject_incident_event_id' => $inject->getInjectIncident()->getIncidentEvent()->getEventId(),
                        'inject_title' => $inject->getInjectTitle(),
                        'inject_date' => $inject->getInjectDate(),
                        'inject_decalage' => $injectDecalage,
                        'inject_new_decalage' => $injectNewDecalage,
                        'inject_decalage_exercise' => $injectDecalageExercise,
                        'inject_new_decalage_exercise' => $injectNewDecalageExercise
                    ];
                }
            }
        }

        return $listeInjects;
    }

    /**
     * Get duration in hours
     *
     * @param type $startDatetime
     * @param type $endDatetime
     *
     * @return float duration in hours
     */
    private function getDurationInHours($startDatetime, $endDatetime)
    {
        $rawDiff = $endDatetime->diff($startDatetime);
        return ($rawDiff->days * 24) + $rawDiff->h;
    }

    /**
     * Compute exercise new end datetime
     *
     * @param Symfony\Component\HttpFoundation\Request $request
     * @param App\Entity\Exercise $exercise
     *
     * @return DateTime exercise new end datetime
     */
    private function computeExerciseNewEndDateTime($request, $exercise)
    {
        $exerciseNewDuration = $this->getExerciseWantedDuration($request);

        // Get last inject new datetime
        $exerciseNewEndDateTime = $this->getFirstInjectDateTime($exercise);
        $exerciseNewEndDateTime->modify('+' . $exerciseNewDuration . ' hours');

        return $exerciseNewEndDateTime;
    }

    /**
     * Get wanted exercise duration
     *
     * @param Symfony\Component\HttpFoundation\Request $request
     *
     * @return float wanted duration (in hours)
     */
    private function getExerciseWantedDuration($request)
    {
        return floatval($request->get('duration_desired'));
    }

    /**
     * @OA\Response(
     *    response=200,description="Change duration of the exercise")
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/exercises/{exercise_id}/injects/simulate/changeDuration")
     */
    public function simulateChangeDurationExerciseAction(Request $request)
    {
        $em = $this->doctrine->getManager();
        $exercise = $em->getRepository('App:Exercise')->find($request->get('exercise_id'));
        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        return $this->orderInjectsForDisplay(
            $request,
            $this->getInjectsWithNewDate($request, $exercise),
            $exercise
        );
    }

    /**
     * Sort injects for display
     *
     * @param App\Entity\Exercise $exercise
     * @param array $injects
     * @param Symfony\Component\HttpFoundation\Request $request
     *
     * @param array $injects
     */
    private function orderInjectsForDisplay($request, $injects, $exercise)
    {
        $em = $this->doctrine->getManager();
        $repositoryEvent = $em->getRepository('App:Event');
        $repositoryIncident = $em->getRepository('App:Incident');

        $exerciseNewEndDatetime = $this->getLastInjectDateTimeFromInjectsList($injects);
        $exerciseDuration = $this->getExerciseWantedDuration($request);

        $sortedInjects = array();
        foreach ($injects as $inject) {
            $event = $repositoryEvent->findOneBy(['event_id' => $inject['inject_incident_event_id']]);
            if ($event) {
                $incident = $repositoryIncident->findOneBy(['incident_id' => $inject['inject_incident_id']]);
                if ($incident) {
                    $sortedInjects[$inject['inject_id']] = [
                        'ts' => $inject['inject_new_date'],
                        'event' => $event->getEventTitle(),
                        'incident' => $incident->getIncidentTitle(),
                        'inject' => $inject['inject_title'],
                        'exercise_end_date' => $exerciseNewEndDatetime,
                        'exercise_duration' => $exerciseDuration
                    ];
                }
            }
        }

        return $sortedInjects;
    }

    /**
     * Get last inject datetime from injects list
     *
     * @param array injects
     *
     * @return DateTime
     */
    private function getLastInjectDateTimeFromInjectsList($injects)
    {
        $lastInjectDatetime = null;

        foreach ($injects as $inject) {
            if (!$lastInjectDatetime || $lastInjectDatetime->getTimestamp() < $inject['inject_new_date']->getTimestamp()) {
                $lastInjectDatetime = clone $inject['inject_new_date'];
            }
        }

        return $lastInjectDatetime;
    }
}
