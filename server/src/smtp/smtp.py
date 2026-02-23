from email.mime.text import MIMEText
import smtplib
import dotenv
import os
import sys

from utils.logger import mylog

dotenv.load_dotenv()

def getEnv(key) -> str:
    value = os.getenv(key)
    if value is None:
        mylog.critical(f"Could not find key: {key} inside env")
        sys.exit(1)
    return value

SMTP_EMAIL = getEnv("SMTP_EMAIL")
SMTP_KEY = getEnv("SMTP_KEY")
BASE_URL = getEnv("BASE_URL")
SUBJECT = "HenriChess Email Confirmation"

class Smtp():
    @staticmethod
    def sendVerificationEmail(username: str, clientEmail: str, uuidToken: str):
        try:
            subject = SUBJECT
            url = BASE_URL + "/verify-email/" + username + "/" + uuidToken
            body = f"Hello {username},\n\n"
            body += f"Please click on the following link or copy paste it into the url bar of your browser: {url}\n\n"
            body += "Best Regards,"
            mimeText = MIMEText(body)
            mimeText['Subject'] = subject
            mimeText["From"] = SMTP_EMAIL
            mimeText["To"] = clientEmail

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(SMTP_EMAIL, SMTP_KEY)
                server.sendmail(SMTP_EMAIL, clientEmail, mimeText.as_string())
        except Exception as e:
            mylog.critical(f"Error sending email: {e}")

if __name__ == "__main__":
    obj = Smtp()
    obj.sendVerificationEmail("bob", "henrilrnc@gmail.com", "duife23731h9-24382-2121389hfeh")
