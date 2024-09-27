package io.openbas.utils;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.model.Team;
import io.openbas.rest.exception.ElementNotFoundException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

public class ExpectationUtils {

    private ExpectationUtils() {

    }

    public static List<InjectExpectation> processByValidationType(boolean isaNewExpectationResult, List<InjectExpectation> childrenExpectations, List<InjectExpectation> parentExpectations, Map<Team, List<InjectExpectation>> playerByTeam) {
        List<InjectExpectation> updatedExpectations = new ArrayList<>();

        childrenExpectations.stream().findAny().ifPresentOrElse(process -> {
            boolean isValidationAtLeastOneTarget = process.isExpectationGroup();

            parentExpectations.forEach(parentExpectation -> {
                List<InjectExpectation> toProcess = playerByTeam.get(parentExpectation.getTeam());
                int playersSize = toProcess.size(); // Without Parent expectation
                long zeroPlayerResponses = toProcess.stream().filter(exp -> exp.getScore() != null).filter(exp -> exp.getScore() == 0.0).count();
                long nullPlayerResponses = toProcess.stream().filter(exp -> exp.getScore() == null).count();

                if (isValidationAtLeastOneTarget) { // Type atLeast
                    OptionalDouble avgAtLeastOnePlayer = toProcess.stream().filter(exp -> exp.getScore() != null).filter(exp -> exp.getScore() > 0.0).mapToDouble(InjectExpectation::getScore).average();
                    if (avgAtLeastOnePlayer.isPresent()) { //Any response is positive
                        parentExpectation.setScore(avgAtLeastOnePlayer.getAsDouble());
                    } else {
                        if (zeroPlayerResponses == playersSize) { //All players had failed
                            parentExpectation.setScore(0.0);
                        } else {
                            parentExpectation.setScore(null);
                        }
                    }
                } else { // type all
                    if(nullPlayerResponses == 0){
                        OptionalDouble avgAllPlayer = toProcess.stream().mapToDouble(InjectExpectation::getScore).average();
                        parentExpectation.setScore(avgAllPlayer.getAsDouble());
                    }else{
                        if(zeroPlayerResponses == 0) {
                            parentExpectation.setScore(null);
                        }else{
                            double sumAllPlayer = toProcess.stream().filter(exp->exp.getScore() != null).mapToDouble(InjectExpectation::getScore).sum();
                            parentExpectation.setScore(sumAllPlayer/playersSize);
                        }
                    }
                }

                if(isaNewExpectationResult) {
                    InjectExpectationResult result = InjectExpectationResult.builder()
                            .sourceId("media-pressure")
                            .sourceType("media-pressure")
                            .sourceName("Media pressure read")
                            .result(Instant.now().toString())
                            .date(Instant.now().toString())
                            .score(process.getExpectedScore())
                            .build();
                    parentExpectation.getResults().add(result);
                }

                parentExpectation.setUpdatedAt(Instant.now());
                updatedExpectations.add(parentExpectation);
            });
        }, ElementNotFoundException::new);

        return updatedExpectations;
    }

}
