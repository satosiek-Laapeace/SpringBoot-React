# Bakong KHQR payment setup

FarmCraft's `KHQR` checkout option generates an order-specific USD KHQR and confirms payment by querying Bakong Open API from the backend. The browser cannot mark an order paid by itself.

## Merchant and API access

1. Set up and verify a Bakong merchant account with your bank (for example, ABA) and obtain the exact Bakong account ID/merchant details accepted for KHQR generation. Do not use an ABA bank account number in place of the Bakong account ID.
2. Request an NBC Bakong Open API token with permission to check transactions. An ABA PayWay merchant ID/API key is for a different payment integration and is not a substitute for this token.
3. Keep the API token on the backend only. Do not add it to frontend variables, browser code, or a committed file.

## Environment variables

Set these in the backend process environment or your IDE's Spring Boot run configuration:

| Variable | Required | Description |
| --- | --- | --- |
| `BAKONG_API_BASE_URL` | Yes | `https://api-bakong.nbc.org.kh` for production or `https://sit-api-bakong.nbc.org.kh` for matching SIT credentials |
| `BAKONG_API_TOKEN` | Yes | NBC Bakong Open API bearer token for the same environment |
| `BAKONG_ACCOUNT_ID` | Yes | Registered Bakong account ID for the merchant receiving funds |
| `BAKONG_MERCHANT_NAME` | Yes | Merchant name registered with the bank |
| `BAKONG_MERCHANT_CITY` | Yes | Merchant city registered with the bank |
| `BAKONG_CURRENCY` | No | `USD` only; order totals are currently stored in USD |

The backend rejects missing settings and non-HTTPS Bakong API URLs. Configure all values for either SIT or production as a matching set. Never use SIT credentials against the production URL, or production credentials against SIT.

For a local PowerShell session, set the variables before starting the backend:

```powershell
$env:BAKONG_API_BASE_URL = "https://sit-api-bakong.nbc.org.kh"
$env:BAKONG_API_TOKEN = "<your SIT token>"
$env:BAKONG_ACCOUNT_ID = "<your registered Bakong account ID>"
$env:BAKONG_MERCHANT_NAME = "<registered merchant name>"
$env:BAKONG_MERCHANT_CITY = "<registered merchant city>"
$env:BAKONG_CURRENCY = "USD"
```

Use the production URL and production-issued credentials only after SIT payments and server-side verification have been tested successfully. For a production deployment, configure these variables in the hosting provider's secret/environment settings.

## Enable and verify

Enable the Bakong KHQR payment option in marketplace payment settings after the backend environment is configured. Place a small test order using a Bakong/KHQR-enabled banking app, then confirm that checkout changes the order to paid only after the backend verifies the transaction. If the merchant details, token, currency, or paid amount do not match the order, the backend will not confirm it.

This project does not currently implement ABA PayWay. Choosing ABA PayWay instead requires a separate gateway integration using credentials issued by ABA; do not put PayWay credentials into the Bakong settings.
