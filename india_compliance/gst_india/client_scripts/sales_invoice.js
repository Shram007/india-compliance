{% include "india_compliance/gst_india/client_scripts/taxes.js" %}
{% include "india_compliance/gst_india/client_scripts/einvoice.js" %}
{% include "india_compliance/gst_india/client_scripts/invoice.js" %}

const DOCTYPE = "Sales Invoice";

setup_auto_gst_taxation(DOCTYPE);
process_gst_category(DOCTYPE);
setup_einvoice_actions(DOCTYPE);
update_export_type(DOCTYPE);

frappe.ui.form.on(DOCTYPE, {
	setup: function(frm) {
		frm.set_query('transporter', function() {
			return {
				filters: {
					'is_transporter': 1
				}
			};
		});

		frm.set_query('driver', function(doc) {
			return {
				filters: {
					'transporter': doc.transporter
				}
			};
		});
	},

	refresh: function(frm) {
		if(frm.doc.docstatus == 1 && !frm.is_dirty()
			&& !frm.doc.is_return && !frm.doc.ewaybill) {

			frm.add_custom_button('e-Waybill JSON', () => {
				frappe.call({
					method: 'india_compliance.gst_india.utils.e_waybill.generate_ewb_json',
					args: {
						'dt': frm.doc.doctype,
						'dn': [frm.doc.name]
					},
					callback: function(r) {
						if (r.message) {
							const args = {
								cmd: 'india_compliance.gst_india.utils.e_waybill.download_ewb_json',
								data: r.message,
								docname: frm.doc.name
							};
							open_url_post(frappe.request.url, args);
						}
					}
				});

			}, __("Create"));
		}
	}

});
