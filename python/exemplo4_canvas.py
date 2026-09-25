# ============================================================
# Exemplo 4: Canvas com animação e eventos
# Conceitos: Canvas, after() (animação), bind() de mouse, Scale
# ============================================================

import tkinter as tk
import random

LARGURA, ALTURA = 400, 300
RAIO = 20

dx, dy = 3, 2      # Direção da bola a cada quadro (eixo x e eixo y)
rodando = True     # Controla se a animação está pausada


def animar():
    """Move a bola um passo e agenda a próxima chamada."""
    global dx, dy
    if rodando:
        velocidade = escala.get()              # Lê o valor atual do Scale
        canvas.move(bola, dx * velocidade, dy * velocidade)

        # coords() devolve [x1, y1, x2, y2]: o retângulo que envolve a bola
        x1, y1, x2, y2 = canvas.coords(bola)

        # Ao bater numa borda, força a direção para dentro da tela
        if x1 <= 0:
            dx = abs(dx)
        elif x2 >= LARGURA:
            dx = -abs(dx)
        if y1 <= 0:
            dy = abs(dy)
        elif y2 >= ALTURA:
            dy = -abs(dy)

    # after(ms, função): chama a função de novo daqui a 20 ms
    # NUNCA use time.sleep() ou while True no tkinter: trava a janela!
    janela.after(20, animar)


def alternar():
    """Pausa ou continua a animação."""
    global rodando
    rodando = not rodando
    botao.config(text="Pausar" if rodando else "Continuar")


def clique(event):
    """event.x e event.y trazem a posição do clique dentro do Canvas."""
    cor = random.choice(["red", "green", "blue", "orange", "purple"])
    canvas.itemconfig(bola, fill=cor)          # Muda uma propriedade do desenho
    # Desenha um pontinho onde o usuário clicou
    canvas.create_oval(event.x - 3, event.y - 3, event.x + 3, event.y + 3,
                       fill=cor, outline="")


janela = tk.Tk()
janela.title("Bola Quicando")

# Canvas = área livre para desenhar formas, linhas, textos
canvas = tk.Canvas(janela, width=LARGURA, height=ALTURA, bg="white")
canvas.pack(padx=10, pady=10)

# Todo desenho no Canvas retorna um ID, usado para mexer nele depois
canvas.create_text(LARGURA // 2, 15, text="Clique na tela para mudar a cor", fill="gray")
bola = canvas.create_oval(50, 50, 50 + RAIO * 2, 50 + RAIO * 2, fill="red", outline="")

# Evento de mouse: <Button-1> = botão esquerdo
canvas.bind("<Button-1>", clique)

# --- Painel de controles ---
frame = tk.Frame(janela)
frame.pack(pady=(0, 10))

tk.Label(frame, text="Velocidade:").pack(side="left")

# Scale = controle deslizante (de 1 até 5)
escala = tk.Scale(frame, from_=1, to=5, orient="horizontal")
escala.set(2)
escala.pack(side="left", padx=5)

botao = tk.Button(frame, text="Pausar", width=10, command=alternar)
botao.pack(side="left", padx=10)

animar()           # Dá o primeiro "empurrão" na animação
janela.mainloop()
