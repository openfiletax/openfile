package gov.irs.directfile.api.loaders.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import scala.xml.NodeSeq;

public record TaxFact(
        String path,
        NodeSeq node,
        @JsonIgnore String name,
        @JsonIgnore String description,
        boolean exportZero,
        TaxWritable writable,
        TaxCompNode derived,
        TaxCompNode placeholder,
        TaxCompNode overrideCondition,
        TaxCompNode overrideDefault,
        ExportNode export) {}
