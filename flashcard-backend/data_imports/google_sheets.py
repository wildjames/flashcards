import os

import gspread
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from uuid import UUID

from database.db_interface import db
from database.db_types import SheetSyncJob, Card

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
GOOGLE_OAUTH2_CREDS_FILE = os.getenv("GOOGLE_OAUTH2_CREDS_FILE", None)
if not GOOGLE_OAUTH2_CREDS_FILE:
    raise ValueError("GOOGLE_OAUTH2_CREDS_FILE environment variable not set")

def get_google_creds():
    # TODO: This is not tested, just some boilerplate code. SET UP CREDENTIALS CORRECTLY
    if not os.path.exists(GOOGLE_OAUTH2_CREDS_FILE):
        raise ValueError(f"Google OAuth2 credentials file not found: {GOOGLE_OAUTH2_CREDS_FILE}")

    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(GOOGLE_OAUTH2_CREDS_FILE):
        creds = Credentials.from_authorized_user_file(GOOGLE_OAUTH2_CREDS_FILE, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(GOOGLE_OAUTH2_CREDS_FILE, "w") as token:
            token.write(creds.to_json())
    return creds


def get_data_from_sheet(job: SheetSyncJob, creds: Credentials):
    client = gspread.authorize(creds)
    sheet = client.open_by_key(job.sheet_id)
    worksheet = sheet.worksheet(job.sheet_range)
    rows = worksheet.get_all_values()  # returns a list of lists
    return rows

def sync_cards_from_sheet(job_id: str):
    """
    Periodic task that:
    - Looks up the SheetSyncJob by job_id
    - Connects to the Google Sheet
    - Iterates over each row in the defined range
    - Creates/updates Card records in the database
    """
    job = SheetSyncJob.query.filter_by(job_id=job_id).first()
    if not job:
        print(f"No sync job found for job_id: {job_id}")
        return

    # Connect to the sheet
    creds = get_google_creds()
    rows = get_data_from_sheet(job, creds)

    group_id = UUID(job.group_id)
    creator_id = UUID(job.creator_id)

    existing_cards = Card.query.filter_by(group_id=group_id).all()
    # Convert to a dict for quick lookups by question later.
    existing_cards_dict = {c.question: c for c in existing_cards}

    # check every row has exactly 2 columns
    if any(len(row) != 2 for row in rows):
        raise ValueError("Each row must have exactly 2 columns")

    for row in rows:
        question, correct_answer = row[0], row[1]

        # update, if there's an existing card with this question
        if question in existing_cards_dict:
            # Update existing card
            card = existing_cards_dict[question]
            card.correct_answer = correct_answer
            card.updated_by_id = creator_id
        else:
            # Create new card
            card = Card(
                question=question,
                correct_answer=correct_answer,
                group_id=group_id,
                creator_id=creator_id,
                updated_by_id=creator_id
            )
            db.session.add(card)

    db.session.commit()
    print(f"Sync complete for job {job_id}")
