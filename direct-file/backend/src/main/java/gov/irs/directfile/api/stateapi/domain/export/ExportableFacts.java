package gov.irs.directfile.api.stateapi.domain.export;

import java.util.HashMap;
import java.util.Map;

import gov.irs.directfile.api.loaders.service.FactGraphService;
import gov.irs.directfile.models.EvaluatedFactInfo;

import static gov.irs.directfile.api.stateapi.domain.export.ExportUtils.*;

public class ExportableFacts extends HashMap<String, ExportableData<?>> {

    public static ExportableFacts fromEvaluatedFacts(Map<String, EvaluatedFactInfo> exportableEvaluatedFacts) {
        var exportableFacts = new ExportableFacts();

        // Separate collections from concrete path facts
        var exportableEvaluatedConcreteFacts = new HashMap<String, EvaluatedFactInfo>();
        exportableEvaluatedFacts.forEach((exportableFactPath, evaluatedFactInfo) -> {
            if (isCollection(evaluatedFactInfo)) {
                // Add collections by key so that concrete path collection facts have a place to
                // land
                var collectionKey = removeSlashes(exportableFactPath);
                exportableFacts.putCollection(collectionKey);
            } else {
                exportableEvaluatedConcreteFacts.put(exportableFactPath, evaluatedFactInfo);
            }
        });

        // Add the remaining concrete path facts
        exportableEvaluatedConcreteFacts.forEach(exportableFacts::putFact);

        return exportableFacts;
    }

    private void putCollection(String collectionBasePath) {
        this.put(collectionBasePath, new ExportableCollection());
    }

    private void putFact(String concretePath, EvaluatedFactInfo evaluatedFactInfo) {
        var matcher = FactGraphService.ABSTRACT_PATH_UUID_REGEX_PATTERN.matcher(concretePath);
        boolean collectionUuidFound = matcher.find();
        if (collectionUuidFound) {
            var collectionBasePath = concretePath.substring(0, matcher.start());
            var collectionKey = removeSlashes(collectionBasePath);
            var collectionUuid = matcher.group();
            var factKey = getFactKey(collectionUuid, concretePath);

            if (this.containsKey(collectionKey)) {
                var maybeCollection = this.get(collectionKey);
                if (maybeCollection instanceof ExportableCollection collection) {
                    collection.putCollectionFact(collectionUuid, factKey, evaluatedFactInfo);
                } else {
                    // should never happen, but rather than extra unsafe typecasting, just fail
                    // predictably...
                    throw new IllegalArgumentException(
                            "Encountered exportable fact collection not represented as a List with key '%s'"
                                    .formatted(collectionKey));
                }
            } else {
                // should never happen, assuming the base collection is always present in the
                // extract facts
                throw new IllegalArgumentException(
                        "Encountered fact with collection not matching any collection base path '%s'"
                                .formatted(collectionKey));
            }
        } else {
            // handle exportable facts with absolute paths
            var factKey = removeSlashes(concretePath);

            this.put(factKey, evaluatedFactInfo);
        }
    }

    private String getFactKey(String collectionUuid, String concretePath) {
        String collectionDelimiter = collectionUuid + "/";
        String factPath =
                concretePath.substring(concretePath.lastIndexOf(collectionDelimiter) + collectionDelimiter.length());

        if (factPath.contains("/")) {
            String[] pathParts = factPath.split("/");
            for (int i = 1; i < pathParts.length; i++) {
                var pathPart = pathParts[i];
                pathParts[i] = pathPart.substring(0, 1).toUpperCase() + pathPart.substring(1);
            }
            return String.join("", pathParts);
        }

        return factPath;
    }

    private void put(String factKey, EvaluatedFactInfo evaluatedFactInfo) {
        if (isBoolean(evaluatedFactInfo)) {
            this.put(factKey, ExportableFactValue.ofBoolean((Boolean) evaluatedFactInfo.value()));
        } else {
            this.put(
                    factKey,
                    ExportableFactValue.ofString(evaluatedFactInfo.value().toString()));
        }
    }

    public ExportableFacts sanitized(String filingStatus) {
        return this.entrySet().stream()
                .collect(
                        ExportableFacts::new,
                        (map, entry) -> {
                            var key = entry.getKey();
                            var value = entry.getValue();
                            if (value instanceof ExportableCollection collection) {
                                var sanitizedCollection = collection.sanitized(key, filingStatus);
                                map.put(key, sanitizedCollection);
                            } else {
                                map.put(key, value);
                            }
                        },
                        Map::putAll);
    }
}
