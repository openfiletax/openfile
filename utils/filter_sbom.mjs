import fs from "fs";

const sbomOriginal = JSON.parse(fs.readFileSync(`sbom.tmp.json`, "utf-8"));
const components = sbomOriginal.components;
const dedupedComponents = [];
const seenPurls = new Set();
const seenBomRefs = new Set();

for (const component of components) {
  if (
    !seenPurls.has(component.purl) &&
    (component["bom-ref"] == undefined ||
      !seenBomRefs.has(component["bom-ref"]))
  ) {
    seenPurls.add(component.purl);
    seenBomRefs.add(component["bom-ref"]);
    dedupedComponents.push(component);
  }
}

const newSbom = { ...sbomOriginal, components: dedupedComponents };

fs.writeFileSync("sbom.tmp.json", JSON.stringify(newSbom));
