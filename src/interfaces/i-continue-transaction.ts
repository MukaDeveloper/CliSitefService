/**
 * INFORMAÇÕES DE INTERFACE PARA REQUISIÇÃO DE INÍCIO DE TRANSAÇÃO
 */

export interface IContinueTransaction {
    /**
     * CÓDIGO DE SESSÃO - Número da sessão de transação
     * Texto
     * 
     * Informado na resposta da requisição /startTransaction
     * EXEMPLO: 78a7b02
     */
    sessionId: string;
    /**
     * INFORMAÇÕES DA TRANSAÇÃO - Dados coletados pela aplicação, a
     * serem passados para a CliSiTef
     * Texto
     * 
     * Se automação não estiver enviando dados para a CliSiTef (ou for a 
     * primeira chamada do serviço), deve * passar esse campo vazio (“”).
     */
    data: string;
    /**
     * CÓDIGO DE CONTINUIDADE - Número recebido para prosseguir com a transação
     * de acordo com a automação comercial.
     * Número
     * 
     * -1 --> Encerra a transação.
     * 0 --> Prossegue com a transação normalmente.
     * 1 --> Retorna, se possível, à coleta ao campo anterior.
     * 2 --> Cancela o pagamento de conta atual, mantendo os anteriores em memória,
     * caso existam, permitindo que tais pagamentos sejam enviados para o SiTef e
     * até mesmo permite incluir novos pagamentos. Retorno válido apenas nas coletas
     * de valores e data de vencimento de um pagamento de contas.
     */
    continue: string;
}

export interface IContinueTransactionResponse {
    /**
     * STATUS DO SERVIÇO - Número que indica o estado de consumo.
     * Número
     *
     * 0 - OK
     * 1 - NÃO OK
     */
    serviceStatus: number;
    /**
     * MENSAGEM DO SERVIÇO - Mensagem de retorno do serviço.
     * Texto
     *
     * É recebida somente em caso do STATUS DO SERVIÇO ser 1.
     */
    serviceMessage?: string;
    /**
     * RESULTADO DE RESPOSTA - Resultado da chamada de rotina IniciaFuncaoSiTefInterativo.
     * Número
     *
     * Deve-se proceder à chamada de "continueTransaction" caso o valor seja 10000.
     */
    clisitefStatus: number;
    data: string;
    commandId: number;
    fieldId: number;
    fieldMinLength: number;
    fieldMaxLength: number;
}