# ============================================================
# Exemplo 1: Janela básica com contador de cliques
# Conceitos: Tk(), Label, Button, pack(), command, mainloop()
# ============================================================

import tkinter as tk  # Importa o tkinter com um apelido curto

# --- Variável que guarda o estado do programa ---
contador = 0

def incrementar():
    """Função chamada quando o botão '+1' é clicado."""
    global contador          # Avisa que vamos alterar a variável global
    contador += 1
    # .config() altera uma propriedade de um widget já criado
    rotulo_numero.config(text=str(contador))


def zerar():
    """Volta o contador para zero."""
    global contador
    contador = 0
    rotulo_numero.config(text="0")


# --- 1. Cria a janela principal (a "raiz" de tudo) ---
janela = tk.Tk()
janela.title("Contador de Cliques")   # Texto na barra de título
janela.geometry("300x200")            # Largura x Altura em pixels
janela.resizable(False, False)        # Impede redimensionar

# --- 2. Cria os widgets (componentes visuais) ---
# O primeiro argumento é sempre o "pai": onde o widget vai morar
rotulo_titulo = tk.Label(janela, text="Você clicou:", font=("Arial", 12))

rotulo_numero = tk.Label(
    janela,
    text="0",
    font=("Arial", 36, "bold"),
    fg="navy",                        # Cor do texto (foreground)
)

# 'command' recebe a FUNÇÃO (sem parênteses!), não o resultado dela
botao_mais = tk.Button(janela, text="+1", width=10, command=incrementar)
botao_zerar = tk.Button(janela, text="Zerar", width=10, command=zerar)

# --- 3. Posiciona os widgets na janela com pack() ---
# pack() empilha os widgets um embaixo do outro (padrão: de cima p/ baixo)
rotulo_titulo.pack(pady=(15, 0))      # pady = espaço vertical externo
rotulo_numero.pack()
botao_mais.pack(pady=5)
botao_zerar.pack()

# --- 4. Inicia o loop de eventos ---
# O programa fica "parado" aqui, esperando cliques, teclas etc.
janela.mainloop()
