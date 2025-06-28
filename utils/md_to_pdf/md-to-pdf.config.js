const headerTemplate = `
<style>
section {
	margin: 0 auto;
	font-family: system-ui;
	font-size: 12px;
}
.footer div {
	position: absolute;
	width: 50%;
	bottom: 30px;
}
</style>
<section><div>[[HEADER]]</div></section>
`
const footerTemplate = '<section class="footer"><div style="left: 30px;">[[FOOTER]]</div><div style="text-align: right; right: 30px;"><span class="pageNumber"></span></div></section>';

module.exports = {
	headerTemplate: headerTemplate,
	footerTemplate: footerTemplate,
	pdf_options: {
		format: 'letter',
		headerTemplate: headerTemplate.replace('[[HEADER]]', ''),
		footerTemplate: footerTemplate.replace('[[FOOTER]]', 'Draft/Pre-decisional')
	},
	// https://github.com/simonhaenisch/md-to-pdf/issues/247
	launch_options: {
		headless: "new"
	}
};
