package io.openbas.service;

import io.openbas.database.model.Report;
import io.openbas.database.model.ReportInformation;
import io.openbas.database.model.ReportInformationsType;
import io.openbas.database.repository.ReportRepository;
import io.openbas.rest.report.form.ReportInformationInput;
import io.openbas.rest.report.form.ReportInput;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    private ReportService reportService;

    @BeforeEach
    void before() {
        // Injecting mocks into the controller
        reportService = new ReportService(reportRepository);
    }

    @DisplayName("Test create a report")
    @Test
    void createReport() throws Exception {
        // -- PREPARE --
        Report report = new Report();

        ReportInput reportInput = new ReportInput();
        reportInput.setName("test");
        ReportInformationInput reportInformationInput = new ReportInformationInput();
        reportInformationInput.setReportInformationsType(ReportInformationsType.MAIN_INFORMATION);
        reportInformationInput.setReportInformationsDisplay(true);
        ReportInformationInput reportInformationInput2 = new ReportInformationInput();
        reportInformationInput2.setReportInformationsType(ReportInformationsType.SCORE_DETAILS);
        reportInformationInput2.setReportInformationsDisplay(true);
        reportInput.setReportInformations(List.of(reportInformationInput, reportInformationInput2));

        when(reportRepository.save(any(Report.class))).thenReturn(report);

        // -- EXECUTE --
        reportService.updateReport(report, reportInput);

        // -- ASSERT --
        ArgumentCaptor<Report> reportCaptor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(reportCaptor.capture());
        Report capturedReport= reportCaptor.getValue();
        assertEquals(reportInput.getName(), capturedReport.getName());
        assertEquals(2, capturedReport.getReportInformations().size());
        ReportInformation reportInformationCaptured = capturedReport.getReportInformations().stream()
                .filter(r -> r.getReportInformationsType() == ReportInformationsType.MAIN_INFORMATION)
                .findFirst()
                .orElse(null);
        assert reportInformationCaptured != null;
        assertEquals(true, reportInformationCaptured.getReportInformationsDisplay());
        ReportInformation reportInformationCaptured2 = capturedReport.getReportInformations().stream()
                .filter(r -> r.getReportInformationsType() == ReportInformationsType.SCORE_DETAILS)
                .findFirst()
                .orElse(null);
        assert reportInformationCaptured2 != null;
        assertEquals(true, reportInformationCaptured2.getReportInformationsDisplay());
    }

    @DisplayName("Test update a report")
    @Test
    void updateReport() throws Exception {
        // -- PREPARE --
        Report report = new Report();
        report.setName("test");
        ReportInformation reportInformation = new ReportInformation();
        reportInformation.setReportInformationsType(ReportInformationsType.MAIN_INFORMATION);
        reportInformation.setReportInformationsDisplay(false);
        report.setReportInformations(List.of(reportInformation));

        ReportInput reportInput = new ReportInput();
        reportInput.setName("new name test");
        ReportInformationInput reportInformationInput = new ReportInformationInput();
        reportInformationInput.setReportInformationsType(ReportInformationsType.MAIN_INFORMATION);
        reportInformationInput.setReportInformationsDisplay(true);
        reportInput.setReportInformations(List.of(reportInformationInput));

        when(reportRepository.save(any(Report.class))).thenReturn(report);

        // -- EXECUTE --
       reportService.updateReport(report, reportInput);

        // -- ASSERT --
        ArgumentCaptor<Report> reportCaptor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(reportCaptor.capture());
        Report capturedReport= reportCaptor.getValue();
        assertEquals(reportInput.getName(), capturedReport.getName());
        assertEquals(1, capturedReport.getReportInformations().size());
        assertEquals(true, capturedReport.getReportInformations().getFirst().getReportInformationsDisplay());
    }
}



















