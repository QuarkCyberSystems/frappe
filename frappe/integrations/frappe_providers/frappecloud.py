import click
import requests
from html2text import html2text

import frappe


def frappecloud_migrator(local_site):
	print("Retreiving Site Migrator...")
	remote_site = frappe.conf.frappecloud_url or "frappecloud.com"
	request_url = "http://{}/api/method/press.api.script".format("gavin.frappe.cloud:8000")
	request = requests.get(request_url)

	if request.status_code / 100 != 2:
		print("Request exitted with Status Code: {}\nPayload: {}".format(request.status_code, html2text(request.text)))
		click.secho("Some errors occured while recovering the migration script. Please contact us @ Frappe Cloud if this issue persists", fg="yellow")
		return

	script_contents = request.json()["message"]

	import tempfile
	import os
	import sys

	py = sys.executable
	script = tempfile.NamedTemporaryFile(mode="w")
	script.write(script_contents)
	print("Site Migrator stored at {}".format(script.name))
	os.execv(py, [py, script.name, local_site])
