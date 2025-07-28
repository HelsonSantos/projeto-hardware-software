"""
=== LEITOR RFID PN532 COM DUAL LED E BUZZER ===

Conexões HW-147 PN532:
- VCC → 3.3V (pino 36)
- GND → GND (pino 38)  
- SDA → GPIO0 (pino 1)
- SCL → GPIO1 (pino 2)

Conexões LED Externo:
- GPIO2 (pino 4) → Resistor 220Ω → LED (+)
- GND (qualquer pino GND) → LED (-)

Conexões Buzzer:
- GPIO3 (pino 5) → Buzzer (+)
- GND (qualquer pino GND) → Buzzer (-)

LEDs utilizados:
- LED interno do Pico W (automático)
- LED externo no GPIO2 (pino 4)

Buzzer:
- Buzzer ativo no GPIO3 (pino 5)
"""

import board
import busio
from digitalio import DigitalInOut, Direction
import adafruit_pn532.i2c
import time

from enviar_para_backend import enviar_para_backend


# Configuração dos LEDs
led_interno = DigitalInOut(board.LED)  # LED interno do Pico W
led_interno.direction = Direction.OUTPUT

led_externo = DigitalInOut(board.GP2)  # LED externo no GPIO2 (pino 4)
led_externo.direction = Direction.OUTPUT

# Configuração do Buzzer
buzzer = DigitalInOut(board.GP3)  # Buzzer no GPIO3 (pino 5)
buzzer.direction = Direction.OUTPUT

# Configuração I2C
# Usando os pinos corretos para o Raspberry Pi Pico W
i2c = busio.I2C(board.GP1, board.GP0)  # SCL=GP1, SDA=GP0

# Criar instância do PN532 via I2C
pn532 = adafruit_pn532.i2c.PN532_I2C(i2c, debug=False)

def beep_curto(duracao=0.1):
    """Emite um beep curto"""
    buzzer.value = True
    time.sleep(duracao)
    buzzer.value = False

def beep_longo(duracao=0.5):
    """Emite um beep longo"""
    buzzer.value = True
    time.sleep(duracao)
    buzzer.value = False

def beeps_multiplos(quantidade=3, duracao=0.1, pausa=0.1):
    """Emite múltiplos beeps"""
    for _ in range(quantidade):
        buzzer.value = True
        time.sleep(duracao)
        buzzer.value = False
        if _ < quantidade - 1:  # Não pausar após o último beep
            time.sleep(pausa)

def som_sucesso():
    """Som característico de sucesso - 3 beeps crescentes"""
    beep_curto(0.1)
    time.sleep(0.05)
    beep_curto(0.15)
    time.sleep(0.05)
    beep_longo(0.2)

def som_erro():
    """Som característico de erro - 2 beeps longos"""
    beep_longo(0.3)
    time.sleep(0.1)
    beep_longo(0.3)

def som_inicializacao():
    """Som de inicialização - sequência musical"""
    tons = [0.1, 0.08, 0.06, 0.1]
    for tom in tons:
        buzzer.value = True
        time.sleep(tom)
        buzzer.value = False
        time.sleep(0.05)

def piscar_leds(vezes=3, duracao=0.2, com_som=False):
    """Faz ambos os LEDs piscarem simultaneamente"""
    for _ in range(vezes):
        led_interno.value = True
        led_externo.value = True
        if com_som:
            buzzer.value = True
            time.sleep(0.05)
            buzzer.value = False
        time.sleep(duracao)
        led_interno.value = False
        led_externo.value = False
        time.sleep(duracao)

def leds_ligados():
    """Liga ambos os LEDs"""
    led_interno.value = True
    led_externo.value = True

def leds_desligados():
    """Desliga ambos os LEDs"""
    led_interno.value = False
    led_externo.value = False

def piscar_alternado(ciclos=3, duracao=0.2, com_som=False):
    """Faz os LEDs piscarem alternadamente"""
    for i in range(ciclos):
        # LED interno ligado, externo desligado
        led_interno.value = True
        led_externo.value = False
        if com_som:
            buzzer.value = True
            time.sleep(0.05)
            buzzer.value = False
        time.sleep(duracao)
        # LED externo ligado, interno desligado
        led_interno.value = False
        led_externo.value = True
        if com_som:
            buzzer.value = True
            time.sleep(0.05)
            buzzer.value = False
        time.sleep(duracao)
    # Desligar ambos
    leds_desligados()

def inicializar_pn532():
    """Inicializa e configura o módulo PN532"""
    try:
        # Sequência de inicialização com LEDs alternados e som
        print("Inicializando PN532...")
        som_inicializacao()
        piscar_alternado(2, 0.2, com_som=True)
        
        ic, ver, rev, support = pn532.firmware_version
        print(f"PN532 encontrado com versão do firmware: {ver}.{rev}")
        pn532.SAM_configuration()
        
        # Ambos os LEDs acesos e som de sucesso
        leds_ligados()
        som_sucesso()
        time.sleep(0.3)
        leds_desligados()
        print("Inicialização concluída com sucesso!")
        
        return True
    except Exception as e:
        print(f"Erro ao inicializar PN532: {e}")
        # Som de erro e piscar rápido
        som_erro()
        piscar_leds(10, 0.05, com_som=True)
        return False

