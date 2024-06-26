export interface ISendStatus {
    /**
     * STATUS DA MENSAGEM - Número que indica se a mensagem é passível
     * de ser exibida ao usuário.
     * 
     * 0 - Não exibir a mensagem;
     * 1 - Exibir a mensagem;
     * 2 - Mensagem de Log.
     */
    status: number;
    /**
     * MENSAGEM - Mensagem a ser enviada pelo serviço de eventos.
     * 
     * Essa mensagem por padrão é recebida do agente da CliSiTef.
     */
    message: string;
}