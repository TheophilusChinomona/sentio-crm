"""Concurrent service startup must preserve the configurator-owned asset link."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class EntrypointTests(unittest.TestCase):
	def test_concurrent_runtime_starts_do_not_mutate_shared_assets(self):
		with tempfile.TemporaryDirectory() as folder:
			bench = Path(folder)
			(bench / "sites").mkdir()
			(bench / "assets").mkdir()
			link = bench / "sites/assets"
			link.symlink_to(bench / "assets", target_is_directory=True)
			inode = link.lstat().st_ino
			script = bench / "entrypoint.sh"
			script.write_text(
				(ROOT / "deploy/entrypoint.sh").read_text().replace("/home/frappe/frappe-bench", str(bench))
			)

			def start(_):
				return subprocess.run(["bash", str(script), "true"], capture_output=True, text=True)

			with ThreadPoolExecutor(max_workers=8) as pool:
				results = list(pool.map(start, range(16)))
			self.assertTrue(all(r.returncode == 0 for r in results), [r.stderr for r in results])
			self.assertEqual(link.lstat().st_ino, inode)
			self.assertEqual(list((bench / "assets").iterdir()), [])