def ler_mifare_classic(uid):
    """Tenta ler dados de um cartão MiFare Classic"""
    uid = list(uid) 
    try:
        # Chave padrão para MiFare Classic (geralmente funciona com cartões novos)
        key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]
        
        print("Tentando ler dados do cartão MiFare Classic...")
        
        # Tentar autenticar e ler o bloco 4 (primeiro bloco de dados do setor 1)
        if pn532.mifare_classic_authenticate_block(uid, 4, 0x60, key):
            data = pn532.mifare_classic_read_block(4)
            if data:
                print(f"Dados do bloco 4: {[hex(x) for x in data]}")
                # Tentar decodificar como texto (se possível)
                try:
                    texto = ''.join([chr(x) for x in data if 32 <= x <= 126])
                    if texto:
                        print(f"Texto legível: '{texto}'")
                except:
                    pass
            
            # Tentar ler mais alguns blocos
            for bloco in [5, 6, 8, 9, 10]:
                try:
                    if pn532.mifare_classic_authenticate_block(uid, bloco, 0x60, key):
                        data = pn532.mifare_classic_read_block(bloco)
                        if data and any(x != 0 for x in data):  # Só mostrar se não for vazio
                            print(f"Dados do bloco {bloco}: {[hex(x) for x in data]}")
                except:
                    continue
        else:
            print("Não foi possível autenticar com a chave padrão")
            print("Cartão pode estar protegido ou usar chaves customizadas")
            
    except Exception as e:
        print(f"Erro ao ler dados MiFare: {e}")

def main():

    """Função principal do programa"""
    print("=" * 60)
    print("=== LEITOR RFID PN532 COM INDICAÇÃO LED ===")
    print("=" * 60)
    
    if not inicializar_pn532():
        print("Falha na inicialização. Verifique as conexões.")
        return
    
    print("\nAguardando cartão RFID...")
    print("Aproxime um cartão para leitura...")
    print("Pressione Ctrl+C para sair\n")
    
    while True:
        try:
            # Tentar ler um cartão (timeout de 1 segundo)
            uid = pn532.read_passive_target(timeout=1)
            
            if uid is not None:
                # Ambos os LEDs acesos durante toda a operação de leitura
                leds_ligados()
                
                # Som de detecção - 2 beeps curtos
                beeps_multiplos(2, 0.1, 0.1)
                
                print("=" * 60)
                print("🔍 CARTÃO DETECTADO!")
                print("=" * 60)
                
                # Piscar ambos os LEDs para confirmar detecção
                piscar_leds(3, 0.1)
                leds_ligados()  # Manter ambos acesos durante leitura
                
                # Informações básicas do cartão
                print(f"📋 INFORMAÇÕES DO CARTÃO:")
                print(f"   UID (hex): {' '.join(['%02X' % i for i in uid])}")
                print(f"   UID (decimal): {uid}")
                print(f"   UID (string): {''.join(['%02X' % i for i in uid])}")
                print(f"   Tamanho do UID: {len(uid)} bytes")
                
                # Determinar e mostrar tipo do cartão
                if len(uid) == 4:
                    tipo_cartao = "MiFare Classic 1K/4K"
                    print(f"   Tipo: {tipo_cartao}")
                    enviar_para_backend(uid, tipo_cartao)

                    print(f"   Capacidade: Provavelmente 1KB ou 4KB")
                    print("\n📖 TENTANDO LER DADOS:")
                    ler_mifare_classic(uid)
                elif len(uid) == 7:
                    tipo_cartao = "MiFare Ultralight"
                    print(f"   Tipo: {tipo_cartao}")
                    print(f"   Capacidade: Provavelmente 512 bits")
                else:
                    tipo_cartao = f"Desconhecido ({len(uid)} bytes)"
                    print(f"   Tipo: {tipo_cartao}")
                
                print("\n" + "=" * 60)
                print("✅ LEITURA CONCLUÍDA")
                print("=" * 60)
                
                # Som de sucesso na leitura
                som_sucesso()
                
                # Sequência especial para indicar fim da leitura
                piscar_alternado(2, 0.1)  # Piscar alternado
                piscar_leds(2, 0.2)       # Depois ambos juntos
                
                # Aguardar remoção do cartão
                print("🔄 Remova o cartão para continuar...")
                while pn532.read_passive_target(timeout=0.1) is not None:
                    time.sleep(0.1)
                    
                # Som quando cartão é removido - beep curto
                beep_curto(0.1)
                leds_desligados()  # Desligar ambos os LEDs quando cartão for removido
                print("✅ Cartão removido. Pronto para próxima leitura.\n")
                
        except KeyboardInterrupt:
            print("\n" + "=" * 60)
            print("🛑 ENCERRANDO PROGRAMA...")
            print("=" * 60)
            leds_desligados()  # Garantir que ambos os LEDs sejam desligados ao sair
            break
            
        except Exception as e:
            print(f"❌ Erro na leitura: {e}")
            # Som de erro e piscar rapidamente ambos os LEDs
            som_erro()
            piscar_leds(5, 0.05)
            leds_desligados()
            time.sleep(1)
            
        # Pequena pausa para não sobrecarregar o sistema
        time.sleep(0.1)

# Executar programa principal
if __name__ == "__main__":
    main()
