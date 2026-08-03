import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ReceberDados")
public class ReceberDados extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String nome = request.getParameter("nome");
        String idade = request.getParameter("idade");
        String cidade = request.getParameter("cidade");

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<h2>Dados Recebidos</h2>");
        out.println("Nome: " + nome + "<br>");
        out.println("Idade: " + idade + "<br>");
        out.println("Cidade: " + cidade + "<br>");
    }
}