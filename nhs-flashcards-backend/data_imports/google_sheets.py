import gspread
from google.oauth2.service_account import Credentials
from uuid import UUID

from database.db_interface import db
from database.db_types import SheetSyncJob, Card

def get_google_creds():
    # TODO: This is not tested, just some boilerplate code. SET UP CREDENTIALS CORRECTLY
    scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    creds = Credentials.from_service_account_file(
        "path/to/service_account.json",
        scopes=scopes
    )
    return creds

def sync_cards_from_sheet(job_id):
    """
    Periodic task that:
    1. Looks up the SheetSyncJob by job_id
    2. Connects to the Google Sheet
    3. Iterates over each row in the defined range
    4. Creates/updates Card records in the database
    """
    job = SheetSyncJob.query.filter_by(job_id=job_id).first()
    if not job:
        print(f"No sync job found for job_id: {job_id}")
        return

    # Connect to the sheet
    creds = get_google_creds()
    client = gspread.authorize(creds)
    sheet = client.open_by_key(job.sheet_id)
    worksheet = sheet.worksheet(job.sheet_range)
    rows = worksheet.get_all_values()  # returns a list of lists

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
