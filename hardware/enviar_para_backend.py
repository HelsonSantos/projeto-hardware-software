import time
import wifi
import socketpool
import adafruit_requests
from secrets import secrets

# === CONEXÃO COM O WI-FI ===
print("🔌 Conectando ao Wi-Fi...")
wifi.radio.connect(secrets["ssid"], secrets["password"])
print("✅ Conectado ao Wi-Fi!")
print("📡 Endereço IP:", wifi.radio.ipv4_address)

# === CRIAÇÃO DE SESSÃO HTTP ===
pool = socketpool.SocketPool(wifi.radio)
requests = adafruit_requests.Session(pool, ssl_context=None)

# === FUNÇÃO DE ENVIO ===
def enviar_para_backend(uid_bytes, tipo):
    try:
        uid_lista = list(uid_bytes)  # <- converte o bytearray em lista de ints
        uid_str = ''.join(['%02X' % b for b in uid_lista])
        payload = {
            "uid": uid_str,
            "tipo": tipo
        }

        url = "http://192.168.1.4:3001/api/rfid/leitura"
        headers = {"Content-Type": "application/json"}

        print(f"📤 Enviando para backend: {payload}")
        response = requests.post(url, json=payload, headers=headers)
        print("📬 Resposta:", response.status_code, response.text)
        response.close()

    except Exception as e:
        print(f"❌ Erro ao enviar para backend: {e}")
