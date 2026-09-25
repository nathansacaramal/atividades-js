# ============================================================
# Exemplo 2: Formulário de cadastro
# Conceitos: grid(), Entry, StringVar, Checkbutton, messagebox
# ============================================================

import tkinter as tk
from tkinter import messagebox  # Módulo das caixas de diálogo prontas


def cadastrar():
    """Lê os campos, valida e mostra uma mensagem."""
    nome = var_nome.get().strip()     # .get() lê o valor da variável
    email = var_email.get().strip()

    # Validação simples: nenhum campo pode ficar vazio
    if not nome or not email:
        messagebox.showwarning("Atenção", "Preencha nome e e-mail!")
        return

    # Lê o valor do Checkbutton (True ou False)
    newsletter = "Sim" if var_news.get() else "Não"

    messagebox.showinfo(
        "Cadastro realizado",
        f"Nome: {nome}\nE-mail: {email}\nNewsletter: {newsletter}",
    )
    limpar()


def limpar():
    """Esvazia todos os campos do formulário."""
    var_nome.set("")         # .set() muda o valor -> o widget atualiza sozinho
    var_email.set("")
    var_news.set(False)
    entrada_nome.focus()     # Coloca o cursor no primeiro campo


janela = tk.Tk()
janela.title("Cadastro")
janela.geometry("340x180")

# --- Variáveis de controle do tkinter ---
# Elas ficam "ligadas" aos widgets: mudou uma, muda o outro
var_nome = tk.StringVar()
var_email = tk.StringVar()
var_news = tk.BooleanVar()

# --- Layout com grid(): organiza em linhas (row) e colunas (column) ---
# sticky="e" alinha à direita (east); "w" alinha à esquerda (west)
tk.Label(janela, text="Nome:").grid(row=0, column=0, padx=10, pady=8, sticky="e")
entrada_nome = tk.Entry(janela, textvariable=var_nome, width=30)
entrada_nome.grid(row=0, column=1, padx=10, sticky="w")

tk.Label(janela, text="E-mail:").grid(row=1, column=0, padx=10, pady=8, sticky="e")
entrada_email = tk.Entry(janela, textvariable=var_email, width=30)
entrada_email.grid(row=1, column=1, padx=10, sticky="w")

# columnspan=2 faz o widget ocupar duas colunas
tk.Checkbutton(
    janela, text="Quero receber novidades", variable=var_news
).grid(row=2, column=0, columnspan=2, pady=5)

# Um Frame é um "container" para agrupar widgets
frame_botoes = tk.Frame(janela)
frame_botoes.grid(row=3, column=0, columnspan=2, pady=10)

# Dentro do Frame podemos usar pack(), pois ele é outro "pai"
tk.Button(frame_botoes, text="Cadastrar", width=12, command=cadastrar).pack(side="left", padx=5)
tk.Button(frame_botoes, text="Limpar", width=12, command=limpar).pack(side="left", padx=5)

# bind() liga um EVENTO a uma função. Aqui: tecla Enter = cadastrar
# A função recebe um objeto 'event', por isso usamos lambda
janela.bind("<Return>", lambda event: cadastrar())

entrada_nome.focus()
janela.mainloop()


