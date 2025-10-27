package gov.irs.directfile.api.loaders.processor;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.core.io.Resource;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import scala.xml.NodeSeq;

import gov.irs.directfile.api.loaders.domain.ExportNode;
import gov.irs.directfile.api.loaders.domain.TaxCompNode;
import gov.irs.directfile.api.loaders.domain.TaxDictionaryDigest;
import gov.irs.directfile.api.loaders.domain.TaxFact;
import gov.irs.directfile.api.loaders.domain.TaxLimit;
import gov.irs.directfile.api.loaders.domain.TaxLimitLevel;
import gov.irs.directfile.api.loaders.domain.TaxWritable;
import gov.irs.directfile.api.loaders.errors.XmlProcessorException;

@SuppressFBWarnings(
        value = {"DCN_NULLPOINTER_EXCEPTION"},
        justification = "Initial Spotbugs setup")
public class XmlProcessor {
    private static final String FACT_NAME_CHILD_NAME = "Name";
    private static final String FACT_DESCRIPTION_CHILD_NAME = "Description";
    private static final String FACT_EXPORT_ZERO = "ExportZero";
    private static final String FACT_WRITABLE_CHILD_NAME = "Writable";
    private static final String FACT_DERIVED_CHILD_NAME = "Derived";
    private static final String FACT_PLACEHOLDER_CHILD_NAME = "Placeholder";
    private static final String LIMIT_ELEMENT_NAME = "Limit";
    private static final String LIMIT_TYPE_ATTRIBUTE_NAME = "type";
    private static final String LIMIT_LEVEL_ATTRIBUTE_NAME = "level";
    private static final String TEXT_NODE_VALUE_NAME = "value";
    private static final String COLLECTION_ATTRIBUTE_NAME = "collection";
    private static final String BLOCK_SUBMISSION_ON_TRUE_ELEMENT_NAME = "BlockSubmissionOnTrue";
    private static final String FACT_EXPORT_CHILD_NAME = "Export";

    /**
     * Reads an XML-formatted tax year fact graph configuration file This is known to contain a
     * "FactDictionaryModule" with element "Facts".
     *
     * <p>This reads the configuration into an intermediate set of java classes where the
     * configuration can be stored for easy serialization to the frontend.
     *
     * @param in InputStream
     * @return TaxYearDigest
     */
    @SuppressWarnings(value = {"PMD.CloseResource"}) // suppress this warning for inputStream
    public TaxDictionaryDigest process(final String folderName, final Resource[] xmlFactDictionaryModules) {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        try {
            dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            dbf.setXIncludeAware(false);

            Map<String, TaxFact> factMap = new HashMap<>();
            for (Resource factDictionaryModuleXml : xmlFactDictionaryModules) {
                DocumentBuilder db = dbf.newDocumentBuilder();
                InputStream in = factDictionaryModuleXml.getInputStream();
                Document doc = db.parse(in);
                in.close();
                // facts
                XPath xPath = XPathFactory.newInstance().newXPath();

                NodeList factNodes =
                        (NodeList) xPath.evaluate("/FactDictionaryModule/Facts/Fact", doc, XPathConstants.NODESET);

                for (int i = 0; i < factNodes.getLength(); i++) {
                    TaxFact taxFact = readFact(factNodes.item(i));
                    factMap.put(taxFact.path(), taxFact);
                }
            }
            return new TaxDictionaryDigest(folderName, factMap);
        } catch (IOException e) {
            throw new XmlProcessorException("Could not read xml input file", e);
        } catch (ParserConfigurationException e) {
            throw new XmlProcessorException("Parser configuration failed", e);
        } catch (SAXException | IllegalArgumentException e) {
            throw new XmlProcessorException("Failed to parse XML tax configuration", e);
        } catch (XPathExpressionException e) {
            throw new XmlProcessorException("Invalid xpath", e);
        }
    }

