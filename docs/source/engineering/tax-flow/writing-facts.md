# Writing facts

- Modules don't have any actual meaning, they're just a tool for organizing code
- The fact dictionary files eventually all compile down to one big dictionary

## examples of using dependencies in a fact

This establishes the context for the fact, in this case we're looking inside the "filers" collection:
```
<Fact path="/filers/*/hsaContributionsTotal">
```

 This is a fact that lives outside the "filers" collection, so we don't use a relative path. It's being imported from the "filingStatus" module:
```
<Dependency module="filingStatus" path="/isFilingStatusMFJ" />
```

This is a fact that lives inside the "filers" collection, but is written in a different file:
```
<Dependency module="filers" path="../isSecondaryFiler" />
```

This is a relative path because it exists inside the "filers" collection. It is written in the filers.xml file, but that doesn't matter because we're already working within the filers collection so we have access to everything in that collection regardless of which module/file it is in:
```
<Dependency path="../isSecondaryFiler" />
```

This is a path for a fact that is written in the same file where it is being called. It is not a relative path because it exists outside the "filers" collection, but it does not need a module because it is in the current file:
```
<Dependency path="/secondaryHsaContributionsTotal" />
```
