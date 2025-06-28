const { pdf_options, footerTemplate } = require("./md-to-pdf.config.js");

module.exports = {
	pdf_options: {
		format: pdf_options.format,
		headerTemplate: pdf_options.headerTemplate,
		footerTemplate: footerTemplate.replace('[[FOOTER]]', 'OS:IT:AD:CS-PLN-DFSYS_CM_PLAN-V1.0-03052024')
	},
	// https://github.com/simonhaenisch/md-to-pdf/issues/247
	launch_options: {
		headless: "new"
	}
};
