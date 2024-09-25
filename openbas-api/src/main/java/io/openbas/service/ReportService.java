package io.openbas.service;

import io.openbas.database.model.Inject;
import io.openbas.database.model.Report;
import io.openbas.database.model.ReportInformation;
import io.openbas.database.model.ReportInjectComment;
import io.openbas.database.repository.ReportRepository;
import io.openbas.database.specification.ReportSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.report.form.ReportInjectCommentInput;
import io.openbas.rest.report.form.ReportInput;
import jakarta.persistence.EntityManager;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final EntityManager entityManager;

    public Report report(@NotNull final UUID reportId) {
        return this.reportRepository.findById(reportId).orElseThrow(ElementNotFoundException::new);
    }

    public List<Report> reportsFromExercise(@NotNull final String exerciseId) {
        return this.reportRepository.findAll(ReportSpecification.fromExercise(exerciseId));
    }

    public Report updateReport(@NotNull final Report report, @NotNull final ReportInput input){
        report.setUpdateAttributes(input);
        report.setUpdateDate(now());
        input.getReportInformations().forEach(i -> {
            ReportInformation reportInformation = report.getReportInformations().stream()
                    .filter(r -> r.getReportInformationsType().equals(i.getReportInformationsType()))
                    .findFirst()
                    .orElse(null);
            if (reportInformation != null) {
                reportInformation.setReportInformationsDisplay(i.getReportInformationsDisplay());
            } else {
                reportInformation = new ReportInformation();
                reportInformation.setReport(report);
                reportInformation.setReportInformationsDisplay(i.getReportInformationsDisplay());
                reportInformation.setReportInformationsType(i.getReportInformationsType());
                report.getReportInformations().add(reportInformation);
            }
        });
        return this.reportRepository.save(report);
    }

    public List<ReportInjectComment> updateReportInjectComment(@NotNull final Report report, @NotNull final Inject inject, @NotNull final ReportInjectCommentInput input){
        ReportInjectComment reportInjectComment = findReportInjectComment(report.getId(), inject.getId());

        if (reportInjectComment != null) {
            reportInjectComment.setComment(input.getComment());
        } else {
            reportInjectComment = new ReportInjectComment();
            reportInjectComment.setInject(inject);
            reportInjectComment.setReport(report);
            reportInjectComment.setComment(input.getComment());
            report.getReportInjectsComments().add(reportInjectComment);
        }
        this.reportRepository.save(report);
        return report.getReportInjectsComments();
    }

    private ReportInjectComment findReportInjectComment(String reportId, String injectId) {
        String jpql = "SELECT r FROM ReportInjectComment r WHERE r.report.id = :reportId AND r.inject.id = :injectId";

        return this.entityManager.createQuery(jpql, ReportInjectComment.class)
            .setParameter("reportId", UUID.fromString(reportId))
            .setParameter("injectId", injectId)
            .getResultStream()
            .findFirst()
            .orElse(null);
    }

    public void deleteReport(@NotBlank final UUID reportId) {
        this.reportRepository.deleteById(reportId);
    }
}
