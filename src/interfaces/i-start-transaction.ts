// #region Interfaces (2)

/**
 * INFORMAÇÕES DE INTERFACE PARA REQUISIÇÃO DE INÍCIO DE TRANSAÇÃO
 */
export interface IStartTransaction {
  // #region Properties (12)

  /**
   * OPERADOR DE CAIXA - Identificação do operador de caixa
   *
   * EXEMPLO: Terminal01
   */
  cashierOperator: string;
  /**
   * FORMA DE PAGAMENTO - Conforme tabela "Códigos de Funções"
   * Número
   *
   * 1 - Cheque (SEM FUNCIONAMENTO);
   * 2 - Cartão de Débito;
   * 3 - Cartão de Crédito;
   * 4 - Cartão Private (REDE NÃO HABILITADA);
   * 5 - Confirmação de Pre-autorização.
   */
  functionalId: string;
  /**
   * TIPO DE PAGAMENTO
   *
   * Caso 'functionalId' for 2 (Débito):
   *      - 1: A Vista;
   *      - 2: Compra e Saque;
   *      - 3: Consulta Parcelas CDC;
   *      - 4: CDC.
   *
   * Caso 'functionalId' for 3 (Crédito):
   *      - 1: A Vista;
   *      - 2: Parcelado pelo Estabelecimento;
   *      - 3: Parcelado pela Administradora;
   *      - 4: Consulta parcelamento.
   *
   * Caso 'functionalId' for 5 (Pre-autorização):
   *      - 1: A Vista;
   *      - 2: Parcelado pelo Estabelecimento.
   */
  functionalType: string;
  /**
   * ENDEREÇO IP - Nome ou endereço do servidor SiTef (EM NOTAÇÃO ".")
   * Número
   *
   * EXEMPLO: 192.168.0.200
   */
  sitefIp: string;
  /**
   * IDENTIFICAÇÃO DA LOJA - Perante a rede de estabelecimento comercial
   * Número
   *
   * EXEMPLO: 12345678
   */
  storeId: string;
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
  terminalId: string;
  /**
   * PARÂMETROS ADICIONAIS - Permite que o aplicativo limite
   * o tipo de meio de pagamento. Ele é opcional e pode ser passado
   * vazio (“”). Quando esse campo for utilizado a CliSiTef irá
   * limitar os menus de navegação apenas aos códigos não presentes na lista.
   */
  trnAdditionalParameters: string;
  /**
   * VALOR A SER PAGO - Valor da transação
   * (Valor decimal contendo o separador ",". Deve ser passado com 2 (duas)
   * casas decimais após a vírgula. Em caso da operação não ter valor definido
   * a priori (como por exemplo recarga pré-pago) esse campo deve vir vazio)
   *
   * EXEMPLO: 10,00
   */
  trnAmount: string;
  /**
   * PARÂMETROS ADICIONAIS - Parâmetros adicionais para a configuração
   * da CliSiTef (função ConfiguraIntSiTefInterativo).
   */
  trnInitParameters: string;

  // #endregion Properties (12)
}

export interface IStartTransactionResponse {
  // #region Properties (4)

  /**
   * RESULTADO DE RESPOSTA - Resultado da chamada de rotina IniciaFuncaoSiTefInterativo.
   * Número
   *
   * Deve-se proceder à chamada de "continueTransaction" caso o valor seja 10000.
   */
  clisitefStatus: number;
  /**
   * MENSAGEM DO SERVIÇO - Mensagem de retorno do serviço.
   * Texto
   *
   * É recebida somente em caso do STATUS DO SERVIÇO ser 1.
   */
  serviceMessage?: string;
  /**
   * STATUS DO SERVIÇO - Número que indica o estado de consumo.
   * Número
   *
   * 0 - OK;
   * 1 - NÃO OK.
   */
  serviceStatus: number;
  /**
   * CHAVE DE SESSÃO - Identificação da sessão com o agente.
   * Texto
   *
   * Este código deve ser enviado em todas as chamadas de serviços subsequentes.
   */
  sessionId?: string;

  // #endregion Properties (4)
}

// #endregion Interfaces (2)
