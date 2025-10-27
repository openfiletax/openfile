package gov.irs.directfile.api.factgraph;

import scala.Option;

public class FactConfig implements gov.irs.factgraph.definitions.fact.FactConfigTrait {

    public FactConfig(
            String path,
            gov.irs.factgraph.definitions.fact.WritableConfigTrait writable,
            gov.irs.factgraph.definitions.fact.CompNodeConfigTrait derived,
            gov.irs.factgraph.definitions.fact.CompNodeConfigTrait placeholder,
            gov.irs.factgraph.definitions.fact.CompNodeConfigTrait overrideCondition,
            gov.irs.factgraph.definitions.fact.CompNodeConfigTrait overrideDefault) {
        this.path = path;
        this.writable = writable;
        this.derived = derived;
        this.placeholder = placeholder;
        this.overrideCondition = overrideCondition;
        this.overrideDefault = overrideDefault;
    }

    public String path;
    public gov.irs.factgraph.definitions.fact.WritableConfigTrait writable;
    public gov.irs.factgraph.definitions.fact.CompNodeConfigTrait derived;
    public gov.irs.factgraph.definitions.fact.CompNodeConfigTrait placeholder;
    public gov.irs.factgraph.definitions.fact.CompNodeConfigTrait overrideCondition;
    public gov.irs.factgraph.definitions.fact.CompNodeConfigTrait overrideDefault;

    @Override
    public String path() {
        return path;
    }

    @Override
    public Option<gov.irs.factgraph.definitions.fact.WritableConfigTrait> writable() {
        return Option.apply(writable);
    }

    @Override
    public Option<gov.irs.factgraph.definitions.fact.CompNodeConfigTrait> derived() {
        return Option.apply(derived);
    }

    @Override
    public Option<gov.irs.factgraph.definitions.fact.CompNodeConfigTrait> placeholder() {
        return Option.apply(placeholder);
    }

    @Override
    public Option<gov.irs.factgraph.definitions.fact.CompNodeConfigTrait> overrideCondition() {
        return Option.apply(overrideCondition);
    }

    @Override
    public Option<gov.irs.factgraph.definitions.fact.CompNodeConfigTrait> overrideDefault() {
        return Option.apply(overrideDefault);
    }
}
