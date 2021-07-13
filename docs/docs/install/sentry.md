---
layout: default 
title:  Sentry Integration
parent: Installation
nav_order: 5
has_children: false
---

# Sentry(sentry.io)

Sentry is great for capturing application errors and sending notifications in appropiriate targets.

Install `sentry-sdk`

```python
# in project shell
pip install sentry_sdk
```

collect your project dsn from this link: 
https://sentry.io/settings/<sentry_username>/projects/<sentry_project_name>/keys/ 

An example link is like(my account): https://sentry.io/settings/resgef/projects/freightforward/keys/ 

Sentry dsn looks like this: https://public_key@userid.ingest.sentry.io/project_id

Now uncomment these lines in `settings.py`
```python
# import sentry_sdk
# sentry_sdk.init(
#    os.environ.get('FREIGHTAPP_SENTRY_DSN', ''),

# Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring.
# We recommend adjusting this value in production.
#    traces_sample_rate=1.0
# )
```

Now it looks like:
```python
import sentry_sdk
sentry_sdk.init(
    os.environ.get('FREIGHTAPP_SENTRY_DSN', ''),

    # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0
)
```