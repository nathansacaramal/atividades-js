# ============================================================
# Exemplo 3: Lista de tarefas usando CLASSE
# Conceitos: organização em classe, Frame, Listbox, Scrollbar
# ============================================================

import tkinter as tk
from tkinter import messagebox


class ListaDeTarefas:
    """App organizado em classe: forma recomendada para projetos maiores."""

    def __init__(self, janela):
        self.janela = janela
        self.janela.title("Lista de Tarefas")
        self.janela.geometry("350x320")
        self.criar_widgets()

    def criar_widgets(self):
        # --- Topo: campo de texto + botão Adicionar ---
        frame_topo = tk.Frame(self.janela)
        frame_topo.pack(fill="x", padx=10, pady=10)   # fill="x" estica na horizontal

        self.entrada = tk.Entry(frame_topo, font=("Arial", 11))
        # expand=True faz a Entry ocupar todo o espaço que sobrar
        self.entrada.pack(side="left", fill="x", expand=True)
        self.entrada.bind("<Return>", lambda e: self.adicionar())

        tk.Button(frame_topo, text="Adicionar", command=self.adicionar).pack(
            side="left", padx=(5, 0)
        )

        # --- Meio: Listbox com barra de rolagem ---
        frame_lista = tk.Frame(self.janela)
        frame_lista.pack(fill="both", expand=True, padx=10)

        barra = tk.Scrollbar(frame_lista)
        barra.pack(side="right", fill="y")

        self.lista = tk.Listbox(
            frame_lista,
            font=("Arial", 11),
            selectbackground="lightblue",
            yscrollcommand=barra.set,          # A lista avisa a barra quando rola
        )
        self.lista.pack(side="left", fill="both", expand=True)
        barra.config(command=self.lista.yview)  # A barra controla a lista

        # --- Base: botões de ação ---
        frame_baixo = tk.Frame(self.janela)
        frame_baixo.pack(pady=10)

        tk.Button(frame_baixo, text="Concluir", command=self.concluir).pack(side="left", padx=5)
        tk.Button(frame_baixo, text="Remover", command=self.remover).pack(side="left", padx=5)
        tk.Button(frame_baixo, text="Limpar tudo", command=self.limpar).pack(side="left", padx=5)

    # ---------------- Métodos de ação ----------------
    def adicionar(self):
        texto = self.entrada.get().strip()
        if texto:
            self.lista.insert(tk.END, texto)   # END = insere no final da lista
            self.entrada.delete(0, tk.END)     # Apaga do caractere 0 até o fim

    def selecionado(self):
        """Retorna o índice do item selecionado, ou None."""
        selecao = self.lista.curselection()    # Tupla com os índices selecionados
        if not selecao:
            messagebox.showinfo("Aviso", "Selecione uma tarefa primeiro.")
            return None
        return selecao[0]

    def concluir(self):
        indice = self.selecionado()
        if indice is not None:
            texto = self.lista.get(indice)
            if not texto.startswith("✔"):
                self.lista.delete(indice)
                self.lista.insert(indice, "✔ " + texto)
                self.lista.itemconfig(indice, fg="gray")  # Muda a cor só desse item

    def remover(self):
        indice = self.selecionado()
        if indice is not None:
            self.lista.delete(indice)

    def limpar(self):
        # askyesno devolve True (Sim) ou False (Não)
        if messagebox.askyesno("Confirmar", "Apagar todas as tarefas?"):
            self.lista.delete(0, tk.END)


# Ponto de entrada: só roda se o arquivo for executado diretamente
if __name__ == "__main__":
    raiz = tk.Tk()
    app = ListaDeTarefas(raiz)
    raiz.mainloop()
