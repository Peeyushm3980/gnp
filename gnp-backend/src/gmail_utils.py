import base64
import os
import pickle
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Scopes required for reading and sending emails in a CA firm context
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify' # Added to mark emails as "Processed"
]

def get_gmail_service():
    """
    Authenticates the user and returns a Gmail API service instance.
    Maintains a token.json file for persistent background access.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens.
    # It is created automatically when the authorization flow completes for the first time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Ensure credentials.json (from Google Cloud Console) is in your root directory
            if not os.path.exists('credentials.json'):
                raise FileNotFoundError("credentials.json not found. Please download it from Google Cloud Console.")
                
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Save the credentials for the next run to ensure background sync works
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def parse_message_parts(service, message_id, payload):
    """
    Recursively parses Gmail message parts to extract:
    1. The plain text body
    2. Metadata for all attachments
    """
    body = ""
    attachments = []

    parts = payload.get('parts', [])
    
    # If the message is not multipart, the body is in the 'body' key of the payload
    if not parts:
        data = payload.get('body', {}).get('data')
        if data:
            body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
    else:
        # Recursive function to handle nested parts
        def walk_parts(parts_list):
            nonlocal body
            for part in parts_list:
                mime_type = part.get('mimeType')
                filename = part.get('filename')
                part_body = part.get('body', {})
                
                # 1. Extract Text Body
                if mime_type == 'text/plain' and not filename:
                    data = part_body.get('data')
                    if data:
                        body += base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                
                # 2. Extract Attachment Metadata
                elif filename:
                    attachments.append({
                        "filename": filename,
                        "mimeType": mime_type,
                        "attachmentId": part_body.get('attachmentId'),
                        "size": part_body.get('size')
                    })
                
                # 3. Handle Nested Multiparts (e.g. multipart/related or alternative)
                if 'parts' in part:
                    walk_parts(part['parts'])

        walk_parts(parts)

    return body, attachments

def download_attachment(service, message_id, attachment_id):
    """Downloads the actual file content from Gmail."""
    attachment = service.users().messages().attachments().get(
        userId='me', messageId=message_id, id=attachment_id
    ).execute()
    
    data = attachment.get('data')
    return base64.urlsafe_b64decode(data) if data else None