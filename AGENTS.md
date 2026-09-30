<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- AI features call the Lovable AI Gateway through `src/lib/ai/gateway.server.ts` (server-only) and are exposed via `createServerFn` in `src/lib/felodesk.functions.ts` — keeps the API key and prompts off the client.
- Responses-API calls pass the system prompt as `providerOptions.openai.instructions`, never as a `system` message — the SDK rejects system messages on this endpoint.
- Design tokens (Kinetic Glass: navy canvas, cyan/violet ambient light, glass panels) live in `src/styles.css`; components use semantic tokens and the `glass`/`sheen`/`gradient-brand` utilities only.