    private TaxFact readFact(Node node) {
        Map<String, String> attributeMap = convertAttributesToOptionMap(node.getAttributes());
        String path = attributeMap.getOrDefault("path", null);
        if (path == null) {
            throw new XmlProcessorException("Fact is missing path attribute");
        }
        NodeSeq node = NodeSeq.empty;

        Element factElement = (Element) node;
        Element nameElement = getDirectChildElement(factElement, FACT_NAME_CHILD_NAME);
        String name = nameElement != null ? nameElement.getTextContent().strip() : "";

        Element descriptionElement = getDirectChildElement(factElement, FACT_DESCRIPTION_CHILD_NAME);
        String description =
                descriptionElement != null ? descriptionElement.getTextContent().strip() : "";

        Element exportZeroElement = getDirectChildElement(factElement, FACT_EXPORT_ZERO);
        boolean exportZero = exportZeroElement != null;

        // writable
        Element writableElement = getDirectChildElement(factElement, FACT_WRITABLE_CHILD_NAME);
        List<Element> writableElementChildren = getAllDirectChildElements(writableElement);
        TaxWritable writable = readWritableNode(writableElementChildren);

        // derived
        TaxCompNode derived = readSingleCompNodeFromChild(factElement, FACT_DERIVED_CHILD_NAME, path);

        // placeholder
        TaxCompNode placeholder = readSingleCompNodeFromChild(factElement, FACT_PLACEHOLDER_CHILD_NAME, path);

        // Export
        Element exportElement = getDirectChildElement(factElement, FACT_EXPORT_CHILD_NAME);
        ExportNode export = readExportNode(exportElement);

        return new TaxFact(path, node, name, description, exportZero, writable, derived, placeholder, export);
    }

    private TaxWritable readWritableNode(List<Element> writableElementList) {
        if (writableElementList.size() == 0) {
            return null;
        }

        String writableNodeName = null;
        Map<String, String> options = new HashMap<>();
        String collectionItemAlias = null;
        List<TaxLimit> limits = new ArrayList<>();

        boolean foundWritableNode = false;
        for (Element el : writableElementList) {
            if (!LIMIT_ELEMENT_NAME.equals(el.getNodeName())) {
                if (foundWritableNode) {
                    throw new XmlProcessorException("Writable node has more than 1 non-Limit child");
                }
                foundWritableNode = true;
                writableNodeName = el.getNodeName();

                String textNodeValue = "";
                NodeList childNodes = el.getChildNodes();
                for (int i = 0; i < childNodes.getLength(); i++) {
                    Node childNode = childNodes.item(i);
                    if (childNode.getNodeType() == Node.TEXT_NODE) {
                        textNodeValue = el.getNodeValue();
                    }
                }
                options = convertTextValueAndAttributesToOptionMap(textNodeValue, el.getAttributes());

                // collection aliases are handled specially:  they are passed as an attribute, but
                // stripped
                // off and included separately to the fact graph's WritableConfig
                collectionItemAlias = options.getOrDefault(COLLECTION_ATTRIBUTE_NAME, null);
                options.remove(COLLECTION_ATTRIBUTE_NAME);
            } else {
                TaxLimit limit = readLimit(el);
                limits.add(limit);
            }
        }

        return new TaxWritable(writableNodeName, options, collectionItemAlias, limits);
    }

    private ExportNode readExportNode(Element expElement) {
        if (expElement == null) {
            return null;
        }

        String exportNodeName = expElement.getNodeName();
        Map<String, String> expOptions = convertAttributesToOptionMap(expElement.getAttributes());

        return new ExportNode(exportNodeName, expOptions);
    }

    private TaxCompNode readSingleCompNodeFromChild(final Element el, final String childName, final String path) {
        Element childElement = getDirectChildElement(el, childName);
        List<Element> grandchildren = getAllDirectChildElements(childElement);
        if (grandchildren.size() > 1) {
            throw new XmlProcessorException(String.format("Fact %s: %s has more than 1 child", path, childElement));
        } else if (grandchildren.size() == 1) {
            return readCompNode(grandchildren.get(0));
        }
        // child didn't exist
        return null;
    }

