# Payment gateway setup

## ABA PayWay

FarmCraft's only checkout integration is the ABA PayWay Payment Link API. The backend encrypts each order-specific link request with ABA's RSA public key, signs it with the merchant API key, and redirects the buyer to the ABA-hosted payment link. The payment notification is correlated to the order and independently checked with ABA's Check Transaction API; the browser redirect or callback alone never marks an order paid.

### Merchant access and environment

1. Obtain the ABA merchant ID, merchant API key, and RSA public key for the Payment Link API from ABA. Sandbox credentials are issued separately from live credentials.
2. Ask ABA to activate Payment Links, confirm USD acceptance, and whitelist the public callback domain.
3. Configure the settings below in the backend process environment or deployment secret store. Do not add the merchant API key to frontend variables or commit credentials.
4. Start with sandbox credentials, complete a full purchase and callback/status verification test, then switch the complete configuration to production only after ABA activates the live merchant profile.

| Variable | Required | Description |
| --- | --- | --- |
| `ABA_PAYWAY_ENVIRONMENT` | Recommended | `sandbox` for testing; `production` for live charges. If omitted, the official configured payment-link URL selects the environment. |
| `ABA_PAYWAY_MERCHANT_ID` | Yes | Merchant ID issued by ABA for the selected environment |
| `ABA_PAYWAY_API_KEY` | Yes | Server-only API key issued by ABA for the selected environment |
| `ABA_PAYWAY_PUBLIC_KEY` | Yes | ABA-issued RSA public key for encrypting the `merchant_auth` payload; keep it backend-only. PEM (`BEGIN PUBLIC KEY` or `BEGIN RSA PUBLIC KEY`) is supported. |
| `ABA_PAYWAY_PUBLIC_BACKEND_URL` | Yes | Public base URL of this Spring Boot API; ABA must whitelist the callback domain |
| `ABA_PAYWAY_PAYMENT_LINK_URL` | No | Defaults to the official endpoint for the selected environment. Sandbox: `https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/payment-link/create`; production: `https://checkout.payway.com.kh/api/merchant-portal/merchant-access/payment-link/create`. |

The backend also accepts existing Spring properties named `payway.merchant-id`, `payway.api-key`, `payway.public-key`, `payway.payment-link-url`, `payway.check-url`, and `payway.return-url`. The configured Payment Link URL must match the selected official ABA host and API path. The callback URL must target `/api/payments/aba/return` or `/api/payway/callback`. ABA calls this backend callback with `tran_id`, `status`, and the unique `merchant_ref_no`; FarmCraft then verifies transaction status and amount through ABA before settling the order.

The backend accepts only official ABA sandbox or production API hosts; do not configure arbitrary gateway URLs. Production requires an HTTPS callback URL. The callback paths are `/api/payments/aba/return` and `/api/payway/callback`. ABA PayWay becomes available automatically when the merchant credentials, RSA public key, endpoint, and callback validate. Admin settings show readiness; payment activation is controlled by backend configuration. Separate card, Bakong, bank-transfer, and cash-on-delivery checkout endpoints are not available for new payments.

For local development, use a public HTTPS tunnel for the backend callback URL and the PayWay sandbox. The frontend may use localhost in sandbox mode. Localhost is not a valid callback target for real PayWay payments.

The project stores order totals in USD; Payment Links are created with `currency=USD`, a single-payment limit, and a 24-hour expiration. FarmCraft rejects a verified payment unless ABA reports an approved transaction matching the order's original and total amounts. PayWay may report the payer's chosen payment currency separately from the transaction currency, so that field is not used to reject valid converted payments.

### Live payment checklist

- Use the production merchant ID, API key, and RSA public key supplied by ABA, never sandbox values.
- Set `ABA_PAYWAY_ENVIRONMENT=production` and a public HTTPS callback URL; ensure ABA has whitelisted the callback domain.
- Restart the backend after configuring these values and confirm Admin → Settings reports ABA PayWay as configured and available.
- Place a low-value live order, complete it through PayWay, and confirm both the provider transaction and FarmCraft order/payment records before announcing availability.
- Treat payment-link callbacks and browser redirects as untrusted notifications; only the backend PayWay transaction check can settle an order.
