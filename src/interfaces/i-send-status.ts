export interface ISendStatus {
  // #region Properties (2)

  /**
   * MENSAGEM - Mensagem a ser enviada pelo serviço de eventos.
   *
   * Essa mensagem por padrão é recebida do agente da CliSiTef.
   */
  message: string;
  /**
   * STATUS DA MENSAGEM - Número que indica se a mensagem é passível
   * de ser exibida ao usuário.
   */
  status: number;

  // #endregion Properties (2)
}
