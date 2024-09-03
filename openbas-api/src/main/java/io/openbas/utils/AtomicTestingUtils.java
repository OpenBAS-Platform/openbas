package io.openbas.utils;

import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.raw.RawTeam;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.utils.AtomicTestingMapper.ResultDistribution;
import jakarta.validation.constraints.NotNull;
import org.hibernate.Hibernate;

import java.util.*;
import java.util.stream.Collectors;

public class AtomicTestingUtils {

    public static List<InjectTargetWithResult> getTargets(
            final List<Team> teams,
            final List<Asset> assets,
            final List<AssetGroup> assetGroups) {
        List<InjectTargetWithResult> targets = new ArrayList<>();
        targets.addAll(teams
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.TEAMS, t.getId(), t.getName(), List.of(), null))
                .toList());
        targets.addAll(assets
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.ASSETS, t.getId(), t.getName(), List.of(), Objects.equals(t.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(t)).getPlatform() : null))
                .toList());
        targets.addAll(assetGroups
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.ASSETS_GROUPS, t.getId(), t.getName(), List.of(), null))
                .toList());

        return targets;
    }

    public static List<InjectTargetWithResult> getTargetsFromRaw(
            final List<RawTeam> teams,
            final List<RawAsset> assets,
            final List<RawAssetGroup> assetGroups) {
        List<InjectTargetWithResult> targets = new ArrayList<>();
        targets.addAll(teams
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.TEAMS, t.getTeam_id(), t.getTeam_name(), List.of(), null))
                .toList());
        targets.addAll(assets
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.ASSETS, t.getAsset_id(), t.getAsset_name(), List.of(), Objects.equals(t.getAsset_type(), "Endpoint") ? Endpoint.PLATFORM_TYPE.valueOf(t.getEndpoint_platform()) : null))
                .toList());
        targets.addAll(assetGroups
                .stream()
                .map(t -> new InjectTargetWithResult(TargetType.ASSETS_GROUPS, t.getAsset_group_id(), t.getAsset_group_name(), List.of(), null))
                .toList());

        return targets;
    }

    public static List<InjectTargetWithResult> getTargetsWithResults(final Inject inject) {
        List<ExpectationResultsByType> defaultExpectationResultsByTypes = getDefaultExpectationResultsByTypes();
        List<InjectExpectation> expectations = inject.getExpectations();

        List<InjectExpectation> teamExpectations = new ArrayList<>();
        List<InjectExpectation> playerExpectations = new ArrayList<>();
        List<InjectExpectation> assetExpectations = new ArrayList<>();
        List<InjectExpectation> assetGroupExpectations = new ArrayList<>();

        expectations.forEach(expectation -> {
            if (expectation.getTeam() != null) {
                if (expectation.getUser() != null) {
                    playerExpectations.add(expectation);
                } else {
                    teamExpectations.add(expectation);
                }
            }
            if (expectation.getAsset() != null) {
                assetExpectations.add(expectation);
            }
            if (expectation.getAssetGroup() != null) {
                assetGroupExpectations.add(expectation);
            }
        });

        List<InjectTargetWithResult> targets = new ArrayList<>();
        List<InjectTargetWithResult> assetsToRefine = new ArrayList<>();

        // Players
        Map<Team, Map<User, List<InjectExpectation>>> groupedByTeamAndUser = playerExpectations.stream()
                .collect(Collectors.groupingBy(
                        InjectExpectation::getTeam,
                        Collectors.groupingBy(InjectExpectation::getUser)
                ));

        /* Match Target with expectations
         * */
        inject.getTeams().forEach(team -> {
            // Check if there are no expectations matching the current team (t)
            boolean noMatchingExpectations = teamExpectations.stream()
                    .noneMatch(exp -> exp.getTeam().getId().equals(team.getId()));
            if (noMatchingExpectations) {
                InjectTargetWithResult target = new InjectTargetWithResult(
                        TargetType.TEAMS,
                        team.getId(),
                        team.getName(),
                        defaultExpectationResultsByTypes,
                        null
                );
                targets.add(target);
            }
        });
        inject.getAssets().forEach(asset -> {
            // Check if there are no expectations matching the current asset (t)
            boolean noMatchingExpectations = assetExpectations.stream()
                    .noneMatch(exp -> exp.getAsset().getId().equals(asset.getId()));
            if (noMatchingExpectations) {
                InjectTargetWithResult target = new InjectTargetWithResult(
                        TargetType.ASSETS,
                        asset.getId(),
                        asset.getName(),
                        defaultExpectationResultsByTypes,
                        Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null
                );

                targets.add(target);
            }
        });
        inject.getAssetGroups().forEach(assetGroup -> {
            // Check if there are no expectations matching the current assetgroup (t)
            boolean noMatchingExpectations = assetGroupExpectations.stream()
                    .noneMatch(exp -> exp.getAssetGroup().getId().equals(assetGroup.getId()));

            List<InjectTargetWithResult> children = new ArrayList<>();

            assetGroup.getAssets().forEach(asset -> {
                children.add(new InjectTargetWithResult(
                        TargetType.ASSETS,
                        asset.getId(),
                        asset.getName(),
                        defaultExpectationResultsByTypes,
                        Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null
                ));
            });
            // Add dynamic assets as children
            assetGroup.getDynamicAssets().forEach(asset -> {
                children.add(new InjectTargetWithResult(
                        TargetType.ASSETS,
                        asset.getId(),
                        asset.getName(),
                        defaultExpectationResultsByTypes,
                        Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null
                ));
            });

            if (noMatchingExpectations) {
                InjectTargetWithResult target = new InjectTargetWithResult(
                        TargetType.ASSETS_GROUPS,
                        assetGroup.getId(),
                        assetGroup.getName(),
                        defaultExpectationResultsByTypes,
                        children,
                        null
                );

                targets.add(target);
            }
        });

        /* Build results for expectations with scores
         */
        if (!teamExpectations.isEmpty()) {
            targets.addAll(
                    teamExpectations
                            .stream()
                            .collect(
                                    Collectors.groupingBy(InjectExpectation::getTeam,
                                            Collectors.collectingAndThen(
                                                    Collectors.toList(), AtomicTestingUtils::getExpectationResultByTypes)
                                    )
                            )
                            .entrySet().stream()
                            .map(entry -> new InjectTargetWithResult(TargetType.TEAMS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue(), playerExpectations.isEmpty() ? List.of() : calculateResultsforPlayers(groupedByTeamAndUser.get(entry.getKey())), null))
                            .toList()
            );
        }
        if (!assetExpectations.isEmpty()) {
            assetsToRefine.addAll(
                    assetExpectations
                            .stream()
                            .collect(
                                    Collectors.groupingBy(InjectExpectation::getAsset,
                                            Collectors.collectingAndThen(
                                                    Collectors.toList(), AtomicTestingUtils::getExpectationResultByTypes)
                                    )
                            )
                            .entrySet().stream()
                            .map(entry -> new InjectTargetWithResult(TargetType.ASSETS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue(), Objects.equals(entry.getKey().getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(entry.getKey())).getPlatform() : null))
                            .toList()
            );
        }

        List<InjectTargetWithResult> assetsToRemove = new ArrayList<>();
        if (!assetGroupExpectations.isEmpty()) {
            targets.addAll(assetGroupExpectations
                    .stream()
                    .collect(
                            Collectors.groupingBy(InjectExpectation::getAssetGroup,
                                    Collectors.collectingAndThen(
                                            Collectors.toList(), AtomicTestingUtils::getExpectationResultByTypes)
                            )
                    )
                    .entrySet().stream()
                    .map(entry -> {
                        List<InjectTargetWithResult> children = new ArrayList<>();

                        for (InjectTargetWithResult asset : assetsToRefine) {
                            // Verify if any expectation is related to a dynamic assets
                            boolean foundExpectationForAsset = entry.getKey().getAssets().stream()
                                    .anyMatch(assetChild -> assetChild.getId().equals(asset.getId()));
                            boolean foundExpectationForDynamicAssets = entry.getKey().getDynamicAssets().stream()
                                    .anyMatch(assetChild -> assetChild.getId().equals(asset.getId()));
                            if (foundExpectationForAsset || foundExpectationForDynamicAssets) {
                                children.add(asset);
                                assetsToRemove.add(asset);
                            }
                        }

                        // Other children without expectations are added with a default result
                        entry.getKey().getAssets().forEach(asset -> {
                            boolean foundAssetsWithoutResults = children.stream()
                                    .noneMatch(child -> child.getId().equals(asset.getId()));
                            if (foundAssetsWithoutResults) {
                                children.add(new InjectTargetWithResult(
                                        TargetType.ASSETS,
                                        asset.getId(),
                                        asset.getName(),
                                        defaultExpectationResultsByTypes,
                                        Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null
                                ));
                            }
                        });

                        // For dynamicAssets
                        entry.getKey().getDynamicAssets().forEach(asset -> {
                            boolean foundDynamicAssetsWithoutResults = children.stream()
                                    .noneMatch(child -> child.getId().equals(asset.getId()));
                            if (foundDynamicAssetsWithoutResults) {
                                children.add(new InjectTargetWithResult(
                                        TargetType.ASSETS,
                                        asset.getId(),
                                        asset.getName(),
                                        defaultExpectationResultsByTypes,
                                        Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null
                                ));
                            }
                        });

                        return new InjectTargetWithResult(TargetType.ASSETS_GROUPS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue(), sortResults(children), null);
                    })
                    .toList());
        }

        List<String> injectAssetIds = inject.getAssets().stream()
                .map(Asset::getId)
                .collect(Collectors.toList());

        assetsToRefine.removeAll(
                assetsToRemove
                        .stream()
                        .filter(
                                asset -> !injectAssetIds.contains(asset.getId()))
                        .toList());

        targets.addAll(assetsToRefine);
        return sortResults(targets);
    }

    private static List<InjectTargetWithResult> calculateResultsforPlayers(Map<User, List<InjectExpectation>> expectationsByUser) {
        return expectationsByUser.entrySet().stream()
                .map(userEntry -> new InjectTargetWithResult(
                        TargetType.PLAYER,
                        userEntry.getKey().getId(),
                        userEntry.getKey().getName(),
                        getExpectationResultByTypes(userEntry.getValue()),
                        null
                ))
                .toList();
    }

    private static List<InjectTargetWithResult> sortResults(List<InjectTargetWithResult> targets) {
        return targets.stream().sorted(Comparator.comparing(InjectTargetWithResult::getName)).toList();
    }

    @NotNull
    private static List<ExpectationResultsByType> getDefaultExpectationResultsByTypes() {
        List<ExpectationType> types = List.of(ExpectationType.PREVENTION, ExpectationType.DETECTION, ExpectationType.HUMAN_RESPONSE);
        return types.stream()
                .map(type -> getExpectationByType(type, Collections.emptyList()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
    }

    @NotNull
    public static List<ExpectationResultsByType> getExpectationResultByTypes(final List<InjectExpectation> expectations) {
        List<Double> preventionScores = getScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
        List<Double> detectionScores = getScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
        List<Double> humanScores = getScores(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), expectations);

        List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

        getExpectationByType(ExpectationType.PREVENTION, preventionScores).map(resultAvgOfExpectations::add);
        getExpectationByType(ExpectationType.DETECTION, detectionScores).map(resultAvgOfExpectations::add);
        getExpectationByType(ExpectationType.HUMAN_RESPONSE, humanScores).map(resultAvgOfExpectations::add);

        return resultAvgOfExpectations;
    }

    @NotNull
    public static List<ExpectationResultsByType> getRawExpectationResultByTypes(final List<RawInjectExpectation> expectations) {
        List<Double> preventionScores = getRawScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
        List<Double> detectionScores = getRawScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
        List<Double> humanScores = getRawScores(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), expectations);

        List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

        getExpectationByType(ExpectationType.PREVENTION, preventionScores).ifPresent(resultAvgOfExpectations::add);
        getExpectationByType(ExpectationType.DETECTION, detectionScores).ifPresent(resultAvgOfExpectations::add);
        getExpectationByType(ExpectationType.HUMAN_RESPONSE, humanScores).ifPresent(resultAvgOfExpectations::add);

        return resultAvgOfExpectations;
    }

    public static Optional<ExpectationResultsByType> getExpectationByType(final ExpectationType type, final List<Double> scores) {
        if (scores.isEmpty()) {
            return Optional.of(new ExpectationResultsByType(type, InjectExpectation.EXPECTATION_STATUS.UNKNOWN, Collections.emptyList()));
        }
        OptionalDouble avgResponse = calculateAverageFromExpectations(scores);
        if (avgResponse.isPresent()) {
            return Optional.of(new ExpectationResultsByType(type, getResult(avgResponse), getResultDetail(type, scores)));
        }
        return Optional.of(new ExpectationResultsByType(type, InjectExpectation.EXPECTATION_STATUS.PENDING, getResultDetail(type, scores)));
    }

    public static List<InjectExpectation> getRefinedExpectations(Inject inject, List<String> targetIds) {
        return inject
                .getExpectations()
                .stream()
                .filter(expectation -> targetIds.contains(expectation.getTargetId()))
                .filter(expectation -> expectation.getUser() == null) // Filter expectations linked to players. For global results, We use Team expectations
                .toList();
    }

    public static List<ResultDistribution> getResultDetail(final ExpectationType type, final List<Double> normalizedScores) {
        long successCount = normalizedScores.stream().filter(s -> s != null && s.equals(1.0)).count();
        long partialCount = normalizedScores.stream().filter(s -> s != null && s.equals(0.5)).count();
        long pendingCount = normalizedScores.stream().filter(Objects::isNull).count();
        long failureCount = normalizedScores.stream().filter(s -> s != null && s.equals(0.0)).count();

        return List.of(
                new ResultDistribution(type.successLabel, (int) successCount),
                new ResultDistribution(type.pendingLabel, (int) pendingCount),
                new ResultDistribution(type.partialLabel, (int) partialCount),
                new ResultDistribution(type.failureLabel, (int) failureCount)
        );
    }

    public static List<Double> getScores(final List<EXPECTATION_TYPE> types, final List<InjectExpectation> expectations) {
        return expectations
                .stream()
                .filter(e -> types.contains(e.getType()))
                .map(injectExpectation -> {
                    if (injectExpectation.getScore() == null) {
                        return null;
                    }
                    if (injectExpectation.getTeam() != null) {
                        if (injectExpectation.getScore() >= injectExpectation.getExpectedScore()) {
                            return 1.0;
                        } else {
                            return 0.0;
                        }
                    } else {
                        if (injectExpectation.getScore() >= injectExpectation.getExpectedScore()) {
                            return 1.0;
                        }
                        if (injectExpectation.getScore() == 0) {
                            return 0.0;
                        }
                        return 0.5;
                    }
                })
                .toList();
    }

    public static List<Double> getRawScores(final List<EXPECTATION_TYPE> types, final List<RawInjectExpectation> expectations) {
        return expectations
                .stream()
                .filter(e -> types.contains(EXPECTATION_TYPE.valueOf(e.getInject_expectation_type())))
                .map(rawInjectExpectation -> {
                    if (rawInjectExpectation.getInject_expectation_score() == null) {
                        return null;
                    }
                    if (rawInjectExpectation.getTeam_id() != null) {
                        if (rawInjectExpectation.getInject_expectation_group()) {
                            if (rawInjectExpectation.getInject_expectation_score() > 0) {
                                return 1.0;
                            } else {
                                return 0.0;
                            }
                        } else {
                            if (rawInjectExpectation.getInject_expectation_score() >= rawInjectExpectation.getInject_expectation_expected_score()) {
                                return 1.0;
                            } else {
                                return 0.0;
                            }
                        }
                    } else {
                        if (rawInjectExpectation.getInject_expectation_score() >= rawInjectExpectation.getInject_expectation_expected_score()) {
                            return 1.0;
                        }
                        if (rawInjectExpectation.getInject_expectation_score() == 0) {
                            return 0.0;
                        }
                        return 0.5;
                    }
                })
                .toList();
    }

    public static InjectExpectation.EXPECTATION_STATUS getResult(final OptionalDouble avg) {
        Double avgAsDouble = avg.getAsDouble();
        return avgAsDouble == 0.0 ? InjectExpectation.EXPECTATION_STATUS.FAILED :
                (avgAsDouble == 1.0 ? InjectExpectation.EXPECTATION_STATUS.SUCCESS :
                        InjectExpectation.EXPECTATION_STATUS.PARTIAL);
    }

    public static OptionalDouble calculateAverageFromExpectations(final List<Double> scores) {
        return scores.stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average();
    }

}