    private TaxCompNode readCompNode(Node node) {
        List<TaxCompNode> children = new ArrayList<>();
        String textNodeValue = "";

        NodeList childNodes = node.getChildNodes();
        for (int i = 0; i < childNodes.getLength(); i++) {
            Node currentNode = childNodes.item(i);
            if (currentNode.getNodeType() == Node.ELEMENT_NODE) {
                TaxCompNode child = readCompNode(currentNode);
                children.add(child);
            } else if (currentNode.getNodeType() == Node.CDATA_SECTION_NODE) {
                textNodeValue = currentNode.getNodeValue();
            } else if (currentNode.getNodeType() == Node.TEXT_NODE) {
                textNodeValue = currentNode.getNodeValue();
            } else if (currentNode.getNodeType() == Node.COMMENT_NODE) {
                // skip this...
                continue;
            } else {
                throw new RuntimeException("Missing a type of XML node");
            }
        }

        Map<String, String> options = convertTextValueAndAttributesToOptionMap(textNodeValue, node.getAttributes());

        return new TaxCompNode(node.getNodeName(), options, children);
    }

    private TaxLimit readLimit(Element el) {
        List<Element> limitChildren = getAllDirectChildElements(el);
        if (limitChildren.size() != 1) {
            throw new XmlProcessorException(
                    String.format("Limit requires exactly 1 child (got %d)", limitChildren.size()));
        }
        Map<String, String> limitAttributes = convertAttributesToOptionMap(el.getAttributes());
        String operation = limitAttributes.get(LIMIT_TYPE_ATTRIBUTE_NAME);
        if (operation == null) {
            throw new XmlProcessorException("Limit requires a \"type\" attribute");
        }
        String levelString = limitAttributes.get(LIMIT_LEVEL_ATTRIBUTE_NAME);
        TaxLimitLevel limitLevel = null;
        try {
            limitLevel = TaxLimitLevel.from(levelString);
        } catch (NullPointerException e) {
            throw new XmlProcessorException(String.format("Invalid limit level %s", levelString), e);
        }
        TaxCompNode limitChildCompNode = readCompNode(limitChildren.get(0));
        return new TaxLimit(operation, limitLevel, limitChildCompNode);
    }

    private Map<String, String> convertTextValueAndAttributesToOptionMap(String textVal, NamedNodeMap attributes) {
        Map<String, String> options = convertAttributesToOptionMap(attributes);

        String textValue = textVal.strip();
        if (!"".equals(textValue)) {
            options.put(TEXT_NODE_VALUE_NAME, textValue);
        }

        return options;
    }

    private Map<String, String> convertAttributesToOptionMap(NamedNodeMap attributes) {
        Map<String, String> options = new HashMap<>();

        if (attributes != null) {
            for (int i = 0; i < attributes.getLength(); i++) {
                Node currentNode = attributes.item(i);
                options.put(
                        currentNode.getNodeName(), currentNode.getNodeValue().strip());
            }
        }

        return options;
    }

    private Element getDirectChildElement(Element parent, String name) {
        for (Node child = parent.getFirstChild(); child != null; child = child.getNextSibling()) {
            if (child.getNodeType() == Node.ELEMENT_NODE && name.equals(child.getNodeName())) {
                return (Element) child;
            }
        }
        return null;
    }

    private List<Element> getAllDirectChildElements(Element parent) {
        ArrayList<Element> childElements = new ArrayList<>();
        if (parent == null) {
            return childElements;
        }
        for (Node child = parent.getFirstChild(); child != null; child = child.getNextSibling()) {
            if (child.getNodeType() == Node.ELEMENT_NODE) {
                childElements.add((Element) child);
            }
        }
        return childElements;
    }
}
