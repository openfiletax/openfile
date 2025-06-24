package gov.irs.directfile.pdftoyaml;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDCheckBox;
import org.apache.pdfbox.pdmodel.interactive.form.PDNonTerminalField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTerminalField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
import org.apache.pdfbox.pdmodel.interactive.form.PDXFAResource;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceCharacteristicsDictionary;
import org.apache.pdfbox.cos.COSDictionary;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import java.util.regex.Pattern;

public class PdfToYaml {
    private static final String AD_HOC_PARENT = "dfAdHocFields";

    private static final String newLine = System.getProperty("line.separator");

    private StringBuilder outputBuilder;
    private String pdfPathString;
    private String outputDirString;
    private OutputFormat outputFormat;
    private PDAcroForm form;
    private PDDocument document;

    private enum OutputFormat {
        PDF_FIELDS, // PDF with fields containing their name (text input added for each checkbox)
        MODIFIED_PDF, // PDF with text input added for each checkbox
        FORM_TEMPLATE, // YAML config format to map PDF field -> fact expression
        VALUE_MAP; // YAML expected values format for scenario tests
    }

    public PdfToYaml(final String pdfPathString, final String outputDirString, final OutputFormat outputFormat) {
        this.outputBuilder = new StringBuilder();
        this.pdfPathString = pdfPathString;
        this.outputDirString = outputDirString;
        this.outputFormat = outputFormat;
    }

    private String generateNameForCheckboxTextInput(final PDField checkboxField) {
        final String DOT_REPLACEMENT = "_DOT_";
        return checkboxField.getFullyQualifiedName().replaceAll(Pattern.quote("."), DOT_REPLACEMENT);
    }

    private void modifyPdfField(PDField field) {
        if (field instanceof PDCheckBox) {
            // For each form checkbox, we create an ad hoc text field to hold the mapping.

            // All ad hoc fields are under one parent nonterminal; find or create it.
            PDNonTerminalField adHocParent = (PDNonTerminalField) this.form.getField(AD_HOC_PARENT);
            if (adHocParent == null) {
                System.out.println("creating parent");
                adHocParent = new PDNonTerminalField(this.form);
                adHocParent.setPartialName(AD_HOC_PARENT);
                adHocParent.setFieldFlags(0);
                this.form.getFields().add(adHocParent);
            }

            // Create the ad hoc text field.
            final var newTextField = new PDTextField(this.form);
            newTextField.setPartialName(generateNameForCheckboxTextInput(field));
            newTextField.setDefaultAppearance("/HelveticaLTStd-Bold 8.00 Tf 0.000 0.000 0.502 rg");
            newTextField.setFieldFlags(0);

            // Use checkbox widget's settings for the new text widget.
            final PDAnnotationWidget checkboxWidget = field.getWidgets().get(0);
            final PDAnnotationWidget textWidget = newTextField.getWidgets().get(0);
            final PDRectangle rect = checkboxWidget.getRectangle();
            textWidget.setPrinted(true);
            textWidget.setPage(checkboxWidget.getPage());
            textWidget.setParent((PDTerminalField) field);

            // Set placement and appearance of the new text widget.
            textWidget.setRectangle(new PDRectangle(rect.getLowerLeftX() - 4, rect.getLowerLeftY() - 4, 16, 16));
            final var appearance = new PDAppearanceCharacteristicsDictionary(new COSDictionary());
            appearance.setBorderColour(new PDColor(new float[] { 0, 0, 1 }, PDDeviceRGB.INSTANCE));
            appearance.setBackground(new PDColor(new float[] { 1, 1, 1 }, PDDeviceRGB.INSTANCE));
            textWidget.setAppearanceCharacteristics(appearance);
            if (this.outputFormat == OutputFormat.PDF_FIELDS) {
                try {
                    newTextField.setValue(field.getFullyQualifiedName());
                } catch (IOException e) {
                    System.err.println("Error setting value of ad hoc text field " + e.getMessage());
                }
            }

            // Integrate the new text field and widget into the page and form.
            try {
                checkboxWidget.getPage().getAnnotations().add(textWidget);
            } catch (IOException e) {
                System.err.println("Error creating PDF annotations list: " + e.getMessage());
                System.exit(5);
            }
            final var kids = adHocParent.getChildren();
            kids.add(newTextField);
            adHocParent.setChildren(kids);
        } else if (field instanceof PDTextField) {
            // Ensure we can enter the full fact expression.
            if (((PDTextField) field).getMaxLen() >= 0) {
                ((PDTextField) field).setMaxLen(9999);
            }
            if (this.outputFormat == OutputFormat.PDF_FIELDS) {
                try {
                    field.setValue(field.getFullyQualifiedName());
                } catch (IOException e) {
                    System.err.println("Error setting value of text field " + e.getMessage());
                }
            }
        }
    }

    // Write flat map YAML entry `fullyQualifiedFieldName: "valueAsQuotedString"`
    // Multiline string values will be collapsed with pipe separators.
    // This is the format used in PDF scenario test snapshots.
    private void writeFieldValueMapEntry(final PDField field) {
        if (field instanceof PDNonTerminalField)
            return;
        final String fieldValue = "\"" + field.getValueAsString().replace(newLine, "|") + "\"";
        this.outputBuilder.append(String.format("%s: %s%s", field.getFullyQualifiedName(), fieldValue, newLine));
    }

