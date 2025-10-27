package gov.irs.directfile.api.loaders.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import gov.irs.factgraph.FactDictionary;
import gov.irs.factgraph.definitions.FactDictionaryConfigTrait;
import gov.irs.factgraph.definitions.fact.CompNodeConfigTrait;
import gov.irs.factgraph.definitions.fact.FactConfigTrait;
import gov.irs.factgraph.definitions.fact.LimitConfigTrait;
import gov.irs.factgraph.definitions.fact.LimitLevel;
import gov.irs.factgraph.definitions.fact.OptionConfigTrait;

import gov.irs.directfile.api.factgraph.CompNodeConfig;
import gov.irs.directfile.api.factgraph.FactConfig;
import gov.irs.directfile.api.factgraph.FactDictionaryConfig;
import gov.irs.directfile.api.factgraph.LimitConfig;
import gov.irs.directfile.api.factgraph.MetaConfig;
import gov.irs.directfile.api.factgraph.OptionConfig;
import gov.irs.directfile.api.factgraph.WritableConfig;
import gov.irs.directfile.api.loaders.domain.TaxCompNode;
import gov.irs.directfile.api.loaders.domain.TaxDictionaryDigest;
import gov.irs.directfile.api.loaders.domain.TaxFact;
import gov.irs.directfile.api.loaders.domain.TaxLimit;
import gov.irs.directfile.api.loaders.domain.TaxWritable;

@Slf4j
public class FactGraphLoader {
    /**
     * Converts the intermediate java objects from XmlProcessor.process() into fact graph
     * configuration objects and loads them into a `FactDictionary`.
     *
     * <p>The `FactDictionary` is the generic fact graph configuration which is used to create a
     * `Graph`
     *
     * @param digest TaxDictionaryDigest
     * @return FactDictionary
     */
    public FactDictionary createFactDictionary(final TaxDictionaryDigest digest) {
        FactDictionaryConfigTrait dictConfig = convertDigestToConfig(digest);
        log.info(
                "Loaded fact graph configuration version: {}", dictConfig.meta().version());
        return FactDictionary.fromConfig(dictConfig);
    }

    private FactDictionaryConfigTrait convertDigestToConfig(final TaxDictionaryDigest digest) {
        List<FactConfigTrait> factConfigList = digest.getFacts().values().stream()
                .map(this::createFactConfigFromTaxFact)
                .toList();
        log.info("Read {} facts", factConfigList.size());

        return new FactDictionaryConfig(factConfigList, new MetaConfig(digest.getSourceName()));
    }

    private FactConfigTrait createFactConfigFromTaxFact(final TaxFact taxFact) {
        WritableConfig writableConfig = handleFactWritable(taxFact.writable());
        CompNodeConfig derivedConfig = handleFactDerived(taxFact.derived());
        CompNodeConfig placeholderConfig = handleFactDerived(taxFact.placeholder());
        CompNodeConfig overrideConditionConfig = handleFactDerived(taxFact.overrideCondition());
        CompNodeConfig overrideDefaultConfig = handleFactDerived(taxFact.overrideDefault());

        return new FactConfig(taxFact.path(), taxFact.node(), writableConfig, derivedConfig, placeholderConfig, overrideConditionConfig, overrideDefaultConfig);
    }

    private WritableConfig handleFactWritable(TaxWritable writable) {
        if (writable == null) {
            return null;
        }

        List<OptionConfigTrait> optionConfigs = handleOptions(writable.options());
        List<LimitConfigTrait> limitConfigs = handleLimits(writable.limits());

        return new WritableConfig(writable.typeName(), optionConfigs, writable.collectionItemAlias(), limitConfigs);
    }

    private CompNodeConfig handleFactDerived(TaxCompNode compNode) {
        if (compNode == null) {
            return null;
        }

        List<CompNodeConfigTrait> childConfigs = new ArrayList<>();
        for (TaxCompNode childNode : compNode.children()) {
            childConfigs.add(handleFactDerived(childNode));
        }

        List<OptionConfigTrait> optionConfigs = handleOptions(compNode.options());

        return new CompNodeConfig(compNode.typeName(), childConfigs, optionConfigs);
    }

    private List<OptionConfigTrait> handleOptions(final Map<String, String> options) {
        List<OptionConfigTrait> optionConfigs = new ArrayList<>();
        options.forEach((key, value) -> optionConfigs.add(new OptionConfig(key, value)));
        return optionConfigs;
    }

    private List<LimitConfigTrait> handleLimits(final Iterable<TaxLimit> limits) {
        List<LimitConfigTrait> limitConfigs = new ArrayList<>();
        limits.forEach(limit -> limitConfigs.add(new LimitConfig(
                limit.operation(), LimitLevel.valueOf(limit.level().name()), handleFactDerived(limit.node()))));
        return limitConfigs;
    }
}
