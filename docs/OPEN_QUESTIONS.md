# Open questions

Questions the repository does not answer. An owner decides each one; when it is answered, update [VISION.md](VISION.md) or the linked doc and remove it here.

## Product vision (raised by the VISION.md draft at 0afde6f)

1. **Strategic priorities.** What are the product's top priorities for the chat embed and the RAG embed, in order?
2. **Success metrics.** Which measures define success (for example adoption by GTWY customers, conversation volume, reply latency, error rate), and where are they tracked? The repo has no analytics or error reporting.
3. **End-user needs.** Beyond what the code does, what must the chat offer the end users of a customer's site (accessibility, languages, mobile behaviour)?
4. **Admins and auditors.** Is any admin, audit or collaborator persona served by this repo, or does all of that live in the GTWY frontend?
5. **Differentiation.** What sets the GTWY chatbot apart from other embeddable AI chat widgets, as the product team sees it?
6. **No server code.** Is "browser-only, no server code" a lasting rule for this app, or only today's state?
7. **Non-goals.** Beyond the removed Hello widget mode and HTML rendering of AI text, which capabilities are deliberately out of scope (for example voice, human handoff, its own admin UI, analytics)?
8. **RAG embed's place.** Is the RAG knowledge-base embed a long-term part of this product, or is it hosted here only for convenience?
9. **Security posture.** Are the missing iframe origin checks and `"*"` postMessage targets accepted risks, or a direction to fix ([embed-scripts](modules/embed-scripts.md#gotchas))?

## Already recorded in the docs

The `[!TODO]` questions from the verified docs (deploy and branches, build checks, legacy files, backend contracts, rich UI, chat UI, RAG) are listed in [docs/README.md](README.md#needs-a-human), with links to the doc where each one is marked.
