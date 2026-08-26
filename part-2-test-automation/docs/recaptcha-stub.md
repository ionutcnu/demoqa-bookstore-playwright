# Automating the Registration Flow with a Stubbed reCAPTCHA

## Why a normal E2E test cannot cover this

reCAPTCHA exists to block bots, and automated browsers are bots by
definition. Google's widget uses JavaScript challenges and risk scoring that
reject headless browsers and, over time, headed automation as well. On top of
that, Google's official test keys only work when the application owner
configures them on the server side. DemoQA is a public third-party site, so we
cannot do that.

The result: a straight UI E2E test of the registration form stops at the
widget. The only honest options are manual testing or stubbing the widget.

## What we did

We do not test Google's service, because we cannot. We test DemoQA's
registration form instead.

The registration page uses reCAPTCHA v3 through `react-google-recaptcha-v3`.
It loads `https://www.google.com/recaptcha/api.js`, then calls
`grecaptcha.execute()` and marks the captcha as solved when the promise
resolves. The form only submits once that happens.

Our test intercepts the `api.js` request with Playwright route interception
and serves a tiny fake API with the same surface (`ready`, `render`,
`execute`, `getResponse`, `reset`). The app receives a token, the form
submits, and the real registration request goes through the browser to the
real backend.

### Why this works: where the trust actually lives

The trick only works because the captcha check is entirely client side. The
page keeps a `captchaVerified` flag in React state. The flag is set when the
widget's `execute()` promise resolves. The form refuses to submit while the
flag is false.

Three facts make the stub effective:

1. The check happens in the browser, not on the server. No part of the
   backend inspects the token.
2. The token is opaque to the page. The app never decrypts or validates it;
   it just needs a non-empty promise result.
3. The only external dependency is the `api.js` script itself. If we control
   what that request returns, we control the entire trust chain, because
   nothing after it asks Google for confirmation.

So the stub does not break encryption, guess tokens, or defeat a challenge.
It simply replaces the one script the page trusts, and the page never asks
the question the script was supposed to answer. A real CAPTCHA would have
failed this test setup at step one: the token would have gone to a server
that verifies it with Google.

## One trap worth documenting

The app unmounts the form while a request is in flight and remounts it when
the response arrives. On remount, the captcha component re-executes the
widget. Its `onVerify` callback is built from the first render's state, so
firing it again wipes the server error message (for example, the weak
password explanation) before the user can read it.

The fake API therefore resolves the token only once per page session. The
execution counter is stored on `window` so it survives the re-loading of the
stubbed script. After the first verification, later executions never resolve,
which keeps the error message on screen.

## Did we find a bug?

Yes, one real user-facing bug, and it surfaced only because the stub made the
flow runnable:

**The vanishing error message.** When registration fails server side (for
example, a weak password), the server's explanation is shown for a moment and
then disappears. The form remounts after every request, the captcha
re-verifies, and the stale callback overwrites the error state. A real user
submitting a weak password would see the message flash and vanish, which
makes the form look broken. This is a genuine defect in the page's state
management, independent of our stub — our first stub version reproduced it
faithfully, and the counter was added so the test could assert the message
that the page itself renders.

## Is this a security flaw?

Yes, and it is worth being precise about what we found:

- The CAPTCHA protects nothing. The registration endpoint accepts accounts
  without any token. Our own API tests create users this way every run, and
  the server happily returns 201. Anyone with a script can mass-create
  accounts; the CAPTCHA only stops humans from clicking the form without
  solving it.
- The validation is client side only. The "captchaVerified" flag lives in
  React state. Nothing on the server re-checks the token with Google's
  `siteverify` endpoint.
- Our stub does not create this flaw. It documents it. A real attacker does
  not need the stub at all — calling `POST /Account/v1/User` directly is
  simpler and faster.

On DemoQA this may be intentional: it is a public practice site, and the
CAPTCHA widget exists partly so testers can practice handling it. In a
production product, every one of these findings would be a critical defect.
A production system should treat the token as the user's claim and verify it
server side with Google before creating anything.

## What the test proves

- The registration form works end to end: fields, validation, submission,
  account creation, and logging in with the new account.
- Server-side rejections (for example, a weak password) reach the user.

## What it does not prove

- Anything about Google's bot detection. The widget is stubbed.
- The exact experience of a real user solving the CAPTCHA.

## When to do this in real life

- On a staging or QA environment you control: ask the team for Google test
  keys. That is the right way.
- On a public third-party site like DemoQA: stubbing is the pragmatic way to
  keep the rest of the flow testable.
- In production: never. CAPTCHA behavior is checked manually, and bot
  protection is monitored, not E2E-tested.

## Failure modes of this approach

- If DemoQA starts validating the token server side, this test fails. That is
  expected and the stub would have to be removed or replaced by real test
  keys.
- If the app changes its reCAPTCHA library or API shape, the fake API must
  follow.