    // Write indented, commented YAML entry
    // This is the format used for the `form:` key value in PDF configuration.yml files
    // Terminals *and all their ancestor keys* should be uncommented when manually mapped to a fact expression.
    private void writeFormTemplateEntry(final int level, final PDField field) {
        String value = field instanceof PDNonTerminalField ? "" : field.getValueAsString();
        if (field instanceof PDCheckBox) {
            // See if a text input was created to map this checkbox.
            final PDField textField = this.form.getField(AD_HOC_PARENT + "." + generateNameForCheckboxTextInput(field));
            if (textField != null) {
                value = textField.getValueAsString();
            }
        }

        final String indent = "  ".repeat(level + 1);
        this.outputBuilder
                .append(String.format("%s# %s: %s%s", indent, field.getPartialName(), value, newLine));
    }

    private void walkFields(final int level, final List<PDField> fields) {
        for (final PDField field : fields) {
            switch (this.outputFormat) {
                case PDF_FIELDS:
                case MODIFIED_PDF:
                    this.modifyPdfField(field);
                    break;
                case FORM_TEMPLATE:
                    this.writeFormTemplateEntry(level, field);
                    break;
                case VALUE_MAP:
                    this.writeFieldValueMapEntry(field);
                    break;
                default:
                    System.err.println("Unknown output format " + this.outputFormat.toString());
                    System.exit(1);
            }

            if (field instanceof PDNonTerminalField && !field.getPartialName().equals(AD_HOC_PARENT)) {
                this.walkFields(level + 1, ((PDNonTerminalField) field).getChildren());
            }
        }
    }

    public void writeOutput() {
        final Path inputPath = Path.of(this.pdfPathString);
        if (!Files.exists(inputPath)) {
            System.err.println(String.format("Could not find pdf at path %s", this.pdfPathString));
            System.exit(2);
        }

        final Path outputPath = Path.of(this.outputDirString);
        if (Files.notExists(outputPath)) {
            try {
                Files.createDirectory(outputPath);
            } catch (IOException e) {
                System.err.println(String.format("Could not find output directory %s and could not create it",
                        this.outputDirString));
                System.exit(3);
            }
        }

        final String outputFilename = (this.outputFormat == OutputFormat.PDF_FIELDS
                || this.outputFormat == OutputFormat.MODIFIED_PDF)
                        ? this.outputDirString + Path.of(this.pdfPathString).getFileName().toString()
                        : Path.of(this.pdfPathString).getFileName().toString().replace(".pdf", ".yml");

        if ((this.outputFormat == OutputFormat.MODIFIED_PDF || this.outputFormat == OutputFormat.PDF_FIELDS)
                && outputFilename.equals(this.pdfPathString)) {
            System.err.println("Cannot overwrite PDF file(s) in place.");
            System.exit(4);
        }

        try {
            this.document = Loader.loadPDF(Files.newInputStream(Path.of(this.pdfPathString)).readAllBytes());
            PDDocumentCatalog catalog = this.document.getDocumentCatalog();
            this.form = catalog.getAcroForm();
            List<PDField> fields = form.getFields();

            // Workaround when IRS PDFs contain XFA scripts that prevent editing with
            // Acrobat:
            // 1. Comment out the following statement and recompile this tool.
            // 2. Run the tool on the IRS PDF with the `--modified-pdf` flag.
            // 3. With the `walkFields` call disabled, the only change is to remove the XFA
            // scripts.
            // 4. The resulting PDF should be editable with Acrobat.
            this.walkFields(0, fields);

            if (this.outputFormat == OutputFormat.PDF_FIELDS || this.outputFormat == OutputFormat.MODIFIED_PDF) {
                // Remove scripting from the PDF.
                this.form.setXFA(new PDXFAResource(new COSDictionary()));
                this.document.save(outputFilename);
            } else if (this.outputFormat == OutputFormat.FORM_TEMPLATE) {
                Files.writeString(Path.of(this.outputDirString, outputFilename),
                        String.format("form:%s%s", newLine, this.outputBuilder.toString()));
            } else {
                Files.writeString(Path.of(this.outputDirString, outputFilename), this.outputBuilder.toString());
            }
        } catch (IOException e) {
            System.err.println(String.format("Error generating file %s: %s", outputFilename, e.getMessage()));
        }
    }

    private static void printUsageAndExit() {
        System.err.println("Usage:");
        System.err.println(
                "Argument 1: path to PDF(s). `./file` processes PDF `file`; `./dir/` processes *.pdf in `dir`");
        System.err.println("Argument 2: output directory.");
        System.err.println(
                "Argument 3: output format. `--value-map`, `--form-template`, `--modified-pdf`, or `--pdf-fields");
        System.exit(1);
    }

    public static void main(final String[] args) throws IOException {
        if (args.length != 3) {
            printUsageAndExit();
        }

        final String pathToPdfsArg = args[0];
        final String outputDirArg = args[1] + (args[1].endsWith("/") ? "" : "/");
        OutputFormat _outputFormat = null;
        try {
            _outputFormat = OutputFormat.valueOf(args[2].replace("--", "").replace("-", "_").toUpperCase());
        } catch (IllegalArgumentException e) {
            printUsageAndExit();
        }

        final OutputFormat outputFormat = _outputFormat;
        if (pathToPdfsArg.endsWith("/")) {
            // Treat arg as a directory; process all PDFs in it.
            try (Stream<Path> files = Files.list(Path.of(pathToPdfsArg))) {
                files.filter(file -> !Files.isDirectory(file))
                        .map(Path::getFileName)
                        .filter(path -> path.toString().endsWith(".pdf"))
                        .forEach(path -> new PdfToYaml(pathToPdfsArg + path.toString(), outputDirArg, outputFormat)
                                .writeOutput());
            }
        } else {
            // Treat arg as a single PDF to process.
            new PdfToYaml(pathToPdfsArg, outputDirArg, outputFormat).writeOutput();
        }
    }
}
