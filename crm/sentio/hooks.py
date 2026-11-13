"""Sentio hook additions; upstream handlers are preserved."""

doc_events = {
	"Sentio Prospect": {"validate": "crm.sentio.events.validate_prospect"},
	"Sentio Marketing Settings": {"validate": "crm.sentio.events.validate_settings"},
	"Sentio Evidence": {"validate": "crm.sentio.events.validate_evidence"},
	"Sentio Email Draft": {"validate": "crm.sentio.events.validate_draft"},
	"Sentio Suppression": {"validate": "crm.sentio.events.validate_suppression"},
	"Communication": {
		"before_insert": "crm.sentio.events.guard_communication",
		"after_insert": "crm.sentio.events.record_reply",
	},
	"Email Queue": {"validate": "crm.sentio.events.guard_queue"},
}

extend_doctype_class = {"Email Queue": ["crm.sentio.outbound.ReviewedQueueMixin"]}


def merge_events(existing):
	result = {dt: dict(events) for dt, events in existing.items()}
	for dt, events in doc_events.items():
		target = result.setdefault(dt, {})
		for event, handler in events.items():
			previous = target.get(event, [])
			target[event] = ([previous] if isinstance(previous, str) else list(previous)) + [handler]
	return result
