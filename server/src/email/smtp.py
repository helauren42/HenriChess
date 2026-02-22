from email.mime.text import MIMEText
import smtplib
import dotenv
import os
import sys

dotenv.load_dotenv()

def getEnv(key) -> str:
    value = os.getenv(key)
    if value is None:
        # mylog.critical(f"Could not find key: {key} inside env")
        sys.exit(1)
    return value

EMAIL = getEnv("EMAIL")
SMTP_KEY = getEnv("SMTP_KEY")
SUBJECT = "HenriChess Email Confirmation"
BASE_URL = getEnv("BASE_URL")

class EmailManager():
    def sendVerificationEmail(self, username: str, clientEmail: str, uuidToken: str):
        try:
            print(1)
            subject = SUBJECT
            url = BASE_URL + "/auth/email-confirmation/" + uuidToken
            body = f"Hello {username},\n\n"
            body += f"Please click on the following link or copy paste it into the url bar of your browser: {url}\n\n"
            body += "Best Regards,"
            mimeText = MIMEText(body)
            mimeText['Subject'] = subject
            mimeText["From"] = EMAIL
            mimeText["To"] = clientEmail

            print(2)
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                print(4)
                server.starttls()
                print(5)
                server.login(EMAIL, SMTP_KEY)
                print(6)
                server.sendmail(EMAIL, clientEmail, mimeText.as_string())
                print(7)
        except Exception as e:
            print(f"Error sending email: {e}")

if __name__ == "__main__":
    obj = EmailManager()
    obj.sendVerificationEmail("bob", "henrilrnc@gmail.com", "duife23731h9-24382-2121389hfeh")
