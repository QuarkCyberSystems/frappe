frappe.provide("frappe.ui");
frappe.provide("frappe.web_form");

window.web_form = null;


frappe.ui.WebForm = class WebForm extends frappe.ui.FieldGroup {
	constructor(opts) {
		super();
		Object.assign(this, opts);
		window.web_form = this;
		frappe.web_form = this;
	}

	make() {
		super.make();
		this.set_field_values();
		if (this.allow_delete) this.setup_delete_button();
		this.setup_primary_action();
		$('.link-btn').remove();
	}

	on(fieldname, handler) {
		let field = web_form.fields_dict[fieldname];
		field.input.addEventListener('focus', () => handler(field, field.value))
	}

	set_field_values() {
		if (this.doc_name) this.set_values(this.doc);
		else return;
	}

	setup_primary_action() {
		const primary_action_button = document.createElement("button");
		primary_action_button.classList.add(
			"btn",
			"btn-primary",
			"primary-action",
			"btn-form-submit",
			"btn-sm",
			"ml-2"
		);
		primary_action_button.innerText = web_form.button_label || "Save";
		primary_action_button.onclick = () => this.save();
		document
			.querySelector(".web-form-actions")
			.appendChild(primary_action_button);
	}

	setup_delete_button() {
		const delete_button = document.createElement("button");
		delete_button.classList.add(
			"btn",
			"btn-secondary",
			"button-delete",
			"btn-sm",
			"ml-2"
		);
		delete_button.innerText = "Delete";
		delete_button.onclick = () => this.delete();
		document.querySelector(".web-form-actions").appendChild(delete_button);
	}

	save() {
		this.validate && this.validate()
		// Handle data
		let data = this.get_values();
		if (this.doc) {
			Object.keys(data).forEach(field => (this.doc[field] = data[field]));
			data = this.doc;
		}
		if (!data || window.saving) return;
		data.doctype = this.doc_type;

		// Save
		window.saving = true;
		frappe.form_dirty = false;

		frappe.call({
			type: "POST",
			method: "frappe.website.doctype.web_form.web_form.accept",
			args: {
				data: data,
				web_form: this.name
			},
			callback: response => {
				// Check for any exception in response
				if (!response.exc) {
					// Success
					this.handle_success(response.message);
				}
			},
			always: function() {
				window.saving = false;
			}
		});
		return true;
	}

	delete() {
		frappe.call({
			type: "POST",
			method: "frappe.website.doctype.web_form.webform.delete",
			args: {
				web_form_name: this.name,
				docname: this.doc.name
			}
		});
	}

	handle_success(data) {
		const success_dialog = new frappe.ui.Dialog({
			title: __("Saved Successfully"),
			secondary_action: () => {
				if (this.login_required) {
					if (this.route_to_success_link) {
						window.location.pathname = this.success_url;
					} else {
						window.location.href =
							window.location.pathname + "?name=" + data.name;
					}
				}
			}
		});

		const success_message =
			this.success_message || __("Your information has been submitted");
		success_dialog.set_message(success_message);
		success_dialog.show();
	}

};
