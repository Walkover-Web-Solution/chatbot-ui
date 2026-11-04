---
covers: ["public/rag-*.js", "public/rag.css", "app/rag/**", "config/ragApi.ts"]
verified_at: c7ace0c
verified_on: 2026-10-20
---
# RAG knowledge-base embed

A GTWY customer puts `public/rag-prod.js` on their own page so their users can manage documents in a GTWY knowledge base (KB). The script draws a document list on the host page and opens an iframe on this app's `/rag` route (`app/rag/page.tsx:RagComponent`), which holds the create/edit form. The two sides talk only through `postMessage`. This feature does not use the chatbot loader, the Redux store or the chat iframe.

| File | Role |
|---|---|
| `public/rag-prod.js` | Host-page loader. An IIFE with class `RagEmbedManager`: reads the `<script id="rag-main-script">` attributes, logs in with the embed token, fetches and renders the document list, opens the `/rag` iframe as a modal, sets `window` globals |
| `public/rag-dev.js`, `public/rag-local.js` | Hand-kept copies of `public/rag-prod.js`. Only the four `this.urls` values differ (see [Env copies](#env-copies)) |
| `public/rag.css` | Host-side styles for the list, overlay, iframe modal, toasts and the per-document menu. The script injects it as `<link id="rag-embed-styles">` from `urls.cssURL` |
| `app/rag/page.tsx` | `RagComponent`: the form inside the iframe (create from URL, uploaded file or pasted content; edit; delete). Reports results to the host with `postMessage` |
| `config/ragApi.ts` | KB CRUD calls on `NEXT_PUBLIC_API_BASE_URL` through the shared axios instance in `utils/interceptor.ts` |

Related code outside the globs: `config/api.ts:uploadImage` (file upload), `utils/interceptor.ts` (picks the `Authorization` header), `utils/errorFormatter.ts:formatErrorMessage`, `utils/enums.ts:KNOWLEDGE_BASE_CUSTOM_SECTION` (chunking options), `components/customToast.js` (toasts inside the iframe). Routes and the full postMessage table live in [api](../api.md); env vars in [environment](../environment.md).

## How it works

### Host side (`public/rag-prod.js`)

1. On load the IIFE creates one `RagEmbedManager`. Its constructor calls `initializeEventListeners`: `loadCSS`, `observeScriptChanges` (a `MutationObserver` on `document.head` that re-reads props when a `rag-main-script` tag is added and calls `cleanupRag` when it is removed), `setupMessageListeners` and `initialiseMessageListeners` (two separate `message` listeners, below), and `setupResizeObserver`. The IIFE then sets the `window` globals and calls `initializeRag`.
2. `initializeRag` runs `loadContent` now if `document.body` exists, and again on `DOMContentLoaded` (guarded by `state.bodyLoaded`). `loadContent`:
   - creates the overlay `#rag-modal-overlay` (`createModalOverlay`; a click on the overlay calls `closeRag`);
   - reads the script attributes with `extractScriptProps` into `this.props` and `state.tempDataToSend`;
   - creates `#rag-iframe-parent-container` with the iframe `#iframe-component-ragInterfaceEmbed` (`createIframeContainer`). `changeContainer` mounts it inside the element named by `parentId` if it exists (sets `state.isEmbeddedInParent = true`), otherwise in `body`;
   - builds the list `#rag-document-list-modal` (`createDocumentListModal`) and appends it to the `parentId` element (embedded) or to `body` (popup);
   - calls `loadRagEmbed`.
3. `loadRagEmbed`: if an `embedToken` is set, `authenticateUser` does `GET urls.login` with header `Authorization: <embedToken>` and keeps `data.data.token || data.accessToken` in `this.token`. Then it sets `iframe.src = urls.ragUrl` and waits for `onload` (10 s timeout). On load it calls `sendInitialData`.
4. `sendInitialData` posts `INITIAL_CONFIG` once per iframe load (guarded by `iframe.dataset.initialDataSent`). If `defaultOpen` is `"true"`, it also calls `showDocumentList` once.
5. `showDocumentList` → `fetchDocuments` (`GET urls.docsApi`, header `Authorization: this.token`) → `renderDocumentList`. Each row (`createDocumentItem`) shows an icon by `source.fileFormat`, `name || title`, the first 20 words of `description`, created date, `source.type` and URL, and `settings.strategy` / `chunkSize` / `chunkOverlap`. Its "..." menu has Edit and Delete.
   - Embedded: the list replaces the iframe container in the parent (`display: none` on the container) and is capped at the parent's `clientHeight`.
   - Popup: the list is a fixed full-screen overlay with a close button.
6. Actions:
   - "+ Add New Document" → `openRag` → `openModal({height: '64vh'})` → moves the iframe container to `body`, styles it as a centred fixed modal (`configureModalContainer`), and posts `OPEN_ADD_DOCUMENT` to the iframe.
   - Edit → `openEditDocumentModal` → `openModal({height: '52vh', isEditMode: true})` → `waitForIframeReadyAndSendEdit` sends `EDIT_DOCUMENT` (polls 5 × 200 ms, plus a one-time iframe `load` listener as backup, so the message can arrive two or three times).
   - Delete → `confirmDeleteDocument` → browser `confirm()` → `DELETE_DOCUMENT` to the iframe, which does the API call. The list refreshes after 1 s.
7. `closeRag` (overlay click, `closeRag`/`CLOSE_RAG` message, or the global) fades the modal out. If the container came from a `parentId` element (`dataset.wasEmbedded`), it moves it back there.
8. `showMessage(type, text)` appends a `div.success-message` / `.error-message` / `.warning-message` to `body` and removes it after 5 s. These are the host-side toasts.

### Iframe side (`app/rag/page.tsx`)

1. On mount it posts `{ type: "ragLoaded" }` to the parent. The host answers with `INITIAL_CONFIG` if it has not sent it yet.
2. `INITIAL_CONFIG` → `setConfiguration(data)`. An effect writes `configuration.token` to sessionStorage key `ragToken` (`utils/ChatbotUtility.ts:SetSessionStorage`; `/rag` has no `interfaceDetails`, so the key is not namespaced). From then on `utils/interceptor.ts` sends it as `Authorization` on every axios request whose URL contains `rag`, and on `image` URLs.
3. Fields used from `configuration`: `theme` (`dark` switches Tailwind classes), `chunkingType` (initial select value, default `recursive`), `chunkSize` (default field value `4000`), `chunkOverlap` (default `200`), `hideConfig` (`"true"` hides the chunking section).
4. Create (`handleSave`, no `editingKnowledgeBase`):
   - Input type radio: URL, Upload File, Content. Upload File calls `config/api.ts:uploadImage` straight away (`POST ${NEXT_PUBLIC_PYTHON_API_BASE_URL}/image/processing/upload` for PDF/video, `/image/processing/` otherwise) and keeps the returned `url`. Accepted extensions: `.pdf,.doc,.docx,.txt,.csv`.
   - Description is required (toast "Description is required"; commit 0dfba68).
   - `settings.strategy` = chunking type. `settings.chunkSize` = the `chunk_size` field or `configuration.chunkSize`. `settings.chunkOverlap` is sent only when the strategy is `semantic`.
   - `collection_details` = the "Query Access Type" radio in Advanced Settings: `fastest` (default), `moderate`, `high_accuracy`.
   - `createKnowledgeBaseEntry(payload)`; success means `response.data` is truthy.
5. Edit (`EDIT_DOCUMENT` → `setEditingKnowledgeBase` + `populateFormForEdit`): name and description are editable; a URL resource shows the URL read-only; a content resource shows editable content. Input type, chunking and Advanced Settings are hidden. Save calls `updateKnowBaseData` with `{ name, title, content? }`.
6. Delete (`DELETE_DOCUMENT`) → `handleDeleteKnowledgeBase(document._id)` → `deleteKnowBaseData`.
7. After a successful create, update or delete the page posts a `rag` message, then `handleClose` resets the form and posts `closeRag`. Failures post `iframe-message-rag` with a string `error` (from `formatErrorMessage`). The host shows the success or error toast, and refreshes the list when it is embedded or `defaultOpen` is set (commit 5c686c6).

## Contracts

### Script tag

```html
<script id="rag-main-script" src="https://chatbot.gtwy.ai/rag-prod.js"
        embedToken="<GTWY RAG embed token>" parentId="kb-div"
        theme="dark" chunkingType="semantic" hideConfig="true" defaultOpen="true"></script>
```

- The `id` must be `rag-main-script`; `extractScriptProps` finds the tag by that id.
- Attributes read: `embedToken`, `chunkingType`, `hideConfig`, `listPage`, `onOpen`, `onClose`, `className`, `parentId`, `config`, `hideIcon`, `theme`, `defaultOpen`. All values are strings.
- Used by the host script: `embedToken`, `parentId`, `theme` (list class `rag-theme-<theme>`), `defaultOpen`, `hideIcon`. Used by the iframe: `theme`, `chunkingType`, `hideConfig`. `listPage`, `onOpen`, `onClose`, `className` and `config` are forwarded in `INITIAL_CONFIG` but nothing reads them.
- `chunkSize` and `chunkOverlap` are not script attributes. They reach the iframe only through `INITIAL_CONFIG`, so in practice only through `ragEmbed.updateConfig` before the first load (see Gotchas).

### Window globals (host page)

| Global | Effect |
|---|---|
| `window.RagEmbedManager` | the manager instance (not the class) |
| `window.ragEmbed` | `{ openRag, closeRag, showDocuments, closeDocuments, updateConfig, destroy }` |
| `window.openRag`, `window.closeRag`, `window.showDocuments`, `window.closeDocuments`, `window.updateConfig`, `window.destroy` | the same functions as bare globals |

### Messages this area sends and handles

Full table with payloads: [api](../api.md). Neither side checks `event.origin`, and every `postMessage` uses target origin `"*"`.

| Direction | `type` | Payload / effect |
|---|---|---|
| host → iframe | `INITIAL_CONFIG` | `{ ...scriptAttrs, token, isEmbedded, timestamp }` |
| host → iframe | `OPEN_ADD_DOCUMENT` | `{ action: 'add_new', token }` → form reset |
| host → iframe | `EDIT_DOCUMENT` | `{ action: 'edit', document, token, timestamp }` |
| host → iframe | `DELETE_DOCUMENT` | `{ action: 'delete', document, token, timestamp }` → delete by `document._id` |
| iframe → host | `ragLoaded` | host sends `INITIAL_CONFIG` if not yet sent |
| iframe → host | `rag` | `{ status: 'create' \| 'update' \| 'delete', data }` on success |
| iframe → host | `iframe-message-rag` | `{ status: 'create' \| 'delete', error: string }` on failure (update failures also use `status: 'create'`) |
| iframe → host | `closeRag` | host closes the modal; `CLOSE_RAG` is accepted too |
| any → host | `OPEN_RAG`, `SHOW_DOCUMENT_LIST` | `openRag()` / `showDocumentList()` |
| host → `window.parent` | `open`, `close` | `{ data: {} }` when the modal opens or closes. On a top-level page `window.parent` is the page itself |

`sendMessageToIframe` adds `data.token` and `data.timestamp` to every message and posts it after a 500 ms delay. `OPEN_ADD_DOCUMENT` is posted directly, without the delay.

### KB API (`config/ragApi.ts`)

| Function | Request | Auth |
|---|---|---|
| `createKnowledgeBaseEntry(data)` | `POST ${NEXT_PUBLIC_API_BASE_URL}/api/rag/resource`, JSON body | `Authorization: <ragToken>` (interceptor) |
| `getAllKnowBaseData()` | `GET .../api/rag/resource` | same. Not called anywhere; the host script fetches the list itself |
| `updateKnowBaseData({id, data})` | `PUT .../api/rag/resource/:id` | same |
| `deleteKnowBaseData({id})` | `DELETE .../api/rag/resource/:id`, body `{ id }` | same |

Host script (`this.urls`): `login` = `GET <db host>/api/rag/embed/login` with `Authorization: <embedToken>`; `docsApi` = `GET <db host>/api/rag/resource` with `Authorization: <token from login>`. `createKnowledgeBaseEntry` and `getAllKnowBaseData` return the axios error instead of throwing; `updateKnowBaseData` and `deleteKnowBaseData` rethrow.

```ts
// create payload built by handleSave (app/rag/page.tsx)
{
  title: string,                      // "Knowledge Base Name" field
  description: string,                // required
  settings: { strategy: "auto"|"semantic"|"manual"|"recursive"|string,
              chunkSize?: number, chunkOverlap?: number /* semantic only */ },
  collection_details: "fastest"|"moderate"|"high_accuracy",
  url?: string,                       // URL input, or the uploaded file's URL
  content?: string                    // only for the Content input type
}
// update payload: { name: undefined, title, content? }
// document as the host renders it (fields read by createDocumentItem / page.tsx)
{ _id, name?, title?, description?, createdAt?, content?, url?,
  source?: { type, fileFormat?, data: { url? } },
  settings?: { strategy?, chunkingType?, chunkSize?, chunkOverlap? } }
```

## Gotchas

> [!WARNING]
> **Generic globals.** The script assigns `window.destroy`, `window.updateConfig`, `window.openRag`, `window.closeRag`, `window.showDocuments` and `window.closeDocuments` with no prefix and no check for existing values. Any host function with those names is silently overwritten (and the host can overwrite ours). Use `window.ragEmbed.*` in examples and new code.

> [!WARNING]
> **No origin checks, `"*"` targets.** Both `message` listeners in the host script accept any sender, so any frame on the page can post `OPEN_RAG`, `CLOSE_RAG` or a fake `rag` success. Every host → iframe message carries the KB `token` and is posted with target `"*"`. The iframe posts KB results to `"*"` too. Compare `public/chatbot.js`, whose listener checks a trusted-origin list.

> [!WARNING]
> **`updateConfig` does nothing after the first load.** `updateConfiguration` merges props, then calls `sendInitialData`, which returns early once `iframe.dataset.initialDataSent === 'true'`. To push new `chunkSize`/`theme` to a loaded iframe, the guard has to be reset.

> [!WARNING]
> **Duplicate `destroy()`.** `RagEmbedManager` defines `destroy` twice. The second one (only `cleanupRag`) wins, so the observer and listener cleanup in the first one never runs. The iframe container and overlay are also left in the DOM.

> [!WARNING]
> **Edit drops the description.** `handleSave` builds the update body from `payload.name` (always `undefined`) and `payload.title`; the edited description is never sent, although the form lets the user change it and the host then shows "Document updated successfully".

> [!WARNING]
> **Create loses server error details.** `createKnowledgeBaseEntry` returns the axios error instead of throwing, so `handleSave` sees no `response.data` and throws `"Failed to create document"`. The host toast shows that text, not the backend's message. Delete and update errors do carry the formatted backend message.

> [!WARNING]
> **Dedupe of identical messages.** `handleIncomingMessages` ignores a message whose `JSON.stringify` equals the last one processed (`lastProcessedMessage`). Two identical `OPEN_RAG` (or `closeRag`) messages in a row are handled once.

> [!WARNING]
> **Broken error paths in the host script.** `loadRagEmbed` calls `this.showErrorMessage`, which does not exist, so a load failure throws a `TypeError` from the `catch`. `showDocumentList` calls `showMessage(this.messageHandler.error, …)`, giving the toast class `undefined`, so the "Failed to load documents" toast has no styles. Without `embedToken`, `fetchDocuments` throws "User token not available" and the list never renders.

> [!WARNING]
> **Interceptor matches on substrings.** `utils/interceptor.ts` sends `ragToken` for any URL containing `rag` (also `storage`, `drag`, …) and for `image` URLs when a `ragToken` exists. A 401 on any of these clears localStorage and redirects the iframe to `/error?error=session+expired`.

> [!WARNING]
> **Custom chunking is half-wired.** The chunking select offers only `auto`, `semantic`, `manual` and `recursive`. A host `chunkingType="custom"` shows a "Chunking URL" field (`chunkingUrl`) that `handleSave` never reads. The overlap field shows for `semantic` and `auto`, but `chunkOverlap` is sent only for `semantic`.

Smaller ones:
- `#ragInterfaceEmbed` (a launcher icon) is shown and hidden by `openModal`/`closeRag` but nothing creates it; `hideIcon` only matters if the host page adds an element with that id.
- After Delete the host refreshes after a fixed 1 s, but the delete message itself is posted after 500 ms and then makes an API call, so the refreshed list can still show the deleted row in popup mode. The `rag`-message refresh only happens when embedded or `defaultOpen`.
- `rag.css` has global, unprefixed selectors (`.error-message`, `.success-message`, `.warning-message`, `.ellipsis-btn`, `.ellipsis-menu`, `.menu-item`, `@keyframes slideIn`/`fadeOut`) that can restyle host elements with the same class names. The list rules are scoped under `#rag-document-list-modal`.
- Each document row adds its own `document` click listener to close its menu and never removes it; refreshing the list many times piles them up.
- `uploadImage` returns `null` after its own error toast; `handleFileUpload` then fails on `response.url` and shows a second toast.
- The upload hint says ".pdf, .doc, .docx, .txt" while `accept` also allows `.csv`. `VALID_FILE_TYPES` is declared but unused.

## Env copies

`public/rag-dev.js` and `public/rag-local.js` match `public/rag-prod.js` except for `this.urls` (and one missing comment line in the dev copy). There is no behaviour drift at c7ace0c.

<!-- verify:ignore-start -->
| `this.urls` key | prod | dev | local |
|---|---|---|---|
| `ragUrl` | https://chatbot.gtwy.ai/rag | https://dev-chatbot.gtwy.ai/rag | http://localhost:3001/rag |
| `login` | https://db.gtwy.ai/api/rag/embed/login | https://dev-db.gtwy.ai/api/rag/embed/login | http://localhost:7072/api/rag/embed/login |
| `docsApi` | https://db.gtwy.ai/api/rag/resource | https://dev-db.gtwy.ai/api/rag/resource | http://localhost:7072/api/rag/resource |
| `cssURL` | https://chatbot.gtwy.ai/rag.css | https://dev-chatbot.gtwy.ai/rag.css | http://localhost:3001/rag.css |
<!-- verify:ignore-end -->

The iframe app's own API host comes from `NEXT_PUBLIC_API_BASE_URL` at build time, not from the script. The `login`/`docsApi` host in the script and `NEXT_PUBLIC_API_BASE_URL` of the deployment it loads must point at the same backend, or the list and the form will show different KBs.

## Unmerged and disabled work

- **Chunk size / overlap limits (PR #257, #263).** PR #257 (merged into `main` on 2026-09-18, commit 85806a8) caps chunk size at 4000 and overlap at 200 in `app/rag/page.tsx`, clamps the inputs on typing with a `warningToast`, and clamps again in `handleSave`. It is **not** in `testing` at c7ace0c; PR #263 (same change into `testing`) is open. At c7ace0c the inputs only have `min` (1 and 0) and no maximum. When it lands, the constants are `MAX_CHUNK_SIZE` and `MAX_CHUNK_OVERLAP` at the top of the page. <!-- verify:ignore -->
- **Google Drive via viaSocket.** Branch RAG_drive_support (commit 1e7470d, 2025-06) added a "Connect Drive Documents" button: `getEmebedToken` (`GET ${NEXT_PUBLIC_API_BASE_URL}/api/rag/get-emebed-token`) fetched a viaSocket embed token, the page loaded viaSocket's embed script with a fixed template id, and a `message` from viaSocket's embed frontend with `action: "published"` created a KB entry from its webhook URL. It was reverted on 2025-07-09 (ba3653f), and on `testing` the code remains only as comments in `app/rag/page.tsx`. `config/api.ts:getEmebedToken` is still exported and imported but not called.

> [!TODO] Needs a human: is Drive support (viaSocket) planned to return, or can the commented-out code and `getEmebedToken` be deleted?

## Why it is built this way

- **Separate ids from the chatbot loader.** The iframe container was renamed from `iframe-parent-container` to `rag-iframe-parent-container` (commit 8fa6fde) because a page with both `chatbot.js` and the RAG script ended up with two elements with one id. Keep every RAG DOM id prefixed with `rag-`.
- **The list lives on the host page.** The document list is host DOM, not part of the iframe, and grows inside the customer's `parentId` element; `createDocumentListModal` inspects the parent's height constraints and changes its height and overflow to match. Commit c8014a6 (PR #87) fixed a bug where it changed the CSS of several ancestors; the code now touches only the immediate parent ("NO LOOP, NO TRAVERSAL" comment). Don't add ancestor traversal back.
- **`Authorization` header.** The host and the interceptor sent a `Proxy_auth_token` header until 6dd6615 (2025-12-02) moved both to `Authorization`. Change them together. <!-- verify:ignore -->
- **`/api/rag/resource`.** Commit 28c1c84 (2026-01-06) moved every KB call to `/api/rag/resource` and `/api/rag/resource/:id` and update from PATCH to PUT. Commit 9901612 then replaced the multipart form with JSON (`title`, `settings.strategy`, `collection_details`) and added the URL / file / content input types to "match frontend" (the GTWY frontend's knowledge-base modal, per the commit and a comment in `handleFileUpload`).
- **Error strings, not objects.** Commit 0dfba68 (PR #179, "resolve … error toast") made the iframe send `error` as a string built by `utils/errorFormatter.ts:formatErrorMessage`, and the host format it again before showing it. The host script has its own copy of `formatErrorMessage` inside the IIFE, since `public/` files are served as-is with no bundler; a separate `public/` error-formatter file was removed in the same PR. Keep the two copies in step.

> [!TODO] Needs a human: which backend repo and route owns `/api/rag/embed/login` and `/api/rag/resource`, and is the 4000/200 chunk limit enforced there too?

## Changing it safely

1. Behaviour change in the host script: edit `public/rag-prod.js`, then apply the same edit to `public/rag-dev.js` and `public/rag-local.js`. Check with `diff public/rag-prod.js public/rag-dev.js`; only the four `this.urls` lines should differ.
2. New message type: add the case in `handleIncomingMessages` (host) or `handleMessage` (iframe), and add a row to [api](../api.md). Remember the 500 ms delay in `sendMessageToIframe` and the duplicate-message filter.
3. New script attribute: add it to the list in `extractScriptProps`, then read it from `configuration` in `app/rag/page.tsx` (it arrives via `INITIAL_CONFIG`).
4. New KB field: add it to the payload in `handleSave` and, for display, to `createDocumentItem` in all three scripts.
5. Host CSS lives in `public/rag.css` and is fetched from `urls.cssURL`, so a deployed script uses the CSS of the same environment. Prefix new classes with `rag-`.
6. Manual check: serve the app on port 3001, load `public/rag-local.js` from a test page with `embedToken` and once with and once without `parentId`, then create, edit and delete a document and watch the host toasts.
