import { toPng } from 'html-to-image';
// @ts-ignore
import pdfMake from 'pdfmake';
import type { InjectResultDTO, Report } from '../../../../../utils/api-types';
import convertMarkdownToPdfMake from './convertMarkdownToPdfMake';
import { ExerciseReportData } from './useExerciseReportData';
import ReportInformationType from './ReportInformationType';

const getBase64ImageFromURL = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    const canvas = document.createElement('canvas');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

const tableCustomLayout = (displayColumnLine:boolean, paddingTop:number) => ({
  hLineWidth: () => 0.5,
  vLineWidth: (i:number, node: pdfMake.Content) => {
    if (displayColumnLine || (i === 0 || i === node.table.body.length + 1)) {
      return 0.5;
    }
    return 0;
  },
  hLineColor: () => '#aaa',
  vLineColor: () => '#aaa',
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => paddingTop,
  paddingBottom: () => paddingTop,
});

interface Props {
  report: Report,
  reportData: ExerciseReportData,
  displayModule: (moduleType: ReportInformationType)=>boolean,
  tPick: (input: Record<string, string> | undefined) => string;
  fldt: (input: string | undefined)=> string;
  t: (input: string | undefined)=> string;
}

const getExerciseReportPdfDocDefinition = async ({
  report,
  reportData,
  displayModule,
  tPick,
  fldt,
  t,
}: Props) => {
  // Fetch reports images
  const modulesImages = [
    'main_information',
    'score_details',
    'lessons_categories',
    'exercise_distribution_score_by_team',
    'exercise_distribution_score_over_time',
    'exercise_distribution_total_score_by_team',
    'exercise_distribution_score_over_time_by_team',
    'exercise_distribution_total_score_by_inject_type',
    'exercise_distribution_score_over_time_by_inject',
    'exercise_distribution_total_score_by_organization',
    'exercise_distribution_total_score_by_player',
    'exercise_distribution_total_score_by_inject',
  ];
  const fetchPromises = [getBase64ImageFromURL('http://localhost:3001/src/static/images/logo_text_light.png').then((img) => ({
    key: 'openBAS_logo',
    img,
  }))];
  modulesImages.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      fetchPromises.push(toPng(element, { backgroundColor: 'white' }).then((img: string) => ({ key: id, img })));
    }
  });
  (reportData.injects || []).forEach((inject) => {
    const element = document.getElementById(`inject_expectations_${inject.inject_id}`);
    if (element) {
      fetchPromises.push(
        toPng(element).then((img: string) => ({ key: `inject_${inject.inject_id}`, img })),
      );
    }
  });

  // Inject Result page
  const findCommentsByInjectId = (injectId: InjectResultDTO['inject_id']) => (report?.report_injects_comments ?? []).find((c) => c.inject_id === injectId)?.report_inject_comment ?? null;
  const injectResultPage = (imagesMap: Map<string, string>) => ([
    { text: t('Injects results'), tocItem: ['mainToc'], pageBreak: 'before', style: 'header' },
    {
      style: 'tableStyle',
      table: {
        body: [
          [t('Type'), t('Title'), t('Execution date'), t('Scores'), t('Targets'), t('Comments')].map((title) => ({
            text: title,
            bold: true,
            style: 'tableTitle',
          })),
          ...reportData.injects.map((inject) => {
            return [
              { text: tPick(inject.inject_injector_contract?.injector_contract_labels) },
              { text: inject.inject_title },
              { text: fldt(inject.inject_status?.tracking_sent_date) || 'N/A' },
              { image: imagesMap.get(`inject_${inject.inject_id}`), width: 60 },
              { text: inject.inject_targets.map((target) => target.name).join(', ') },
              { stack: convertMarkdownToPdfMake(findCommentsByInjectId(inject.inject_id) || '') },
            ];
          }),
        ],
      },
      layout: tableCustomLayout(false, 10),
    },
  ]);

  // Exercise Details page
  const exerciseDetailsPage = (imagesMap: Map<string, string>) => {
    const doubleColumns = [
      [
        { title: 'Distribution of score by team (in % of expectations)', img: imagesMap.get('exercise_distribution_score_by_team') },
        { title: 'Teams scores over time (in % of expectations)', img: imagesMap.get('exercise_distribution_score_over_time') },
      ],
      [
        { title: 'Distribution of total score by team', img: imagesMap.get('exercise_distribution_total_score_by_team') },
        { title: 'Teams scores over time)', img: imagesMap.get('exercise_distribution_score_over_time_by_team') },
      ],
      [
        { title: 'Distribution of total score by inject type', img: imagesMap.get('exercise_distribution_total_score_by_inject_type') },
        { title: 'Inject types scores over time', img: imagesMap.get('exercise_distribution_score_over_time_by_inject') },
      ],
    ];

    return [
      { text: t('Exercise details'), tocItem: ['mainToc'], pageBreak: 'before', style: 'header' },
      ...doubleColumns.flatMap((columns) => (
        {
          columns: columns.flatMap((col) => (
            {
              width: '*',
              stack: [
                { text: t(col.title), style: 'chartTitle' },
                { image: col.img as string, width: 260, margin: [-5, 0, 0, 0] },
              ],
            }
          )),
          columnGap: 10,
        }
      )),
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: t('Distribution of total score by organization'), style: 'chartTitle' },
              {
                image: imagesMap.get('exercise_distribution_total_score_by_organization'),
                width: 250,
                margin: [-5, 0, 0, 0],
              },
            ],
          }, {
            width: '25%',
            stack: [
              { text: t('Distribution of total score by player'), style: 'chartTitle' },
              { image: imagesMap.get('exercise_distribution_total_score_by_player'), width: 130 },
            ],
          }, {
            width: '25%',
            stack: [
              { text: t('Distribution of total score by inject'), style: 'chartTitle' },
              { image: imagesMap.get('exercise_distribution_total_score_by_inject'), width: 130 },
            ],
          }],
        margin: [0, 20, 0, 0],
      },
    ];
  };

  // Players Surveys page
  const playersSurveysPage = () => [
    { text: t('Player surveys'), tocItem: ['mainToc'], pageBreak: 'before', style: 'header' },
    ...reportData.lessonsCategories.sort((lesson) => lesson.lessons_category_order || 0).map((category) => {
      const lessonQuestions = reportData.lessonsQuestions
        .filter((q) => (category.lessons_category_questions || []).includes(q.lessonsquestion_id))
        .sort((a, b) => (a.lessons_question_order || 0) - (b.lessons_question_order || 0));

      return ([
        { text: [t('Category'), ` : ${category.lessons_category_name}`], bold: true, style: 'markdownHeaderH1' },
        { text: [t('Targeted teams'), ` : ${(category.lessons_category_teams || []).map((teamId) => reportData.teams.find((team) => team.team_id === teamId)?.team_name).join(', ') || '-'}`] },
        ...lessonQuestions.flatMap((question) => {
          const lessonsAnswers = (question.lessons_question_answers || [])
            .map((answerId) => reportData.lessonsAnswers.find((answer) => answer.lessonsanswer_id === answerId));
          const totalScore = (lessonsAnswers || []).reduce((sum, answer) => sum + (answer?.lessons_answer_score || 0), 0);
          return [
            { text: [t('Question'), ` : ${question.lessons_question_content}`], margin: [0, 6, 0, 0] },
            { text: [t('Total score'), ` : ${totalScore}`] },
            (lessonsAnswers.length > 0
              ? {
                table: {
                  widths: ['auto', '*', '*'],
                  margin: [0, 2, 0, 0],
                  body: [
                    [t('Score'), t('What worked well'), t('What didn\'t work well')].map((title) => ({
                      text: title,
                      bold: true,
                    })),
                    ...lessonsAnswers.map((answer) => ([answer?.lessons_answer_score, answer?.lessons_answer_positive, answer?.lessons_answer_negative])),
                  ],
                },
                layout: tableCustomLayout(true, 6),
              } : { text: t('Answers : N/A') }),
          ];
        }),
        '\n',
      ]);
    }),
  ];

  const results = await Promise.all(fetchPromises);
  const imagesMap: Map<string, string> = new Map();
  results.forEach(({ key: key_1, img: img_3 }) => {
    imagesMap.set(key_1, img_3 as string);
  });

  const displayInjectResultPage = displayModule(ReportInformationType.INJECT_RESULT);
  const displayGlobalObservation = displayModule(ReportInformationType.GLOBAL_OBSERVATION);
  const displayPlayerSurveys = displayModule(ReportInformationType.PLAYER_SURVEYS);
  const displayExerciseDetails = imagesMap.has('exercise_distribution_score_by_team');

  return {
    compress: false,
    pageSize: 'A4',
    footer: (currentPage_1: number) => {
      return {
        columns: [
          { text: report.report_name, alignment: 'left', margin: [30, 10] },
          { text: currentPage_1, alignment: 'right', margin: [30, 10] }, // Right side
        ],
        margin: [0, 0, 0, 10],
        style: 'footerStyle',
      };
    },
    content: [
      // First Page
      { image: imagesMap.get('openBAS_logo'), width: 150, margin: [0, 0, 0, 40] },
      { text: report.report_name, style: 'reportTitle' },
      { text: fldt(reportData.exercise.exercise_start_date), margin: [0, 10, 0, 0] },
      {
        text: [{ text: t('Teams') }, { text: ` : ${reportData.exercise.exercise_teams?.map((teamId_1) => reportData.teams.find((team_1) => team_1.team_id === teamId_1)?.team_name).join(', ')}` }],
        margin: [0, 0, 0, 150],
      },
      '\n',
      imagesMap.has('score_details') ? { image: imagesMap.get('score_details'), width: 530 } : {},
      '\n',
      imagesMap.has('main_information') ? {
        image: imagesMap.get('main_information'),
        width: 530,
        alignment: 'center',
      } : {},

      // Table of Contents Page
      ...((displayInjectResultPage || displayGlobalObservation || displayPlayerSurveys || displayExerciseDetails) ? [{
        toc: {
          id: 'mainToc',
          title: { text: t('Table of contents'), style: 'header', margin: [0, 0, 0, 20] },
        },
        pageBreak: 'before',
      }] : []),

      // Inject Results Page
      displayInjectResultPage ? injectResultPage(imagesMap) : {},

      // Global Information Page
      ...(displayGlobalObservation
        ? [
          { text: 'Global observation', tocItem: ['mainToc'], pageBreak: 'before', style: 'header' },
          { stack: convertMarkdownToPdfMake(report.report_global_observation || ' -') },
        ]
        : []),

      // Player surveys page
      displayPlayerSurveys ? playersSurveysPage() : [],

      // Exercise details page
      displayExerciseDetails ? exerciseDetailsPage(imagesMap) : [],
    ],
    styles: {
      reportTitle: {
        fontSize: 40,
        bold: true,
      },
      header: {
        bold: true,
        fontSize: 15,
        margin: [0, 0, 0, 15],
      },
      markdownHeaderH1: {
        bold: true,
        fontSize: 12,
        margin: [0, 10, 0, 10],
      },
      markdownHeaderH2: {
        bold: true,
        margin: [20, 10, 0, 10],
      },
      markdownHeaderH3: {
        bold: true,
        margin: [40, 10, 0, 10],
      },
      tableStyle: {
        fontSize: 8,
      },
      chartTitle: {
        fontSize: 8,
        bold: true,
      },
      tableTitle: {
        fontSize: 10,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
    pageMargins: [30, 40, 30, 40],
  };
};

export default getExerciseReportPdfDocDefinition;
