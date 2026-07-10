import urllib.request, json

resp = urllib.request.urlopen("http://localhost:8000/exceptions")
data = json.loads(resp.read())
print("Total exceptions:", data["total"])
first = data["exceptions"][0]
print("First exception:", json.dumps(first, indent=2, default=str))

resp = urllib.request.urlopen("http://localhost:8000/exceptions?severity=high")
data = json.loads(resp.read())
print("High severity:", data["total"])

exc_id = data["exceptions"][0]["id"]
resp = urllib.request.urlopen(f"http://localhost:8000/exceptions/{exc_id}")
detail = json.loads(resp.read())
print("Detail for id={}: {}".format(exc_id, json.dumps(detail, indent=2, default=str)[:400]))
