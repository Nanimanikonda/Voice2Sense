import urllib.request
import json
import time

health_url = "http://localhost:8000/health"
translate_url = "http://localhost:8000/translate"
payload = {
    "text": "నా పేరు మహేంద్ర బాబు నీ పేరేంటి", 
    "sourceLanguage": "te",
    "targetLanguage": "en"
}

print("Checking backend health status...")

while True:
    try:
        req = urllib.request.Request(health_url)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("Health:", result)
            if not result.get("modelsLoading") and result.get("translatorLoaded"):
                print("Models finished loading! Proceeding to translation...")
                break
            elif not result.get("modelsLoading") and not result.get("translatorLoaded"):
                print("Models stopped loading but translator is NOT loaded. There was an error loading models.")
                break
            else:
                print("Models still loading, waiting 5 seconds...")
                time.sleep(5)
    except Exception as e:
        print("Error checking health:", e)
        time.sleep(5)

print(f"\nTesting translation with text: {payload['text']}...")

try:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(translate_url, data=data, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req, timeout=120) as response:
        result = response.read().decode('utf-8')
        print(f"Status Code: {response.getcode()}")
        print("Success! Translation result:")
        print(json.loads(result))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error making request: {str(e)}")
