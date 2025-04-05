from flask_apscheduler import APScheduler

# Initialize the scheduler
scheduler = APScheduler()
# Do we want to expose a REST API for the scheduler??
scheduler.api_enabled = True
