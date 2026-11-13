# Sentio consolidation implementation plan

Goal: one maintained CRM fork, one installed CRM app, GitHub-based deployment.
Approved direction: user requested marketing inside CRM and controlled upstream merges.

Architecture: preserve upstream crm package and migrations. Own features live in
crm/sentio; DocTypes retain their names under the Sentio module. Compose builds the
checked-out repository, with no secondary app fetch or manifest secret. GitHub
Actions builds and boots disposable test sites before publishing an image.

- [x] Move feature code, DocTypes, tests and web source page into CRM; merge hooks
  without replacing upstream handlers. Test imports, hook composition and module paths.
- [x] Add local-context Dockerfile, pinned Framework/base inputs, repository Compose,
  and explicit bootstrap/upgrade scripts. Preserve volume names; reject legacy dual-app sites.
- [x] Replace inherited image workflow with fork-aware build, runtime smoke/integration
  tests and versioned publication. Keep outbound off and use synthetic fixtures.
- [x] Run local checks, inspect build configuration, commit and push. Report runtime
  results only when actually observed. No production changes or customer sends.

Upstream policy: keep upstream remote, merge chosen stable releases on update branches;
rerun Sentio and upstream tests before releasing. No automatic production update.

Local verification: 358 frontend tests, 13 Python mail/consolidation tests,
16 marketing policy/adapter tests, 5 Node mail tests. Both Compose variants parse;
all 12 GitHub workflow YAML files parse. Real image/staging validation is tracked
by the Sentio GitHub Actions run; its current result must be checked independently.
The first real image build found a Research template compilation bug; the fix has
a regression test that failed before the correction and passed afterward.
