const { pdf_options, footerTemplate } = require("./md-to-pdf.config.js");

module.exports = {
	pdf_options: {
		format: pdf_options.format,
		headerTemplate: pdf_options.headerTemplate,
		footerTemplate: footerTemplate.replace('[[FOOTER]]', 'OS:IT:AD:CS-SYS-DFSYS_COH-V0.9-01052024')
	},
	// https://github.com/simonhaenisch/md-to-pdf/issues/247
	launch_options: {
		headless: "new"
	}
};
