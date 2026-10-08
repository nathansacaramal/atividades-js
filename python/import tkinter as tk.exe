from tkinter import *
from tkinter import messagebox

# Dicionário com os lanches e preços
lanches = {
    "Hambúrguer": 18.00,
    "X-Salada": 22.00,
    "Cachorro-Quente": 15.00,
    "Misto Quente": 12.00,
    "Pizza Individual": 25.00
}

def finalizar_pedido():
    nome = entry_nome.get().strip()
    lanche = lanche_selecionado.get()

    # Validação do nome
    if nome == "":
        messagebox.showerror("Erro", "Informe o nome do cliente.")
        return

    # Validação da seleção do lanche
    if lanche == "":
        messagebox.showerror("Erro", "Selecione um lanche.")
        return

    valor = lanches[lanche]

    # Pergunta sobre taxa de serviço
    incluir_taxa = messagebox.askyesno(
        "Taxa de Serviço",
        "Deseja incluir a taxa de serviço de 10%?"
    )

    if incluir_taxa:
        valor_final = valor * 1.10
    else:
        valor_final = valor

    resultado.config(
        text=f"Cliente: {nome}\n"
             f"Lanche: {lanche}\n"
             f"Valor do Lanche: R$ {valor:.2f}\n"
             f"Valor Final: R$ {valor_final:.2f}"
    )

    messagebox.showinfo("Sucesso", "Pedido realizado com sucesso!")

# Janela principal
janela = Tk()
janela.title("Lanchonete Inteligente")
janela.geometry("400x450")

# Nome do cliente
Label(janela, text="Nome do Cliente:").pack(pady=5)

entry_nome = Entry(janela, width=30)
entry_nome.pack(pady=5)

# Variável dos Radiobuttons
lanche_selecionado = StringVar()
lanche_selecionado.set("")

Label(janela, text="Escolha um lanche:").pack(pady=10)

# Radiobuttons
for nome_lanche, preco in lanches.items():
    Radiobutton(
        janela,
        text=f"{nome_lanche} - R$ {preco:.2f}",
        variable=lanche_selecionado,
        value=nome_lanche
    ).pack(anchor="w", padx=50)

# Botão
Button(
    janela,
    text="Finalizar Pedido",
    command=finalizar_pedido,
    bg="green",
    fg="white"
).pack(pady=20)

# Área de resultado
resultado = Label(janela, text="", justify=LEFT, font=("Arial", 10))
resultado.pack(pady=10)

janela.mainloop()