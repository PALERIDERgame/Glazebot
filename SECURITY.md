# Security Policy

## Reporting Issues

If you find a security issue in this project, please open a private report or contact the repository owner directly rather than filing a public issue with exploit details.

## Secret Handling

- Keep `GROQ_API_KEY` and any future provider credentials on the server only.
- Never commit `.env` files, generated bundles, local Expo state, or assistant/tooling settings.
- Revoke and rotate any credential that has been committed, even if it was later removed.
