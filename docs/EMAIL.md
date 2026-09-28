# Email on usctts.com

Goal: `tyler@usctts.com` on Google Workspace, sending cold outreach through
Apps Script (`GmailApp.sendEmail`), which only exists on Google. Do not buy
GoDaddy's email product, it is Microsoft 365.

DNS stays at GoDaddy. `scripts/email-dns.sh` writes every record through the
GoDaddy API, so nobody has to open the DNS panel.

## Where it stands

| Step | Record                                                                                                 | State                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1    | MX `smtp.google.com` priority 1                                                                        | done 2026-09-28                                                        |
| 1    | SPF `v=spf1 include:_spf.google.com ~all`                                                              | done 2026-09-28                                                        |
| 2    | Buy Workspace Business Starter at workspace.google.com, one seat `tyler@usctts.com`                    | needs a card and a Google login                                        |
| 3    | Domain verification TXT                                                                                | `scripts/email-dns.sh verify <token>`                                  |
| 4    | DKIM: Admin, Apps, Google Workspace, Gmail, Authenticate email, generate (selector `google`, 2048-bit) | `scripts/email-dns.sh dkim "<value>"`, then click Start authentication |
| 5    | Wait 48 hours for DKIM                                                                                 |                                                                        |
| 6    | DMARC to `p=none` with a reporting address someone reads                                               | `scripts/email-dns.sh dmarc tyler@usctts.com`                          |
| 7    | Test at mail-tester.com, 9/10 or better before any warmup                                              |                                                                        |
| 8    | Ramp: about 5 a day week one, 10 week two, 15 to 20 week three                                         |                                                                        |

## Why DMARC goes last

The existing `_dmarc` record is `p=quarantine` and reports to a GoDaddy
mailbox. With no DKIM, that policy quarantines our own mail. Loosening it
before SPF and DKIM pass leaves the domain spoofable, so it changes only after
DKIM has propagated.

`scripts/email-dns.sh status` prints all four records from GoDaddy's
nameserver.
