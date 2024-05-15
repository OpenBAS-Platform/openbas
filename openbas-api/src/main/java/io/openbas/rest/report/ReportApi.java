package io.openbas.rest.report;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Report;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.ReportRepository;
import io.openbas.database.specification.ReportSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.report.form.ReportCreateInput;
import io.openbas.rest.report.form.ReportUpdateInput;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static java.time.Instant.now;

@RestController
public class ReportApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private ReportRepository reportRepository;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setReportRepository(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping("/api/exercises/{exerciseId}/reports")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Report> exerciseReports(@PathVariable String exerciseId) {
        return reportRepository.findAll(ReportSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/reports")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Report createExerciseReport(@PathVariable String exerciseId, @Valid @RequestBody ReportCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Report report = new Report();
        report.setUpdateAttributes(input);
        report.setExercise(exercise);
        return reportRepository.save(report);
    }

    @PutMapping("/api/exercises/{exerciseId}/reports/{reportId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Report updateExerciseReport(@PathVariable String exerciseId,@PathVariable String reportId, @Valid @RequestBody ReportUpdateInput input) {
        Report report = reportRepository.findById(reportId).orElseThrow(ElementNotFoundException::new);
        report.setUpdateAttributes(input);
        report.setUpdated(now());
        return reportRepository.save(report);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/reports/{reportId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteExerciseReport(@PathVariable String exerciseId, @PathVariable String reportId) {
        reportRepository.deleteById(reportId);
    }
}
