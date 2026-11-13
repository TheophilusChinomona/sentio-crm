import ast
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ConsolidationTests(unittest.TestCase):
	def test_marketing_is_inside_crm(self):
		self.assertTrue((ROOT / "crm/sentio/api.py").exists())
		for path in (ROOT / "crm/sentio/doctype").glob("*/*.json"):
			self.assertEqual(json.loads(path.read_text())["module"], "Sentio")
		self.assertEqual(len(list((ROOT / "crm/sentio/doctype").glob("*/*.json"))), 5)

	def test_single_app_build_uses_local_source(self):
		dockerfile = (ROOT / "deploy/Containerfile").read_text()
		self.assertIn("COPY --chown=frappe:0 . ", dockerfile)
		self.assertNotIn("apps_json", dockerfile)
		self.assertNotIn("sentio-marketing.git", dockerfile)

	def test_upstream_and_sentio_hooks_are_combined(self):
		hooks = (ROOT / "crm/hooks.py").read_text()
		self.assertIn("crm.utils.on_communication_insert", hooks)
		self.assertIn("crm.sentio.hooks", hooks)
		ast.parse(hooks)

	def test_no_legacy_package_imports(self):
		for path in (ROOT / "crm/sentio").rglob("*.py"):
			self.assertNotIn("from sentio_marketing", path.read_text(), str(path))


if __name__ == "__main__":
	unittest.main()


class HookCompositionTests(unittest.TestCase):
	def test_merging_keeps_existing_handlers_and_adds_sentio(self):
		from crm.sentio.hooks import merge_events

		original = {
			"Communication": {
				"after_insert": ["upstream.first", "upstream.second"],
				"on_change": "upstream.change",
			}
		}
		result = merge_events(original)
		self.assertEqual(
			result["Communication"]["after_insert"],
			["upstream.first", "upstream.second", "crm.sentio.events.record_reply"],
		)
		self.assertEqual(result["Communication"]["before_insert"], ["crm.sentio.events.guard_communication"])
		self.assertEqual(result["Communication"]["on_change"], "upstream.change")
		self.assertEqual(original["Communication"]["after_insert"], ["upstream.first", "upstream.second"])

	def test_all_feature_calls_use_new_namespace(self):
		for path in (ROOT / "crm/sentio").rglob("*"):
			if path.suffix in (".py", ".js", ".json"):
				self.assertNotIn("sentio_marketing.api", path.read_text(), str(path))
