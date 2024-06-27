export interface IFinishTransaction {
  // #region Properties (8)

  /**
   * CONFIRMAÇÃO - Indica se a transação deve ser confirmada ou estornada
   *
   * 0 - Estornar
   * 1 - Confirmar
   */
  confirm: string;
  /**
   * CHAVE DE SESSÃO - Identificação da sessão com o agente.
   * Texto
   *
   * Este código deve ser enviado em todas as chamadas de serviços subsequentes.
   */
  sessionId?: string;
  /**
   * ENDEREÇO IP - Nome ou endereço do servidor SiTef (EM NOTAÇÃO ".")
   * Número
   *
   * EXEMPLO: 192.168.0.200
   */
  sitefIp?: string;
  /**
   * IDENTIFICAÇÃO DA LOJA - Perante a rede de estabelecimento comercial
   * Número
   *
   * EXEMPLO: 12345678
   */
  storeId?: string;
  /**
   * DATA FISCAL - Data fiscal no formato AAAAMMDD
   *
   * EXEMPLO: 20240612
   */
  taxInvoiceDate: string;
  /**
   * NÚMERO CUPOM FISCAL - Número do Cupom Fiscal correspondente à venda
   *
   * EXEMPLO: 1234
   */
  taxInvoiceNumber: string;
  /**
   * HORA FISCAL - Hora fiscal no formato HHMMSS
   *
   * EXEMPLO: 145036
   */
  taxInvoiceTime: string;
  /**
   * IDENTIFICAÇÃO DO CAIXA (PDV) - Número interno do caixa na loja
   * Texto
   *
   * (Formato XXnnnnnn onde XX corresponde a 2 (dois) caracteres alfabéticos
   * e nnnnnn são 6 (seis) dígitos quaisquer desde que o número restante não
   * sobreponha a faixa 000900 a 000999 que é reservada para uso pelo SiTef)
   *
   * EXEMPLO: AB123456
   */
  terminalId?: string;

  // #endregion Properties (8)
}
