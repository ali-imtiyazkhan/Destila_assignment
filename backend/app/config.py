import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'exception_inbox.db')}"
