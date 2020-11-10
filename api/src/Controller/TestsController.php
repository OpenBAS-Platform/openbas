<?php

namespace App\Controller;

use App\Controller\Base\BaseController;
use App\Entity\Audience;
use App\Entity\Event;
use App\Entity\Exercise;
use App\Entity\File;
use App\Entity\Grant;
use App\Entity\Group;
use App\Entity\Incident;
use App\Entity\IncidentType;
use App\Entity\Inject;
use App\Entity\InjectStatus;
use App\Entity\Objective;
use App\Entity\Organization;
use App\Entity\Outcome;
use App\Entity\Subaudience;
use App\Entity\Subobjective;
use App\Entity\User;
use DateTime;
use Exception;
use FOS\RestBundle\Controller\Annotations as Rest;
use OpenApi\Annotations as OA;
use stdClass;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class TestsController extends BaseController
{
    const CST_INCIDENT_TYPE_TECHNICAL = 'TECHNICAL';
    const CST_INCIDENT_TYPE_OPERATIONAL = 'OPERATIONAL';
    const CST_INCIDENT_TYPE_STRATEGIC = 'STRATEGIC';
    const CST_FILE = ['FILE_NAME' => 'Exercise Test default',
        'FILE_PATH' => 'default_exercise.png',
        'FILE_TYPE' => 'png'];
    const CST_EXERCISE = ['EXERCISE_NAME' => 'Test Exercise',
        'EXERCISE_SUBTITLE' => 'Test Exercise Subtitle',
        'EXERCISE_DESCRIPTION' => 'Test Exercise Description',
        'EXERCISE_MESSAGE_HEADER' => 'Test Exercise Message Header',
        'EXERCISE_MESSAGE_FOOTER' => 'Test Exercise Message Footer'];
    const CST_OBJECTIVES = [['OBJECTIVE_TITLE' => 'Test Objective 1',
        'OBJECTIVE_DESCRIPTION' => 'Test Objective description',
        'OBJECTIVE_PRIORITY' => 1,
        'SUBOBJECTIVES' => [
            ['SUBOBJECTIVE_TITLE' => 'subObjective 1.1', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 1.1', 'SUBOBJECTIVE_PRIORITY' => 1],
            ['SUBOBJECTIVE_TITLE' => 'subObjective 1.2', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 1.2', 'SUBOBJECTIVE_PRIORITY' => 2],
            ['SUBOBJECTIVE_TITLE' => 'subObjective 1.3', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 1.3', 'SUBOBJECTIVE_PRIORITY' => 3]
        ]],
        ['OBJECTIVE_TITLE' => 'Test Objective 2',
            'OBJECTIVE_DESCRIPTION' => 'Test Objective description',
            'OBJECTIVE_PRIORITY' => 2,
            'SUBOBJECTIVES' => [
                ['SUBOBJECTIVE_TITLE' => 'subObjective 2.1', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 2.1', 'SUBOBJECTIVE_PRIORITY' => 1],
                ['SUBOBJECTIVE_TITLE' => 'subObjective 2.2', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 2.2', 'SUBOBJECTIVE_PRIORITY' => 2],
                ['SUBOBJECTIVE_TITLE' => 'subObjective 2.3', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 2.3', 'SUBOBJECTIVE_PRIORITY' => 3]
            ]],
        ['OBJECTIVE_TITLE' => 'Test Objective 3',
            'OBJECTIVE_DESCRIPTION' => 'Test Objective description',
            'OBJECTIVE_PRIORITY' => 3,
            'SUBOBJECTIVES' => [
                ['SUBOBJECTIVE_TITLE' => 'subObjective 3.1', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 3.1', 'SUBOBJECTIVE_PRIORITY' => 1],
                ['SUBOBJECTIVE_TITLE' => 'subObjective 3.2', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 3.2', 'SUBOBJECTIVE_PRIORITY' => 2],
                ['SUBOBJECTIVE_TITLE' => 'subObjective 3.3', 'SUBOBJECTIVE_DESCRIPTION' => 'subObjective desc 3.3', 'SUBOBJECTIVE_PRIORITY' => 3]
            ]]];
    const CST_EVENTS = [
        ['EVENT_TITLE' => 'Test Event 1',
            'EVENT_DESCRIPTION' => 'Test Event Description 1',
            'EVENT_ORDER' => 1,
            'INCIDENTS' => [
                ['INCIDENT_TITLE' => 'Incident 1 test Event 1',
                    'INCIDENT_STORY' => 'Incident desc 1 test Event 1',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_OPERATIONAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 1 Event 1', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+3 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 1 Event 1', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+3 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 1 Event 1', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+3 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 2 test Event 1',
                    'INCIDENT_STORY' => 'Incident desc 2 test Event 1',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_STRATEGIC,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 2 Event 1', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+4 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 2 Event 1', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+4 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 2 Event 1', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+4 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 3 test Event 1',
                    'INCIDENT_STORY' => 'Incident desc 3 test Event 1',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_TECHNICAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 3 Event 1', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+5 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 3 Event 1', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+5 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 3 Event 1', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+5 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ]
            ]
        ],
        ['EVENT_TITLE' => 'Test Event 2',
            'EVENT_DESCRIPTION' => 'Test Event Description 2',
            'EVENT_ORDER' => 2,
            'INCIDENTS' => [
                ['INCIDENT_TITLE' => 'Incident 1 test Event 2',
                    'INCIDENT_STORY' => 'Incident desc 1 test Event 2',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_OPERATIONAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 1 Event 2', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+6 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 1 Event 2', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+6 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 1 Event 2', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+6 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 2 test Event 2',
                    'INCIDENT_STORY' => 'Incident desc 2 test Event 2',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_STRATEGIC,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 2 Event 2', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+7 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 2 Event 2', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+7 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 2 Event 2', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+7 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 3 test Event 2',
                    'INCIDENT_STORY' => 'Incident desc 3 test Event 2',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_TECHNICAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 3 Event 2', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+8 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 3 Event 2', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+8 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 3 Event 2', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+8 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ]
            ]
        ],
        ['EVENT_TITLE' => 'Test Event 3',
            'EVENT_DESCRIPTION' => 'Test Event Description 3',
            'EVENT_ORDER' => 3,
            'INCIDENTS' => [
                ['INCIDENT_TITLE' => 'Incident 1 test Event 3',
                    'INCIDENT_STORY' => 'Incident desc 1 test Event 3',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_OPERATIONAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 1 Event 3', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+9 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 1 Event 3', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+9 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 1 Event 3', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+9 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 2 test Event 3',
                    'INCIDENT_STORY' => 'Incident desc 2 test Event 3',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_STRATEGIC,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 2 Event 3', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+10 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 2 Event 3', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+10 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 2 Event 3', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+10 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 3 test Event 3',
                    'INCIDENT_STORY' => 'Incident desc 3 test Event 3',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_TECHNICAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 3 Event 3', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+11 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 3 Event 3', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+11 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 3 Event 3', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+11 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ]
            ]
        ],
        ['EVENT_TITLE' => 'Test Event 4',
            'EVENT_DESCRIPTION' => 'Test Event Description 4',
            'EVENT_ORDER' => 4,
            'INCIDENTS' => [
                ['INCIDENT_TITLE' => 'Incident 1 test Event 4',
                    'INCIDENT_STORY' => 'Incident desc 1 test Event 4',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_OPERATIONAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 1 Event 4', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+12 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 1 Event 4', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+12 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 1 Event 4', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+12 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 2 test Event 4',
                    'INCIDENT_STORY' => 'Incident desc 2 test Event 4',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_STRATEGIC,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 2 Event 4', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+13 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 2 Event 4', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+13 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 2 Event 4', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+13 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 3 test Event 4',
                    'INCIDENT_STORY' => 'Incident desc 3 test Event 4',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_TECHNICAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 3 Event 4', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+14 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 3 Event 4', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+14 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 3 Event 4', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+14 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ]
            ]
        ],
        ['EVENT_TITLE' => 'Test Event 5',
            'EVENT_DESCRIPTION' => 'Test Event Description 5',
            'EVENT_ORDER' => 5,
            'INCIDENTS' => [
                ['INCIDENT_TITLE' => 'Incident 1 test Event 5',
                    'INCIDENT_STORY' => 'Incident desc 1 test Event 5',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_OPERATIONAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 1 Event 5', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+15 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 1 Event 5', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+15 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 1 Event 5', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 1 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+15 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 2 test Event 5',
                    'INCIDENT_STORY' => 'Incident desc 2 test Event 5',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_STRATEGIC,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 2 Event 5', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+16 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 2 Event 5', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+16 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 2 Event 5', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 2 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+16 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ],
                ['INCIDENT_TITLE' => 'Incident 3 test Event 5',
                    'INCIDENT_STORY' => 'Incident desc 3 test Event 5',
                    'INCIDENT_TYPE' => self::CST_INCIDENT_TYPE_TECHNICAL,
                    'INCIDENT_WEIGHT' => 0,
                    'INCIDENT_INJETCS' => [
                        ['INJECT_TITLE' => 'Inject 1 Incident 3 Event 5', 'INJECT_DESCRIPTION' => 'Inject 1 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+17 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 1 Audience 1', 'Test SubAudience 1 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 2 Incident 3 Event 5', 'INJECT_DESCRIPTION' => 'Inject 2 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+17 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 2 Audience 1', 'Test SubAudience 2 Audience 2']],
                        ['INJECT_TITLE' => 'Inject 3 Incident 3 Event 5', 'INJECT_DESCRIPTION' => 'Inject 3 Incident 3 desc', 'INJECT_CONTENT' => '', 'INJECT_DATE_DECALAGE' => '+17 minutes', 'INJECT_TYPE' => 'openex_email', 'INJECT_SUBAUDIENCES' => ['Test SubAudience 3 Audience 1', 'Test SubAudience 3 Audience 2']]
                    ]
                ]
            ]
        ]
    ];
    const CST_AUDIENCES = [['AUDIENCE_NAME' => 'Test Audience 1',
        'SUB_AUDIENCES' => [['SUB_AUDIENCE_NAME' => 'Test SubAudience 1 Audience 1',
            'SUB_AUDIENCE_USERS' => [
                ['USER_LOGIN' => 'user1@tests.com', 'USER_PASSWORD' => 'pass1', 'USER_FIRSTNAME' => 'first1', 'USER_LASTNAME' => 'last1', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                ['USER_LOGIN' => 'user2@tests.com', 'USER_PASSWORD' => 'pass2', 'USER_FIRSTNAME' => 'first2', 'USER_LASTNAME' => 'last2', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                ['USER_LOGIN' => 'user3@tests.com', 'USER_PASSWORD' => 'pass3', 'USER_FIRSTNAME' => 'first3', 'USER_LASTNAME' => 'last3', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
            ]
        ],
            ['SUB_AUDIENCE_NAME' => 'Test SubAudience 2 Audience 1',
                'SUB_AUDIENCE_USERS' => [
                    ['USER_LOGIN' => 'user4@tests.com', 'USER_PASSWORD' => 'pass4', 'USER_FIRSTNAME' => 'first4', 'USER_LASTNAME' => 'last4', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                    ['USER_LOGIN' => 'user5@tests.com', 'USER_PASSWORD' => 'pass5', 'USER_FIRSTNAME' => 'first5', 'USER_LASTNAME' => 'last5', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                    ['USER_LOGIN' => 'user6@tests.com', 'USER_PASSWORD' => 'pass6', 'USER_FIRSTNAME' => 'first6', 'USER_LASTNAME' => 'last6', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                ]
            ],
            ['SUB_AUDIENCE_NAME' => 'Test SubAudience 3 Audience 1',
                'SUB_AUDIENCE_USERS' => [
                    ['USER_LOGIN' => 'user7@tests.com', 'USER_PASSWORD' => 'pass7', 'USER_FIRSTNAME' => 'first7', 'USER_LASTNAME' => 'last7', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                    ['USER_LOGIN' => 'user8@tests.com', 'USER_PASSWORD' => 'pass8', 'USER_FIRSTNAME' => 'first8', 'USER_LASTNAME' => 'last8', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                    ['USER_LOGIN' => 'user9@tests.com', 'USER_PASSWORD' => 'pass9', 'USER_FIRSTNAME' => 'first9', 'USER_LASTNAME' => 'last9', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                ]
            ]]
    ],
        ['AUDIENCE_NAME' => 'Test Audience 2',
            'SUB_AUDIENCES' => [['SUB_AUDIENCE_NAME' => 'Test SubAudience 1 Audience 2',
                'SUB_AUDIENCE_USERS' => [
                    ['USER_LOGIN' => 'user10@tests.com', 'USER_PASSWORD' => 'pass10', 'USER_FIRSTNAME' => 'first10', 'USER_LASTNAME' => 'last10', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                    ['USER_LOGIN' => 'user11@tests.com', 'USER_PASSWORD' => 'pass11', 'USER_FIRSTNAME' => 'first11', 'USER_LASTNAME' => 'last11', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                    ['USER_LOGIN' => 'user12@tests.com', 'USER_PASSWORD' => 'pass12', 'USER_FIRSTNAME' => 'first12', 'USER_LASTNAME' => 'last12', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                ]
            ],
                ['SUB_AUDIENCE_NAME' => 'Test SubAudience 2 Audience 2',
                    'SUB_AUDIENCE_USERS' => [
                        ['USER_LOGIN' => 'user13@tests.com', 'USER_PASSWORD' => 'pass13', 'USER_FIRSTNAME' => 'first13', 'USER_LASTNAME' => 'last13', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                        ['USER_LOGIN' => 'user14@tests.com', 'USER_PASSWORD' => 'pass14', 'USER_FIRSTNAME' => 'first14', 'USER_LASTNAME' => 'last14', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                        ['USER_LOGIN' => 'user15@tests.com', 'USER_PASSWORD' => 'pass15', 'USER_FIRSTNAME' => 'first15', 'USER_LASTNAME' => 'last15', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                    ]
                ],
                ['SUB_AUDIENCE_NAME' => 'Test SubAudience 3 Audience 2',
                    'SUB_AUDIENCE_USERS' => [
                        ['USER_LOGIN' => 'user16@tests.com', 'USER_PASSWORD' => 'pass16', 'USER_FIRSTNAME' => 'first16', 'USER_LASTNAME' => 'last16', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                        ['USER_LOGIN' => 'user17@tests.com', 'USER_PASSWORD' => 'pass17', 'USER_FIRSTNAME' => 'first17', 'USER_LASTNAME' => 'last17', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                        ['USER_LOGIN' => 'user18@tests.com', 'USER_PASSWORD' => 'pass18', 'USER_FIRSTNAME' => 'first18', 'USER_LASTNAME' => 'last18', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                    ]
                ],
                ['SUB_AUDIENCE_NAME' => 'Test SubAudience 4 Audience 2',
                    'SUB_AUDIENCE_USERS' => [
                        ['USER_LOGIN' => 'user19@tests.com', 'USER_PASSWORD' => 'pass19', 'USER_FIRSTNAME' => 'first19', 'USER_LASTNAME' => 'last19', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest1'],
                        ['USER_LOGIN' => 'user20@tests.com', 'USER_PASSWORD' => 'pass20', 'USER_FIRSTNAME' => 'first20', 'USER_LASTNAME' => 'last20', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest2'],
                        ['USER_LOGIN' => 'user21@tests.com', 'USER_PASSWORD' => 'pass21', 'USER_FIRSTNAME' => 'first21', 'USER_LASTNAME' => 'last21', 'USER_ADMIN' => true, 'USER_ORGANIZATION' => 'organizationTest3']
                    ]
                ]
            ]
        ]];
    private $em;
    private $user;
    private $mail_test;
    private $typeTechnical;
    private $typeOperational;
    private $typeStrategic;

    /**
     * @OA\Property(
     *    description="Delete tests Users",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Get("/tests/delete/users")
     */
    public function deleteTestsUsersAction(Request $request)
    {
        try {
            $this->em = $this->getDoctrine()->getManager();

            foreach (self::CST_AUDIENCES as $audience) {
                foreach ($audience['SUB_AUDIENCES'] as $subAudience) {
                    foreach ($subAudience['SUB_AUDIENCE_USERS'] as $user_data) {
                        $user = $this->em->getRepository('App:User')->findOneBy(array('user_firstname' => $user_data['USER_FIRSTNAME'], 'user_lastname' => $user_data['USER_LASTNAME']));
                        if ($user) {
                            $this->em->remove($user);
                        }
                    }
                }
            }
            $this->em->flush();
            return $this->returnSuccess();
        } catch (Exception $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la suppression des comptes utilisateur de test');
        }
    }

    /**
     * return Success
     * @param type $object
     * @return stdClass
     */
    private function returnSuccess($exercise_id = null)
    {
        $returnObject = ['success' => true, 'exercise_id' => $exercise_id];
        return $returnObject;
    }

    /**
     * Return Exception
     * @param Exception $ex
     * @param type $errorMessage
     * @return stdClass
     */
    private function returnException(Exception $ex, $errorMessage = null)
    {
        if ($errorMessage !== null) {
            $returnObject = ['success' => false, 'errorMessage' => $errorMessage, 'errorDetailMessage' => $ex->getMessage()];
        } else {
            $returnObject = ['success' => false, 'errorMessage' => $ex->getMessage(), 'errorDetailMessage' => $ex->getMessage()];
            $returnObject->errorMessage = $ex->getMessage();
        }
        return $returnObject;
    }

    /**
     * @OA\Property(
     *    description="Create an exercise test",
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_OK)
     * @Rest\Post("/tests/create/exercise")
     */
    public function createTestsExerciseAction(Request $request)
    {
        try {
            $this->em = $this->getDoctrine()->getManager();
            $this->user = $this->get('security.token_storage')->getToken()->getUser();
            $this->mail_test = 'admin@openex.io';

            $this->typeTechnical = $this->createIncidentType('TECHNICAL');
            $this->typeOperational = $this->createIncidentType('OPERATIONAL');
            $this->typeStrategic = $this->createIncidentType('STRATEGIC');

            //Create FileExercise
            $file = $this->createFile();

            //Create Exercise
            $exercise = $this->createExercise($file);

            //Create Group
            $group = $this->createGroup('PLANNER Group ' . self::CST_EXERCISE['EXERCISE_NAME']);

            //Creaate Grant
            $this->createGrant('PLANNER', $group, $exercise);

            //Create Audience, subAudience and User
            $this->createAudiences($exercise, $group);

            //Create Objectives
            $this->createObjectives($exercise);

            //Create Events
            $this->createEvents($exercise);

            return $this->returnSuccess($exercise->getExerciseId());
        } catch (Exception $ex) {
            return $this->returnException($ex, 'Une erreur est survenue lors de la création de l\'exercice de test');
        }
    }

    /**
     * Create Or Get IncidentType
     * @param type $name
     * @return IncidentType
     */
    private function createIncidentType($name)
    {
        $type = $this->em->getRepository('App:IncidentType')->findOneBy(array('type_name' => $name));
        if (!$type) {
            $type = new IncidentType();
            $type->setTypeName($name);
            $this->em->persist($type);
            $this->em->flush();
        }
        return $type;
    }

    /**
     * Create File
     * @param type $name
     * @param type $path
     * @param type $type
     * @return File
     */
    private function createFile()
    {
        $file = new File();
        $file->setFileName(self::CST_FILE['FILE_NAME']);
        $file->setFileTYpe(self::CST_FILE['FILE_TYPE']);
        $file->setFilePath(self::CST_FILE['FILE_PATH']);
        $this->em->persist($file);
        $this->em->flush();
        return $file;
    }

    /**
     * Create Exercise
     * @param type $file
     * @return Exercise
     */
    private function createExercise($file)
    {
        $exercise = $this->em->getRepository('App:Exercise')->findOneBy(array('exercise_name' => self::CST_EXERCISE['EXERCISE_NAME']));
        if (!$exercise) {
            $exercise = new Exercise();
            $exercise->setExerciseCanceled(false);
            $exercise->setExerciseName(self::CST_EXERCISE['EXERCISE_NAME']);
            $exercise->setExerciseSubtitle(self::CST_EXERCISE['EXERCISE_SUBTITLE']);
            $exercise->setExerciseDescription(self::CST_EXERCISE['EXERCISE_DESCRIPTION']);
            $exercise->setExerciseStartDate(new DateTime());
            $exercise->setExerciseEndDate(new DateTime('+2 day'));
            $exercise->setExerciseOwner($this->user);
            $exercise->setExerciseImage($file);
            $exercise->setExerciseMailExpediteur($this->mail_test);
            $exercise->setExerciseMessageHeader(self::CST_EXERCISE['EXERCISE_MESSAGE_HEADER']);
            $exercise->setExerciseMessageFooter(self::CST_EXERCISE['EXERCISE_MESSAGE_FOOTER']);
            $this->em->persist($exercise);
            $this->em->flush();
        }
        return $exercise;
    }

    /**
     * Create Group
     * @param type $group_name
     * @return Group
     */
    private function createGroup($group_name)
    {
        $Group = $this->em->getRepository('App:Group')->findOneBy(array('group_name' => $group_name));
        if (!$Group) {
            $Group = new Group();
            $Group->setGroupName($group_name);
            $this->em->persist($Group);
            $this->em->flush($Group);
        }
        return $Group;
    }

    /**
     * Create Grant
     * @param type $name
     * @param type $group
     * @param type $exercise
     * @return Grant
     */
    private function createGrant($name, $group, $exercise)
    {
        $grant = $this->em->getRepository('App:Grant')->findOneBy(array('grant_group' => $group, 'grant_exercise' => $exercise));
        if (!$grant) {
            $grant = new Grant();
            $grant->setGrantName($name);
            $grant->setGrantGroup($group);
            $grant->setGrantExercise($exercise);
            $this->em->persist($grant);
            $this->em->flush();
        }
        return $grant;
    }

    /**
     * Create Audience
     * @param type $exercise
     */
    private function createAudiences($exercise, $group)
    {
        foreach (self::CST_AUDIENCES as $audience_data) {
            $audience = $this->em->getRepository('App:Audience')->findOneBy(array('audience_name' => $audience_data['AUDIENCE_NAME'], 'audience_exercise' => $exercise));
            if (!$audience) {
                $audience = new Audience();
                $audience->setAudienceEnabled(true);
                $audience->setAudienceExercise($exercise);
                $audience->setAudienceName($audience_data['AUDIENCE_NAME']);
                $this->em->persist($audience);
                $this->em->flush($audience);
            }
            foreach ($audience_data['SUB_AUDIENCES'] as $subAudience_data) {
                $this->createSubAudience($subAudience_data, $audience, $exercise, $group);
            }
        }
    }

    /**
     * Create Sub Audience
     * @param type $subAudience_data
     * @param type $audience
     * @param type $exercise
     */
    private function createSubAudience($subAudience_data, $audience, $exercise, $group)
    {
        $subAudience = $this->em->getRepository('App:Subaudience')->findOneBy(array('subaudience_name' => $subAudience_data['SUB_AUDIENCE_NAME'], 'subaudience_audience' => $audience));
        if (!$subAudience) {
            $subAudience = new Subaudience();
            $subAudience->setSubaudienceAudience($audience);
            $subAudience->setSubaudienceExercise($exercise);
            $subAudience->setSubaudienceName($subAudience_data['SUB_AUDIENCE_NAME']);
            $subAudience->setSubaudienceEnabled(true);
            $this->em->persist($subAudience);
            $this->em->flush($subAudience);
        }

        foreach ($subAudience_data['SUB_AUDIENCE_USERS'] as $subAudienceUser) {
            $user = $this->createUser($subAudienceUser);
            $subAudience->addSubaudienceUser($user);
            $this->em->persist($subAudience);
            $this->em->flush($subAudience);
            $this->joinGroup($user, $group);
        }
    }

    /**
     * Create User
     * @param type $user_data
     * @return User
     */
    private function createUser($user_data)
    {
        $user = $this->em->getRepository('App:User')->findOneBy(array('user_login' => $user_data['USER_LOGIN']));
        if (!$user) {
            $user = new User();
            $user->setUserLogin($user_data['USER_LOGIN']);
            $user->setUserFirstname($user_data['USER_FIRSTNAME']);
            $user->setUserLastname($user_data['USER_LASTNAME']);
            $user->setUserEmail($user_data['USER_LOGIN']);
            //$user->setUserEmail($this->mail_test);
            $user->setUserAdmin($user_data['USER_ADMIN']);
            $user->setUserStatus(1);
            $user->setUserLang('auto');
            $user->setUserOrganization($this->createOrganization($user_data['USER_ORGANIZATION']));
            $encoder = $this->get('security.password_encoder');
            $encoded = $encoder->encodePassword($user, $user_data['USER_PASSWORD']);
            $user->setUserPassword($encoded);
            $this->em->persist($user);
            $this->em->flush();
        }
        return $user;
    }

    /**
     * Create Organization
     * @param type $organization_name
     * @return Organization
     */
    private function createOrganization($organization_name)
    {
        $organization = $this->em->getRepository('App:Organization')->findOneBy(array('organization_name' => $organization_name));
        if (!$organization) {
            $organization = new Organization();
            $organization->setOrganizationName($organization_name);
            $this->em->persist($organization);
            $this->em->flush($organization);
        }
        return $organization;
    }

    /**
     * Join group
     * @param type $user
     * @param type $group
     */
    private function joinGroup($user, $group)
    {
        $listUsers = $group->getGroupUsers();
        $exist = false;
        foreach ($listUsers as $listUser) {
            if ($listUser->getUserId() == $user->getUserId()) {
                $exist = true;
            }
        }
        if ($exist == false) {
            $users[] = $user;
            $group->setGroupUsers($users);
            $this->em->persist($group);
            $this->em->flush();
        }
    }

    /**
     * Create objective
     * @param type $exercise
     */
    private function createObjectives($exercise)
    {
        foreach (self::CST_OBJECTIVES as $objective_data) {
            $objective = $this->em->getRepository('App:Objective')->findOneBy(array('objective_title' => $objective_data['OBJECTIVE_TITLE'], 'objective_exercise' => $exercise));
            if (!$objective) {
                $objective = new Objective();
                $objective->setObjectiveTitle($objective_data['OBJECTIVE_TITLE']);
                $objective->setObjectiveDescription($objective_data['OBJECTIVE_DESCRIPTION']);
                $objective->setObjectivePriority($objective_data['OBJECTIVE_PRIORITY']);
                $objective->setObjectiveExercise($exercise);
                $this->em->persist($objective);
                $this->em->flush($objective);
            }
            foreach ($objective_data['SUBOBJECTIVES'] as $subObjective_data) {
                $this->createSubObjective($subObjective_data, $objective, $exercise);
            }
        }
    }

    /**
     * Create SubObjective
     * @param type $subObjective_data
     * @param type $objective
     * @param type $exercise
     */
    private function createSubObjective($subObjective_data, $objective, $exercise)
    {
        $subObjective = $this->em->getRepository('App:Subobjective')->findOneBy(array('subobjective_title' => $subObjective_data['SUBOBJECTIVE_TITLE'], 'subobjective_objective' => $objective));
        if (!$subObjective) {
            $subObjective = new Subobjective();
            $subObjective->setSubobjectiveTitle($subObjective_data['SUBOBJECTIVE_TITLE']);
            $subObjective->setSubobjectiveDescription($subObjective_data['SUBOBJECTIVE_DESCRIPTION']);
            $subObjective->setSubobjectivePriority($subObjective_data['SUBOBJECTIVE_PRIORITY']);
            $subObjective->setSubobjectiveObjective($objective);
            $subObjective->setSubobjectiveExercise($exercise);
            $this->em->persist($subObjective);
            $this->em->flush($subObjective);
        }
    }

    /**
     *
     * @param type $exercise
     */
    private function createEvents($exercise)
    {
        foreach (self::CST_EVENTS as $event_data) {
            $event = $this->em->getRepository('App:Event')->findOneBy(array('event_title' => $event_data['EVENT_TITLE'], 'event_exercise' => $exercise));
            if (!$event) {
                $event = new Event();
                $event->setEventExercise($exercise);
                $event->setEventTitle($event_data['EVENT_TITLE']);
                $event->setEventDescription($event_data['EVENT_DESCRIPTION']);
                $event->setEventOrder($event_data['EVENT_ORDER']);
                $this->em->persist($event);
                $this->em->flush($event);
            }
            foreach ($event_data['INCIDENTS'] as $incident_data) {
                $this->createIncident($incident_data, $event);
            }
        }
    }

    /**
     * Create Incident
     * @param type $incident_data
     * @param type $event
     * @return Incident
     */
    private function createIncident($incident_data, $event)
    {
        $incident = $this->em->getRepository('App:Incident')->findOneBy(array('incident_event' => $event, 'incident_title' => $incident_data['INCIDENT_TITLE']));
        if (!$incident) {
            $incident = new Incident();
            $incident->setIncidentTitle($incident_data['INCIDENT_TITLE']);
            $incident->setIncidentStory($incident_data['INCIDENT_STORY']);
            switch ($incident_data['INCIDENT_TYPE']) {
                case self::CST_INCIDENT_TYPE_OPERATIONAL:
                    $incident->setIncidentType($this->typeOperational);
                    break;
                case self::CST_INCIDENT_TYPE_STRATEGIC:
                    $incident->setIncidentType($this->typeStrategic);
                    break;
                case self::CST_INCIDENT_TYPE_TECHNICAL:
                    $incident->setIncidentType($this->typeTechnical);
                    break;
            }
            $incident->setIncidentEvent($event);
            $incident->setIncidentWeight($incident_data['INCIDENT_WEIGHT']);
            $this->em->persist($incident);
            $this->em->flush();
        }
        $this->createOutcome($incident);
        foreach ($incident_data['INCIDENT_INJETCS'] as $inject_data) {
            $this->createInject($inject_data, $incident);
        }
        return $incident;
    }

    /**
     * Create OUtcome
     * @param type $incident
     * @return Outcome
     */
    private function createOutcome($incident)
    {
        $outcome = $this->em->getRepository('App:Outcome')->findOneBy(array('outcome_incident' => $incident));
        if (!$outcome) {
            $outcome = new Outcome();
            $outcome->setOutcomeIncident($incident);
            $outcome->setOutComeResult(0);
            $this->em->persist($outcome);
            $this->em->flush();
        }
        return $outcome;
    }

    /**
     *
     * @param type $inject_data
     * @param type $incident
     */
    private function createInject($inject_data, $incident)
    {
        $injectContent = array('sender' => 'no-reply@openex.io', 'subject' => $inject_data['INJECT_TITLE'], 'body' => 'message for {{NOM}} {{PRENOM}} {{ORGANISATION}}', 'encrypted' => false);
        $inject = $this->em->getRepository('App:Inject')->findOneBy(array('inject_title' => $inject_data['INJECT_TITLE'], 'inject_incident' => $incident));
        if (!$inject) {
            $inject = new Inject();
            $inject->setInjectTitle($inject_data['INJECT_TITLE']);
            $inject->setInjectDescription($inject_data['INJECT_DESCRIPTION']);
            $inject->setInjectContent(json_encode($injectContent));
            $inject->setInjectDate(new DateTime($inject_data['INJECT_DATE_DECALAGE']));
            $inject->setInjectType($inject_data['INJECT_TYPE']);
            $inject->setInjectIncident($incident);
            $inject->setInjectUser($this->user);
            $inject->setInjectEnabled(true);
            $this->em->persist($inject);
            $this->em->flush();
            foreach ($inject_data['INJECT_SUBAUDIENCES'] as $subAudienceName) {
                $subAudience = $this->em->getRepository('App:Subaudience')->findOneBy(array('subaudience_name' => $subAudienceName));
                if ($subAudience) {
                    $inject->addInjectSubaudience($subAudience);
                    $this->em->persist($inject);
                    $this->em->flush();
                }
            }
        }
        $this->createInjectStatus($inject);
    }

    /**
     *
     * @param type $inject
     * @return \App\Controller\InjectStatus
     */
    private function createInjectStatus($inject)
    {
        $status = $this->em->getRepository('App:InjectStatus')->findOneBy(array('status_inject' => $inject));
        if (!$status) {
            $status = new InjectStatus();
            $status->setStatusInject($inject);
            $this->em->persist($status);
            $this->em->flush();
        }
        return $status;
    }
}
